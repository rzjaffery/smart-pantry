
export type RecipeIngredient = {
    id: string;
    name: string;
    amount: string;

    // Different names that may represent the same ingredient.
    matchKeys: string[];

    optional?: boolean;
};

export type HalalReviewStatus =
    | "not-certified"
    | "certified";

export type RecipeHalalReview = {
    status: HalalReviewStatus;
    note: string;
};

export type LocalRecipe = {
    id: string;
    title: string;
    description: string;

    servings: number;
    prepMinutes: number;
    cookMinutes: number;

    ingredients: RecipeIngredient[];
    instructions: string[];
    tags: string[];

    halalReview: RecipeHalalReview;
};

export type LocalRecipeMatch = {
    recipe: LocalRecipe;

    // Names of the user's pantry items that match this recipe.
    matchedIngredients: string[];

    // Canonical keys used by the matching algorithm.
    matchedIngredientKeys: string[];

    // Recipe ingredients not found in the supplied pantry items.
    missingIngredients: RecipeIngredient[];

    matchedCount: number;
    requiredIngredientCount: number;
    matchRatio: number;
};

// A notice to display in the UI wherever appropriate.
export const HALAL_RECIPE_NOTICE =
    "These recipes are designed without intentionally listing pork or alcohol as ingredients. They are not halal-certified. Check the brands, sourcing, and labels of packaged ingredients.";
