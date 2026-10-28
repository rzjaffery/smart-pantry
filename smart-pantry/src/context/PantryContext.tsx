
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

import { PANTRY_LOCATIONS } from "../types/pantry";
import type {
    PantryHistoryEntry,
    PantryItem,
    PantryOutcome,
} from "../types/pantry";

const STORAGE_KEY = "@smart-pantry/pantry-items";

type PantrySnapshot = {
    items: PantryItem[];
    history: PantryHistoryEntry[];
};

type NewPantryItem = Omit<PantryItem, "id">;

type PantryContextValue = {
    items: PantryItem[];
    history: PantryHistoryEntry[];
    isLoading: boolean;
    storageError: string | null;
    addItem: (item: NewPantryItem) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    updateItem: (
        id: string,
        updates: NewPantryItem,
    ) => Promise<void>;
    completeItem: (
        id: string,
        outcome: PantryOutcome,
    ) => Promise<void>;
};

const PantryContext = createContext<
    PantryContextValue | undefined
>(undefined);

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isPantryItem(value: unknown): value is PantryItem {
    if (!isRecord(value)) return false;

    return (
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        value.name.trim().length > 0 &&
        typeof value.quantity === "number" &&
        Number.isFinite(value.quantity) &&
        value.quantity > 0 &&
        typeof value.unit === "string" &&
        typeof value.location === "string" &&
        (PANTRY_LOCATIONS as readonly string[]).includes(
            value.location,
        ) &&
        typeof value.expiryDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.expiryDate)
    );
}

function isHistoryEntry(
    value: unknown,
): value is PantryHistoryEntry {
    if (!isRecord(value)) return false;

    return (
        isPantryItem(value.item) &&
        (value.outcome === "consumed" ||
            value.outcome === "wasted") &&
        typeof value.completedAt === "string" &&
        !Number.isNaN(Date.parse(value.completedAt))
    );
}

export function PantryProvider({
                                   children,
                               }: PropsWithChildren) {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [history, setHistory] = useState<PantryHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageError, setStorageError] = useState<string | null>(
        null,
    );

    const itemsRef = useRef<PantryItem[]>([]);
    const historyRef = useRef<PantryHistoryEntry[]>([]);
    const storageReadyRef = useRef(false);

    // Serialize writes so rapid actions cannot overwrite a newer
    // pantry snapshot with an older one.
    const mutationQueueRef = useRef<Promise<void>>(
        Promise.resolve(),
    );

    useEffect(() => {
        let mounted = true;

        async function loadItems() {
            try {
                const storedValue =
                    await AsyncStorage.getItem(STORAGE_KEY);

                let snapshot: PantrySnapshot = {
                    items: [],
                    history: [],
                };

                if (storedValue !== null) {
                    const parsed: unknown = JSON.parse(storedValue);

                    // Migration: the earlier app stored a plain array.
                    if (Array.isArray(parsed)) {
                        if (!parsed.every(isPantryItem)) {
                            throw new Error("Invalid saved pantry items.");
                        }

                        snapshot = {
                            items: parsed,
                            history: [],
                        };
                    } else if (
                        isRecord(parsed) &&
                        Array.isArray(parsed.items) &&
                        Array.isArray(parsed.history) &&
                        parsed.items.every(isPantryItem) &&
                        parsed.history.every(isHistoryEntry)
                    ) {
                        snapshot = {
                            items: parsed.items,
                            history: parsed.history,
                        };
                    } else {
                        throw new Error("Invalid saved pantry data.");
                    }
                }

                if (mounted) {
                    itemsRef.current = snapshot.items;
                    historyRef.current = snapshot.history;
                    storageReadyRef.current = true;

                    setItems(snapshot.items);
                    setHistory(snapshot.history);
                    setStorageError(null);
                }
            } catch (error) {
                console.error("Failed to load pantry:", error);

                if (mounted) {
                    // Protect any saved data we could not read.
                    storageReadyRef.current = false;
                    setStorageError(
                        "We couldn't read your saved pantry. Your data is protected, and changes are temporarily disabled.",
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

    const persistMutation = useCallback(
        (
            buildNext: (
                currentItems: PantryItem[],
                currentHistory: PantryHistoryEntry[],
            ) => PantrySnapshot,
        ): Promise<void> => {
            const operation = mutationQueueRef.current.then(
                async () => {
                    try {
                        if (!storageReadyRef.current) {
                            throw new Error(
                                "Pantry storage is not ready.",
                            );
                        }

                        const next = buildNext(
                            itemsRef.current,
                            historyRef.current,
                        );

                        // Write one snapshot containing both lists.
                        await AsyncStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify(next),
                        );

                        // Update the visible UI only after saving succeeds.
                        itemsRef.current = next.items;
                        historyRef.current = next.history;

                        setItems(next.items);
                        setHistory(next.history);
                        setStorageError(null);
                    } catch (error) {
                        console.error("Failed to save pantry:", error);
                        setStorageError(
                            "Your change couldn't be saved. Please try again.",
                        );
                        throw error;
                    }
                },
            );

            // Keep the queue usable even if a previous operation failed.
            mutationQueueRef.current = operation.then(
                () => undefined,
                () => undefined,
            );

            return operation;
        },
        [],
    );

    const addItem = useCallback(
        (newItem: NewPantryItem): Promise<void> =>
            persistMutation((currentItems, currentHistory) => {
                const item: PantryItem = {
                    ...newItem,
                    id: `${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 9)}`,
                };

                return {
                    items: [item, ...currentItems],
                    history: currentHistory,
                };
            }),
        [persistMutation],
    );

    const updateItem = useCallback(
        (
            id: string,
            updates: NewPantryItem,
        ): Promise<void> =>
            persistMutation((currentItems, currentHistory) => {
                const existingItem = currentItems.find(
                    (candidate) => candidate.id === id,
                );

                if (!existingItem) {
                    throw new Error("Pantry item was not found.");
                }

                const updatedItem: PantryItem = {
                    ...existingItem,
                    ...updates,
                };

                return {
                    items: currentItems.map((candidate) =>
                        candidate.id === id
                            ? updatedItem
                            : candidate,
                    ),
                    history: currentHistory,
                };
            }),
        [persistMutation],
    );

    const deleteItem = useCallback(
        (id: string): Promise<void> =>
            persistMutation((currentItems, currentHistory) => {
                const itemExists = currentItems.some(
                    (item) => item.id === id,
                );

                if (!itemExists) {
                    throw new Error("Pantry item was not found.");
                }

                return {
                    items: currentItems.filter(
                        (item) => item.id !== id,
                    ),
                    history: currentHistory,
                };
            }),
        [persistMutation],
    );

    const completeItem = useCallback(
        (
            id: string,
            outcome: PantryOutcome,
        ): Promise<void> =>
            persistMutation((currentItems, currentHistory) => {
                const item = currentItems.find(
                    (candidate) => candidate.id === id,
                );

                if (!item) {
                    throw new Error("Pantry item was not found.");
                }

                const entry: PantryHistoryEntry = {
                    item,
                    outcome,
                    completedAt: new Date().toISOString(),
                };

                return {
                    items: currentItems.filter(
                        (candidate) => candidate.id !== id,
                    ),
                    history: [entry, ...currentHistory],
                };
            }),
        [persistMutation],
    );

    const value = useMemo(
        () => ({
            items,
            history,
            isLoading,
            storageError,
            addItem,
            updateItem,
            deleteItem,
            completeItem,
        }),
        [
            items,
            history,
            isLoading,
            storageError,
            addItem,
            updateItem,
            deleteItem,
            completeItem,
        ],
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
