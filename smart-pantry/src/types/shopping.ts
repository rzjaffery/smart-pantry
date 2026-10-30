
/**
 * Represents one entry in the Smart Pantry shopping list.
 */
export type ShoppingListItem = {
    // Unique ID for this shopping-list entry.
    id: string;

    // Normalized ingredient name used for duplicate detection.
    // Example: "dark chocolate" becomes "chocolate".
    ingredientKey: string;

    // Name displayed to the user.
    name: string;

    // Amounts collected from manual additions or recipes.
    // We keep different units separate rather than guessing conversions.
    amounts: string[];

    // Whether the item has been purchased.
    isPurchased: boolean;

    // When the entry was first created.
    createdAt: string;

    // Recipes that contributed this ingredient.
    sourceRecipeIds: string[];
};

/**
 * Input used when adding a new shopping-list entry.
 */
export type NewShoppingListItem = {
    name: string;
    amount?: string;
    sourceRecipeId?: string;
};

/**
 * Input used when editing an existing entry.
 */
export type ShoppingListItemUpdates = {
    name?: string;
    amounts?: string[];
    isPurchased?: boolean;
};

/**
 * Summary used for the shopping-list progress display.
 */
export type ShoppingListSummary = {
    total: number;
    purchased: number;
    remaining: number;
    progress: number;
};
