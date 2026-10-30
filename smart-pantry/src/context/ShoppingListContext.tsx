
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {NewShoppingListItem, ShoppingListItem, ShoppingListItemUpdates,} from "@/types/shopping";

const STORAGE_KEY = "@smart-pantry/shopping-list";

type ShoppingListContextValue = {
    items: ShoppingListItem[];
    isLoading: boolean;
    storageError: string | null;

    addItem: (input: NewShoppingListItem) => Promise<void>;
    addItems: (inputs: NewShoppingListItem[]) => Promise<void>;
    togglePurchased: (id: string) => Promise<void>;
    updateItem: (
        id: string,
        updates: ShoppingListItemUpdates,
    ) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    clearPurchased: () => Promise<void>;
};

const ShoppingListContext =
    createContext<ShoppingListContextValue | undefined>(undefined);

function normalizeIngredientKey(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}

function normalizeAmount(amount: string): string {
    return amount.trim().toLowerCase();
}

function createShoppingItemId(): string {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 10)
    );
}

function mergeUniqueStrings(
    existing: string[],
    incoming: string[],
    normalize: (value: string) => string,
): string[] {
    const result = [...existing];
    const knownValues = new Set(
        existing.map(normalize).filter(Boolean),
    );

    for (const value of incoming) {
        const cleaned = value.trim();
        const key = normalize(cleaned);

        if (key && !knownValues.has(key)) {
            result.push(cleaned);
            knownValues.add(key);
        }
    }

    return result;
}

function isShoppingListItem(
    value: unknown,
): value is ShoppingListItem {
    if (!value || typeof value !== "object") {
        return false;
    }

    const item = value as Record<string, unknown>;

    return (
        typeof item.id === "string" &&
        typeof item.ingredientKey === "string" &&
        typeof item.name === "string" &&
        Array.isArray(item.amounts) &&
        item.amounts.every(
            (amount) => typeof amount === "string",
        ) &&
        typeof item.isPurchased === "boolean" &&
        typeof item.createdAt === "string" &&
        Array.isArray(item.sourceRecipeIds) &&
        item.sourceRecipeIds.every(
            (id) => typeof id === "string",
        )
    );
}

export function ShoppingListProvider({children,}: { children: ReactNode; }) {
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageError, setStorageError] = useState<string | null>(null);

    // Keep the latest saved data available to queued mutations.
    const itemsRef = useRef<ShoppingListItem[]>([]);

    // Prevent changes from writing over one another.
    const mutationQueueRef = useRef<Promise<void>>(Promise.resolve(),);
    const hasLoadedRef = useRef(false);

    // Load saved shopping-list data.
    useEffect(() => {
        let active = true;

        async function loadShoppingList() {
            try {
                const savedData =
                    await AsyncStorage.getItem(STORAGE_KEY);

                if (!savedData) {
                    return;
                }

                const parsed: unknown = JSON.parse(savedData);

                if (!Array.isArray(parsed)) {
                    throw new Error(
                        "Saved shopping-list data is not a valid array.",
                    );
                }

                const validItems = parsed.filter(
                    isShoppingListItem,
                );

                if (validItems.length !== parsed.length) {
                    throw new Error(
                        "Some saved shopping-list entries are invalid.",
                    );
                }

                if (active) {
                    itemsRef.current = validItems;
                    setItems(validItems);
                    setStorageError(null);
                }
            } catch (error) {
                console.error(
                    "Failed to load shopping list:",
                    error,
                );

                if (active) {
                    setStorageError(
                        "Your saved shopping list could not be loaded.",
                    );
                }
            } finally {
                hasLoadedRef.current = true;

                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void loadShoppingList();

        return () => {
            active = false;
        };
    }, []);

    // Apply a mutation and persist it before updating visible state.
    const persistMutation = useCallback(
        (
            updater: (
                currentItems: ShoppingListItem[],
            ) => ShoppingListItem[],
        ): Promise<void> => {
            const operation =
                mutationQueueRef.current.then(async () => {
                    if (!hasLoadedRef.current) {
                        throw new Error(
                            "Shopping list is still loading.",
                        );
                    }

                    const nextItems = updater(itemsRef.current);

                    await AsyncStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(nextItems),
                    );

                    itemsRef.current = nextItems;
                    setItems(nextItems);
                    setStorageError(null);
                });

            // Keep the queue usable even if one operation fails.
            mutationQueueRef.current = operation.catch(
                (error: unknown) => {
                    console.error(
                        "Shopping-list update failed:",
                        error,
                    );

                    setStorageError(
                        "Your shopping-list changes could not be saved. Please try again.",
                    );
                },
            );

            return operation;
        },
        [],
    );

    // Add multiple ingredients and merge exact duplicate names.
    const addItems = useCallback(
        (inputs: NewShoppingListItem[]): Promise<void> => {
            return persistMutation((currentItems) => {
                const nextItems = [...currentItems];

                for (const input of inputs) {
                    const name = input.name.trim();

                    if (!name) {
                        throw new Error(
                            "Shopping-list item names cannot be empty.",
                        );
                    }

                    const ingredientKey =
                        normalizeIngredientKey(name);

                    const amount = input.amount?.trim() ?? "";

                    const existingIndex = nextItems.findIndex(
                        (item) =>
                            item.ingredientKey === ingredientKey,
                    );

                    if (existingIndex >= 0) {
                        const existing =
                            nextItems[existingIndex];

                        const sourceRecipeIds =
                            input.sourceRecipeId
                                ? mergeUniqueStrings(
                                    existing.sourceRecipeIds,
                                    [input.sourceRecipeId],
                                    (value) => value,
                                )
                                : existing.sourceRecipeIds;

                        nextItems[existingIndex] = {
                            ...existing,
                            amounts: amount
                                ? mergeUniqueStrings(
                                    existing.amounts,
                                    [amount],
                                    normalizeAmount,
                                )
                                : existing.amounts,
                            sourceRecipeIds,
                        };
                    } else {
                        nextItems.push({
                            id: createShoppingItemId(),
                            ingredientKey,
                            name,
                            amounts: amount ? [amount] : [],
                            isPurchased: false,
                            createdAt: new Date().toISOString(),
                            sourceRecipeIds:
                                input.sourceRecipeId
                                    ? [input.sourceRecipeId]
                                    : [],
                        });
                    }
                }

                return nextItems;
            });
        },
        [persistMutation],
    );

    const addItem = useCallback(
        (input: NewShoppingListItem): Promise<void> =>
            addItems([input]),
        [addItems],
    );

    // Toggle an item's purchased status.
    const togglePurchased = useCallback(
        (id: string): Promise<void> =>
            persistMutation((currentItems) => {
                const exists = currentItems.some(
                    (item) => item.id === id,
                );

                if (!exists) {
                    throw new Error(
                        "Shopping-list item was not found.",
                    );
                }

                return currentItems.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            isPurchased: !item.isPurchased,
                        }
                        : item,
                );
            }),
        [persistMutation],
    );

    // Update an existing entry.
    const updateItem = useCallback(
        (
            id: string,
            updates: ShoppingListItemUpdates,
        ): Promise<void> =>
            persistMutation((currentItems) => {
                const index = currentItems.findIndex(
                    (item) => item.id === id,
                );

                if (index < 0) {
                    throw new Error(
                        "Shopping-list item was not found.",
                    );
                }

                const existing = currentItems[index];

                const name =
                    updates.name?.trim() ?? existing.name;

                if (!name) {
                    throw new Error(
                        "Shopping-list item name cannot be empty.",
                    );
                }

                const ingredientKey =
                    normalizeIngredientKey(name);

                const duplicateExists = currentItems.some(
                    (item, itemIndex) =>
                        itemIndex !== index &&
                        item.ingredientKey === ingredientKey,
                );

                if (duplicateExists) {
                    throw new Error(
                        "An item with this name is already on your shopping list.",
                    );
                }

                const nextItems = [...currentItems];

                nextItems[index] = {
                    ...existing,
                    name,
                    ingredientKey,
                    amounts: updates.amounts
                        ? mergeUniqueStrings(
                            [],
                            updates.amounts,
                            normalizeAmount,
                        )
                        : existing.amounts,
                    isPurchased:
                        updates.isPurchased ??
                        existing.isPurchased,
                };

                return nextItems;
            }),
        [persistMutation],
    );

    // Delete an entry.
    const deleteItem = useCallback(
        (id: string): Promise<void> =>
            persistMutation((currentItems) => {
                const exists = currentItems.some(
                    (item) => item.id === id,
                );

                if (!exists) {
                    throw new Error(
                        "Shopping-list item was not found.",
                    );
                }

                return currentItems.filter(
                    (item) => item.id !== id,
                );
            }),
        [persistMutation],
    );

    // Remove only entries that have been purchased.
    const clearPurchased = useCallback(
        (): Promise<void> =>
            persistMutation((currentItems) =>
                currentItems.filter(
                    (item) => !item.isPurchased,
                ),
            ),
        [persistMutation],
    );

    const value = useMemo<ShoppingListContextValue>(
        () => ({
            items,
            isLoading,
            storageError,
            addItem,
            addItems,
            togglePurchased,
            updateItem,
            deleteItem,
            clearPurchased,
        }),
        [
            items,
            isLoading,
            storageError,
            addItem,
            addItems,
            togglePurchased,
            updateItem,
            deleteItem,
            clearPurchased,
        ],
    );

    return (
        <ShoppingListContext.Provider value={value}>
            {children}
        </ShoppingListContext.Provider>
    );
}

export function useShoppingList() {
    const context = useContext(ShoppingListContext);

    if (!context) {
        throw new Error(
            "useShoppingList must be used inside ShoppingListProvider.",
        );
    }

    return context;
}
