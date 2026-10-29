
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
    "cherry tomatoes": "tomato",
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

    "chickpeas": "chickpea",
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

function ingredientMatchesPantry(
    ingredient: RecipeIngredient,
    pantryKeys: Set<string>,
): boolean {
    const ingredientKeys = getIngredientKeys(ingredient);

    for (const key of ingredientKeys) {
        if (pantryKeys.has(key)) {
            return true;
        }
    }

    return false;
}

export function rankRecipesForPantry(
    pantryItems: readonly PantryItem[],
    recipes: readonly LocalRecipe[] = LOCAL_RECIPE_CATALOG,
): LocalRecipeMatch[] {
    // Map: canonical ingredient key -> a display name from the pantry.
    // This prevents duplicate item names from inflating the match count.
    const pantryByKey = new Map<string, string>();

    for (const item of pantryItems) {
        const key = normalizeIngredientKey(item.name);

        if (key && !pantryByKey.has(key)) {
            pantryByKey.set(key, item.name);
        }
    }

    const pantryKeys = new Set(pantryByKey.keys());

    const matches: LocalRecipeMatch[] = [];

    for (const recipe of recipes) {
        const requiredIngredients = recipe.ingredients.filter(
            (ingredient) => !ingredient.optional,
        );

        const matchedRecipeIngredients =
            requiredIngredients.filter((ingredient) =>
                ingredientMatchesPantry(ingredient, pantryKeys),
            );

        const missingIngredients = requiredIngredients.filter(
            (ingredient) =>
                !ingredientMatchesPantry(ingredient, pantryKeys),
        );

        // Count distinct pantry ingredient keys used by this recipe.
        // For example, a recipe cannot count two different entries
        // for "egg" as two separate ingredient types.
        const matchedKeys = new Set<string>();

        for (const ingredient of matchedRecipeIngredients) {
            for (const key of getIngredientKeys(ingredient)) {
                if (pantryKeys.has(key)) {
                    matchedKeys.add(key);
                    break;
                }
            }
        }

        if (matchedKeys.size === 0) {
            continue;
        }

        const matchedIngredients = Array.from(matchedKeys)
            .map((key) => pantryByKey.get(key))
            .filter((name): name is string => Boolean(name));

        const requiredIngredientCount =
            requiredIngredients.length;

        const matchRatio =
            requiredIngredientCount === 0
                ? 0
                : matchedRecipeIngredients.length /
                requiredIngredientCount;

        matches.push({
            recipe,
            matchedIngredients,
            matchedIngredientKeys: Array.from(matchedKeys),
            missingIngredients,
            matchedCount: matchedKeys.size,
            requiredIngredientCount,
            matchRatio,
        });
    }

    // Rank recipes that use the most different pantry ingredients first.
    // On a tie, prefer recipes requiring a larger proportion of items
    // already present in the pantry. Use the title for stable ordering.
    return matches.sort(
        (a, b) =>
            b.matchedCount - a.matchedCount ||
            b.matchRatio - a.matchRatio ||
            a.recipe.title.localeCompare(b.recipe.title),
    );
}
