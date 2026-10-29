
import type { PantryItem } from "@/types/pantry";

import { LOCAL_RECIPE_CATALOG } from "./recipeCatalog";

import type {
    LocalRecipe,
    LocalRecipeMatch,
    RecipeIngredient,
} from "./recipeTypes";

const INGREDIENT_ALIASES: Record<string, string> = {
    eggs: "egg",
    "egg whites": "egg",
    "egg white": "egg",

    tomatoes: "tomato",
    potatoes: "potato",
    onions: "onion",
    carrots: "carrot",
    apples: "apple",
    bananas: "banana",
    mushrooms: "mushroom",

    "bell peppers": "bell pepper",
    capsicum: "bell pepper",
    capsicums: "bell pepper",

    "dark chocolate": "chocolate",
    "milk chocolate": "chocolate",
    "white chocolate": "chocolate",
    "chocolate bar": "chocolate",
    "chocolate chips": "chocolate",
    "choc chips": "chocolate",
    cocoa: "cocoa powder",

    "all purpose flour": "flour",
    "all-purpose flour": "flour",
    "plain flour": "flour",
    maida: "flour",
    atta: "whole wheat flour",
    "wholemeal flour": "whole wheat flour",
    "wheat flour": "whole wheat flour",

    "fresh milk": "milk",
    "whole milk": "milk",
    "full cream milk": "milk",
    "low fat milk": "milk",
    "skimmed milk": "milk",

    yoghurt: "yogurt",
    curd: "yogurt",
    "plain yogurt": "yogurt",
    "greek yogurt": "yogurt",

    "rolled oats": "oats",
    "porridge oats": "oats",

    "green peas": "peas",
    "frozen peas": "peas",

    chickpeas: "chickpea",
    "chick pea": "chickpea",
    "garbanzo beans": "chickpea",

    "vegetable oil": "oil",
    "cooking oil": "oil",
    "sunflower oil": "oil",
    "olive oil": "oil",

    "bread slices": "bread",
    "baking powder": "baking powder",
};

export function normalizeIngredientKey(name: string): string {
    const normalized = name
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/[()[\],]/g, " ")
        .replace(
            /^(?:(?:fresh|organic|frozen|canned|dried|chopped|sliced|raw|large|small|medium|ripe|peeled|grated|minced|ground|crushed)\s+)+/,
            "",
        )
        .replace(/\s+/g, " ")
        .trim();

    return INGREDIENT_ALIASES[normalized] ?? normalized;
}

function getIngredientKeys(
    ingredient: RecipeIngredient,
): Set<string> {
    return new Set(
        ingredient.matchKeys
            .map(normalizeIngredientKey)
            .filter(Boolean),
    );
}

/**
 * Determines whether a recipe ingredient can be matched to
 * at least one ingredient currently available in the pantry.
 *
 * The caller decides whether expired pantry items are eligible.
 */
export function isIngredientAvailable(
    ingredient: RecipeIngredient,
    pantryItems: readonly PantryItem[],
): boolean {
    const pantryKeys = new Set(
        pantryItems
            .map((item) => normalizeIngredientKey(item.name))
            .filter(Boolean),
    );

    for (const key of getIngredientKeys(ingredient)) {
        if (pantryKeys.has(key)) {
            return true;
        }
    }

    return false;
}

export function rankRecipesForPantry(
    pantryItems: readonly PantryItem[],
    recipes: readonly LocalRecipe[] = LOCAL_RECIPE_CATALOG,
    priorityItems: readonly PantryItem[] = [],
): LocalRecipeMatch[] {
    // Map: normalized ingredient key -> display name.
    const pantryByKey = new Map<string, string>();

    for (const item of pantryItems) {
        const key = normalizeIngredientKey(item.name);

        if (key && !pantryByKey.has(key)) {
            pantryByKey.set(key, item.name);
        }
    }

    const pantryKeys = new Set(pantryByKey.keys());

    // A second map allows us to prioritize expiring ingredients.
    const priorityByKey = new Map<string, string>();

    for (const item of priorityItems) {
        const key = normalizeIngredientKey(item.name);

        if (key && pantryByKey.has(key) && !priorityByKey.has(key)) {
            priorityByKey.set(key, item.name);
        }
    }

    const priorityKeys = new Set(priorityByKey.keys());

    const matches: LocalRecipeMatch[] = [];

    for (const recipe of recipes) {
        const requiredIngredients = recipe.ingredients.filter(
            (ingredient) => !ingredient.optional,
        );

        const matchedRequired: RecipeIngredient[] = [];
        const missingIngredients: RecipeIngredient[] = [];

        const matchedKeys = new Set<string>();
        const matchedPriorityKeys = new Set<string>();

        for (const ingredient of requiredIngredients) {
            const keys = Array.from(getIngredientKeys(ingredient));

            const availableKeys = keys.filter((key) =>
                pantryKeys.has(key),
            );

            if (availableKeys.length === 0) {
                missingIngredients.push(ingredient);
                continue;
            }

            matchedRequired.push(ingredient);

            // Prefer an expiring pantry ingredient if it matches.
            // Otherwise, use the first available ingredient key.
            const priorityKey = availableKeys.find((key) =>
                priorityKeys.has(key),
            );

            const selectedKey = priorityKey ?? availableKeys[0];

            matchedKeys.add(selectedKey);

            if (priorityKey) {
                matchedPriorityKeys.add(priorityKey);
            }
        }

        // Don't show recipes that match none of the user's ingredients.
        if (matchedKeys.size === 0) {
            continue;
        }

        const matchedIngredientKeys = Array.from(matchedKeys);

        const matchedIngredients = matchedIngredientKeys
            .map((key) => pantryByKey.get(key))
            .filter((name): name is string => Boolean(name));

        const matchedExpiringIngredients = Array.from(
            matchedPriorityKeys,
        )
            .map((key) => priorityByKey.get(key))
            .filter((name): name is string => Boolean(name));

        const requiredIngredientCount = requiredIngredients.length;

        const matchRatio =
            requiredIngredientCount === 0
                ? 0
                : matchedRequired.length / requiredIngredientCount;

        matches.push({
            recipe,
            matchedIngredients,
            matchedExpiringIngredients,
            matchedIngredientKeys,
            missingIngredients,
            matchedCount: matchedKeys.size,
            expiringMatchCount: matchedPriorityKeys.size,
            requiredIngredientCount,
            matchRatio,
        });
    }

    // First prioritize recipes that use more expiring ingredients.
    // Then prefer recipes that use more of the available pantry.
    return matches.sort(
        (a, b) =>
            b.expiringMatchCount - a.expiringMatchCount ||
            b.matchedCount - a.matchedCount ||
            b.matchRatio - a.matchRatio ||
            a.recipe.title.localeCompare(b.recipe.title),
    );
}
