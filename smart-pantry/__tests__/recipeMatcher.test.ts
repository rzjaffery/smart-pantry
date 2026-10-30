import { describe, expect, test } from "@jest/globals";
import type { PantryItem } from "../src/types/pantry";
import type {
    LocalRecipe,
    RecipeIngredient,
} from "../src/features/recipes/recipeTypes";

import {
    isIngredientAvailable,
    normalizeIngredientKey,
    rankRecipesForPantry,
} from "../src/features/recipes/recipeMatcher";


function pantryItem(name: string): PantryItem {
    return {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        quantity: 1,
        unit: "pieces",
        location: "Fridge",
        expiryDate: "2026-11-05",
    } as PantryItem;
}

function ingredient(
    id: string,
    name: string,
    matchKeys: string[] = [id],
    optional = false,
): RecipeIngredient {
    return {
        id,
        name,
        amount: "1",
        matchKeys,
        ...(optional ? { optional: true } : {}),
    };
}

function recipe(
    id: string,
    title: string,
    ingredients: RecipeIngredient[],
): LocalRecipe {
    return {
        id,
        title,
        description: "Recipe used in a unit test.",
        servings: 2,
        prepMinutes: 5,
        cookMinutes: 10,
        ingredients,
        instructions: ["Prepare the ingredients."],
        tags: [],
        halalReview: {
            status: "not-certified",
            note: "Test fixture; not a certification claim.",
        },
    };
}

describe("normalizeIngredientKey", () => {
    test("normalizes singular and plural eggs", () => {
        expect(normalizeIngredientKey("Eggs")).toBe("egg");
    });

    test("maps different chocolate names to the same key", () => {
        expect(normalizeIngredientKey("Dark chocolate")).toBe("chocolate");
        expect(normalizeIngredientKey("Chocolate chips")).toBe("chocolate");
        expect(normalizeIngredientKey("Chocolate")).toBe("chocolate");
    });

    test("normalizes common flour names", () => {
        expect(normalizeIngredientKey("Maida")).toBe("flour");
        expect(normalizeIngredientKey("Plain flour")).toBe("flour");
    });

    test("trims whitespace and ignores capitalization", () => {
        expect(normalizeIngredientKey("  WHOLE MILK ")).toBe("milk");
    });
});

describe("isIngredientAvailable", () => {
    test("recognizes a chocolate alias in the pantry", () => {
        const chocolateIngredient = ingredient(
            "chocolate",
            "Chocolate",
            ["chocolate", "cocoa powder"],
        );

        expect(
            isIngredientAvailable(
                chocolateIngredient,
                [pantryItem("Dark chocolate")],
            ),
        ).toBe(true);
    });

    test("returns false when the pantry lacks the ingredient", () => {
        expect(
            isIngredientAvailable(
                ingredient("banana", "Banana", ["banana"]),
                [pantryItem("Eggs")],
            ),
        ).toBe(false);
    });
});

describe("rankRecipesForPantry", () => {
    const chocolateEggRecipe = recipe(
        "chocolate-egg",
        "Chocolate and Egg Cake",
        [
            ingredient("egg", "Egg", ["egg"]),
            ingredient("chocolate", "Chocolate", [
                "chocolate",
                "cocoa powder",
            ]),
            ingredient("sugar", "Sugar", ["sugar"]),
        ],
    );

    const eggOnlyRecipe = recipe(
        "egg-only",
        "Egg Dish",
        [ingredient("egg", "Egg", ["egg"])],
    );

    const bananaRecipe = recipe(
        "banana-only",
        "Banana Dish",
        [ingredient("banana", "Banana", ["banana"])],
    );

    test("ranks a recipe using multiple expiring ingredients first", () => {
        const eggs = pantryItem("Eggs");
        const chocolate = pantryItem("Dark chocolate");

        const results = rankRecipesForPantry(
            [eggs, chocolate],
            [
                eggOnlyRecipe,
                bananaRecipe,
                chocolateEggRecipe,
            ],
            [eggs, chocolate],
        );

        expect(results[0].recipe.id).toBe("chocolate-egg");
        expect(results[0].matchedCount).toBe(2);
        expect(results[0].expiringMatchCount).toBe(2);
    });

    test("reports required ingredients that are missing", () => {
        const results = rankRecipesForPantry(
            [pantryItem("Eggs"), pantryItem("Chocolate")],
            [chocolateEggRecipe],
            [pantryItem("Eggs"), pantryItem("Chocolate")],
        );

        expect(results[0].missingIngredients.map((item) => item.name))
            .toEqual(["Sugar"]);
    });

    test("does not return recipes with zero matching ingredients", () => {
        const results = rankRecipesForPantry(
            [pantryItem("Eggs")],
            [bananaRecipe],
        );

        expect(results).toHaveLength(0);
    });

    test("does not mark optional ingredients as required missing items", () => {
        const recipeWithOptional = recipe(
            "optional-test",
            "Egg with Optional Cinnamon",
            [
                ingredient("egg", "Egg", ["egg"]),
                ingredient(
                    "cinnamon",
                    "Cinnamon",
                    ["cinnamon"],
                    true,
                ),
            ],
        );

        const results = rankRecipesForPantry(
            [pantryItem("Eggs")],
            [recipeWithOptional],
        );

        expect(results).toHaveLength(1);
        expect(results[0].missingIngredients).toHaveLength(0);
        expect(results[0].matchedCount).toBe(1);
    });

    test("finds chocolate recipes in the real local catalogue", () => {
        const eggs = pantryItem("Eggs");
        const chocolate = pantryItem("Dark chocolate");
        const milk = pantryItem("Milk");

        const results = rankRecipesForPantry(
            [eggs, chocolate, milk],
            undefined,
            [eggs, chocolate, milk],
        );

        const mugCake = results.find(
            (match) => match.recipe.id === "chocolate-mug-cake",
        );

        expect(mugCake).toBeDefined();
        expect(mugCake?.matchedCount).toBe(3);
        expect(mugCake?.matchedExpiringIngredients).toEqual(
            expect.arrayContaining(["Eggs", "Dark chocolate", "Milk"]),
        );
    });
});

describe("South Asian local recipes", () => {
    test("finds masoor dal using common pantry ingredients", () => {
        const results = rankRecipesForPantry(
            [
                pantryItem("Masoor Dal"),
                pantryItem("Tomatoes"),
                pantryItem("Onion"),
                pantryItem("Garlic"),
            ],
        );

        const dal = results.find(
            (match) => match.recipe.id === "masoor-dal-tadka",
        );

        expect(dal).toBeDefined();
        expect(dal?.matchedCount).toBeGreaterThanOrEqual(3);
    });

    test("finds recipes using besan", () => {
        const results = rankRecipesForPantry([
            pantryItem("Besan"),
            pantryItem("Onion"),
            pantryItem("Tomato"),
        ]);

        expect(
            results.some(
                (match) => match.recipe.id === "besan-chilla",
            ),
        ).toBe(true);
    });

    test("recognizes basmati rice as rice", () => {
        const results = rankRecipesForPantry([
            pantryItem("Basmati rice"),
            pantryItem("Cumin"),
        ]);

        expect(
            results.some(
                (match) => match.recipe.id === "jeera-rice",
            ),
        ).toBe(true);
    });

    test("finds kheer using milk and rice", () => {
        const results = rankRecipesForPantry([
            pantryItem("Milk"),
            pantryItem("Rice"),
            pantryItem("Sugar"),
        ]);

        const kheer = results.find(
            (match) => match.recipe.id === "rice-kheer",
        );

        expect(kheer).toBeDefined();
        expect(kheer?.matchedCount).toBe(3);
    });
});
