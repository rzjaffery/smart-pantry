
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export type MealSummary = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
};

export type RecipeIngredient = {
    name: string;
    measure: string;
};

export type RecipeDetails = {
    id: string;
    name: string;
    image: string;
    instructions: string;
    sourceUrl: string | null;
    ingredients: RecipeIngredient[];
};

type ApiResponse = {
    meals?: unknown;
};

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

async function fetchApi(url: string): Promise<ApiResponse> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Recipe service returned HTTP ${response.status}.`,
        );
    }

    return (await response.json()) as ApiResponse;
}

/**
 * Search meals matching one ingredient.
 *
 * TheMealDB's free endpoint supports one ingredient
 * per request. We'll combine searches in a later step.
 */
export async function searchMealsByIngredient(
    ingredient: string,
): Promise<MealSummary[]> {
    const normalized = ingredient.trim().replace(/\s+/g, "_");

    if (!normalized) return [];

    const url =
        `${BASE_URL}/filter.php?i=${encodeURIComponent(normalized)}`;

    const data = await fetchApi(url);

    if (!Array.isArray(data.meals)) {
        return [];
    }

    return data.meals.filter(
        (meal): meal is MealSummary =>
            isRecord(meal) &&
            typeof meal.idMeal === "string" &&
            typeof meal.strMeal === "string" &&
            typeof meal.strMealThumb === "string",
    );
}

/**
 * Retrieve full details for a selected meal.
 */
export async function getRecipeDetails(
    mealId: string,
): Promise<RecipeDetails | null> {
    const url =
        `${BASE_URL}/lookup.php?i=${encodeURIComponent(mealId)}`;

    const data = await fetchApi(url);

    if (!Array.isArray(data.meals) || data.meals.length === 0) {
        return null;
    }

    const meal = data.meals[0];

    if (
        !isRecord(meal) ||
        typeof meal.idMeal !== "string" ||
        typeof meal.strMeal !== "string"
    ) {
        throw new Error("The recipe response was invalid.");
    }

    const ingredients: RecipeIngredient[] = [];

    for (let index = 1; index <= 20; index += 1) {
        const name = meal[`strIngredient${index}`];
        const measure = meal[`strMeasure${index}`];

        if (typeof name === "string" && name.trim()) {
            ingredients.push({
                name: name.trim(),
                measure:
                    typeof measure === "string" ? measure.trim() : "",
            });
        }
    }

    return {
        id: meal.idMeal,
        name: meal.strMeal,
        image:
            typeof meal.strMealThumb === "string"
                ? meal.strMealThumb
                : "",
        instructions:
            typeof meal.strInstructions === "string"
                ? meal.strInstructions
                : "",
        sourceUrl:
            typeof meal.strSource === "string" && meal.strSource
                ? meal.strSource
                : null,
        ingredients,
    };
}
