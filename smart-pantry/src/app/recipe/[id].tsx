
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
    getRecipeDetails,
    type RecipeDetails,
} from "@/features/recipes/mealdb";


function parseInstructionParagraphs(raw: string): string[] {
    const normalized = raw
        // Convert HTML line breaks and paragraph/list endings
        // into real line breaks before removing HTML tags.
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, "\n")
        .replace(/<li\b[^>]*>/gi, "\n")
        .replace(/<[^>]*>/g, " ")

        // Clean common HTML whitespace and entities.
        .replace(/&nbsp;|&#160;|&#x0*a0;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")

        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim();

    return normalized
        .split(/\n+/)
        .map((paragraph) =>
            paragraph
                // Remove existing step numbering because the UI
                // supplies its own numbered circles.
                .replace(/^\s*(?:step\s*)?\d+\s*[:.)-]\s*/i, "")
                .replace(/^\s*[-•]\s*/, "")
                .trim(),
        )
        // Discard blank, markup-only, or numbering-only entries.
        .filter((paragraph) => /[a-z0-9]/i.test(paragraph));
}

export default function RecipeDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{
        id?: string | string[];
    }>();

    const recipeId = Array.isArray(id) ? id[0] : id;

    const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadRecipe() {
            setIsLoading(true);
            setError(null);
            setRecipe(null);

            if (!recipeId) {
                setError("This recipe link is missing its recipe ID.");
                setIsLoading(false);
                return;
            }

            try {
                const result = await getRecipeDetails(recipeId);

                if (cancelled) return;

                if (!result) {
                    setError("We couldn't find this recipe.");
                } else {
                    setRecipe(result);
                }
            } catch (fetchError) {
                console.error("Failed to load recipe details:", fetchError);

                if (!cancelled) {
                    setError(
                        "We couldn't load this recipe. Check your connection and try again.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadRecipe();

        return () => {
            cancelled = true;
        };
    }, [recipeId, retryCount]);

    const openOriginalRecipe = async () => {
        const url = recipe?.sourceUrl;

        // Only open normal web links returned by the API.
        if (!url || !/^https?:\/\//i.test(url)) {
            return;
        }

        try {
            await Linking.openURL(url);
        } catch (openError) {
            console.error("Couldn't open the recipe source:", openError);

            Alert.alert(
                "Link unavailable",
                "We couldn't open the original recipe website.",
            );
        }
    };

    const instructionParagraphs = recipe
        ? parseInstructionParagraphs(recipe.instructions)
        : [];

    const hasSourceLink = Boolean(
        recipe?.sourceUrl &&
        /^https?:\/\//i.test(recipe.sourceUrl),
    );

    return (
        <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        >
            {isLoading ? (
                <View className="flex-1 items-center justify-center px-6">
                    <ActivityIndicator size="large" color="#047857" />
                    <Text className="mt-3 text-base text-slate-600">
                        Loading recipe...
                    </Text>
                </View>
            ) : error || !recipe ? (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-4xl">🍽️</Text>

                    <Text className="mt-4 text-center text-xl font-bold text-slate-900">
                        Recipe unavailable
                    </Text>

                    <Text className="mt-2 text-center text-base leading-6 text-slate-600">
                        {error ?? "We couldn't find this recipe."}
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setRetryCount((count) => count + 1)}
                        className="mt-5 rounded-xl bg-emerald-700 px-5 py-3"
                    >
                        <Text className="font-bold text-white">
                            Try again
                        </Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.back()}
                        className="mt-3 rounded-xl px-5 py-3"
                    >
                        <Text className="font-semibold text-slate-600">
                            Back to recipes
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 36 }}
                >
                    <View className="px-5 pt-3">
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.back()}
                            className="self-start rounded-lg py-2"
                        >
                            <Text className="font-semibold text-emerald-700">
                                ← Back to recipes
                            </Text>
                        </Pressable>
                    </View>

                    {recipe.image ? (
                        <Image
                            source={{ uri: recipe.image }}
                            resizeMode="cover"
                            style={{
                                width: "100%",
                                height: 260,
                                marginTop: 12,
                            }}
                        />
                    ) : (
                        <View className="mx-5 mt-4 h-48 items-center justify-center rounded-2xl bg-slate-200">
                            <Text className="text-slate-600">
                                Recipe image unavailable
                            </Text>
                        </View>
                    )}

                    <View className="px-5">
                        <View className="mt-6 self-start rounded-full bg-emerald-100 px-3 py-1.5">
                            <Text className="text-xs font-bold tracking-widest text-emerald-800">
                                USE IT UP
                            </Text>
                        </View>

                        <Text className="mt-3 text-3xl font-extrabold leading-10 text-slate-900">
                            {recipe.name}
                        </Text>

                        <Text className="mt-3 text-sm leading-6 text-slate-500">
                            Check the ingredients and instructions below. Ingredient
                            quantities may need adjusting for your serving size.
                        </Text>

                        {/* Ingredients */}
                        <View className="mt-7 rounded-2xl border border-slate-200 bg-white p-4">
                            <Text className="text-xl font-bold text-slate-900">
                                Ingredients
                            </Text>

                            <Text className="mt-1 text-sm text-slate-500">
                                {recipe.ingredients.length} ingredients
                            </Text>

                            {recipe.ingredients.length > 0 ? (
                                <View className="mt-4">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <View
                                            key={`${ingredient.name}-${index}`}
                                            className="flex-row items-start border-b border-slate-100 py-3"
                                        >
                                            <View className="mr-3 mt-1 h-2 w-2 rounded-full bg-emerald-600" />

                                            <Text className="flex-1 text-sm leading-6 text-slate-800">
                                                {ingredient.name}
                                            </Text>

                                            {ingredient.measure ? (
                                                <Text className="ml-3 max-w-[45%] text-right text-sm leading-6 text-slate-500">
                                                    {ingredient.measure}
                                                </Text>
                                            ) : null}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text className="mt-3 text-sm leading-6 text-slate-500">
                                    An ingredient list wasn't provided for this recipe.
                                </Text>
                            )}
                        </View>

                        {/* Cooking instructions */}
                        <View className="mt-6">
                            <Text className="text-xl font-bold text-slate-900">
                                Instructions
                            </Text>

                            {instructionParagraphs.length > 1 ? (
                                <View className="mt-4">
                                    {instructionParagraphs.map((paragraph, index) => (
                                        <View
                                            key={`${index}-${paragraph.slice(0, 20)}`}
                                            className="mb-4 flex-row items-start"
                                        >
                                            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                                                <Text className="font-bold text-emerald-800">
                                                    {index + 1}
                                                </Text>
                                            </View>

                                            <Text className="flex-1 pt-1 text-base leading-6 text-slate-700">
                                                {paragraph}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ) : instructionParagraphs.length === 1 ? (
                                <Text className="mt-3 text-base leading-7 text-slate-700">
                                    {instructionParagraphs[0]}
                                </Text>
                            ) : (
                                <Text className="mt-3 text-sm leading-6 text-slate-500">
                                    Cooking instructions aren't available for this recipe.
                                </Text>
                            )}
                        </View>

                        {/* Optional original source */}
                        {hasSourceLink ? (
                            <Pressable
                                accessibilityRole="link"
                                onPress={() => void openOriginalRecipe()}
                                className="mt-7 items-center rounded-xl bg-emerald-700 px-5 py-4"
                            >
                                <Text className="text-center font-bold text-white">
                                    View original recipe ↗
                                </Text>
                            </Pressable>
                        ) : (
                            <Text className="mt-6 text-sm leading-5 text-slate-500">
                                An external recipe link isn't available for this meal.
                            </Text>
                        )}

                        <Text className="mt-4 text-center text-xs leading-5 text-slate-400">
                            Recipe data provided by TheMealDB.
                        </Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
