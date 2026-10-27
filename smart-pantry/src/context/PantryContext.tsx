
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";

import { addDaysToDateKey } from "@/lib/expiry";
import type { PantryItem } from "@/types/pantry";

type NewPantryItem = Omit<PantryItem, "id">;

type PantryContextValue = {
    items: PantryItem[];
    addItem: (item: NewPantryItem) => void;
};

const PantryContext = createContext<PantryContextValue | undefined>(
    undefined,
);

function createInitialItems(): PantryItem[] {
    return [
        {
            id: "milk-1",
            name: "Milk",
            quantity: 1,
            unit: "carton",
            location: "Fridge",
            expiryDate: addDaysToDateKey(0),
        },
        {
            id: "spinach-1",
            name: "Spinach",
            quantity: 1,
            unit: "bag",
            location: "Fridge",
            expiryDate: addDaysToDateKey(2),
        },
        {
            id: "yogurt-1",
            name: "Yogurt",
            quantity: 4,
            unit: "cups",
            location: "Fridge",
            expiryDate: addDaysToDateKey(6),
        },
        {
            id: "rice-1",
            name: "Rice",
            quantity: 1,
            unit: "kg",
            location: "Pantry",
            expiryDate: addDaysToDateKey(20),
        },
        {
            id: "peas-1",
            name: "Frozen peas",
            quantity: 1,
            unit: "bag",
            location: "Freezer",
            expiryDate: addDaysToDateKey(45),
        },
    ];
}

export function PantryProvider({ children }: PropsWithChildren) {
    const [items, setItems] = useState<PantryItem[]>(createInitialItems);

    const addItem = useCallback((newItem: NewPantryItem) => {
        const item: PantryItem = {
            ...newItem,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        };

        setItems((currentItems) => [item, ...currentItems]);
    }, []);

    const value = useMemo(
        () => ({ items, addItem }),
        [items, addItem],
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
        throw new Error("usePantry must be used inside PantryProvider.");
    }

    return context;
}
