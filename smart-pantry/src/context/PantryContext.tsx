
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";

import {
    PANTRY_LOCATIONS,
    type PantryItem,
} from "@/types/pantry";

type NewPantryItem = Omit<PantryItem, "id">;

type PantryContextValue = {
    items: PantryItem[];
    isLoading: boolean;
    storageError: string | null;
    addItem: (item: NewPantryItem) => Promise<void>;
};

const STORAGE_KEY = "@smart-pantry/pantry-items";

const PantryContext = createContext<
    PantryContextValue | undefined
>(undefined);

function isPantryItem(value: unknown): value is PantryItem {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const item = value as Record<string, unknown>;

    return (
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        item.name.trim().length > 0 &&
        typeof item.quantity === "number" &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        typeof item.unit === "string" &&
        typeof item.location === "string" &&
        (PANTRY_LOCATIONS as readonly string[]).includes(
            item.location,
        ) &&
        typeof item.expiryDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.expiryDate)
    );
}

export function PantryProvider({
                                   children,
                               }: PropsWithChildren) {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageError, setStorageError] = useState<string | null>(
        null,
    );

    // Keeps the latest committed items available to addItem.
    const itemsRef = useRef<PantryItem[]>([]);

    useEffect(() => {
        let mounted = true;

        async function loadItems() {
            try {
                const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

                const parsed: unknown =
                    storedValue === null ? [] : JSON.parse(storedValue);

                if (
                    !Array.isArray(parsed) ||
                    !parsed.every(isPantryItem)
                ) {
                    throw new Error("Saved pantry data has an invalid format.");
                }

                if (mounted) {
                    itemsRef.current = parsed;
                    setItems(parsed);
                    setStorageError(null);
                }
            } catch (error) {
                console.error("Failed to load pantry items:", error);

                if (mounted) {
                    setStorageError(
                        "We couldn't load your saved pantry items. Adding an item may replace unreadable saved data.",
                    );
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadItems();

        return () => {
            mounted = false;
        };
    }, []);

    const addItem = useCallback(
        async (newItem: NewPantryItem) => {
            if (isLoading) {
                throw new Error("Your pantry is still loading.");
            }

            const item: PantryItem = {
                ...newItem,
                id: `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 9)}`,
            };

            const nextItems = [item, ...itemsRef.current];

            try {
                // Save successfully before updating the visible list.
                await AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(nextItems),
                );

                itemsRef.current = nextItems;
                setItems(nextItems);
                setStorageError(null);
            } catch (error) {
                console.error("Failed to save pantry item:", error);

                setStorageError(
                    "We couldn't save your item. Please try again.",
                );

                throw error;
            }
        },
        [isLoading],
    );

    const value = useMemo(
        () => ({
            items,
            isLoading,
            storageError,
            addItem,
        }),
        [items, isLoading, storageError, addItem],
    );

    return (
        <PantryContext.Provider value={value}>
            {children}
        </PantryContext.Provider>
    );
}

export function usePantry(): PantryContextValue {
    const context = useContext(PantryContext);

    if (!context) {
        throw new Error(
            "usePantry must be used inside PantryProvider.",
        );
    }

    return context;
}
