import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    ArrowRight,
    CalendarClock,
    ChefHat,
    ImageOff,
    Plus,
    RefreshCw,
    Salad,
    Sprout,
    Utensils,
} from "lucide-react-native";

import { usePantry } from "@/context/PantryContext";
import { daysUntilExpiry } from "@/lib/expiry";
import {
    searchMealsByIngredient,
    type MealSummary,
} from "@/features/recipes/mealdb";

type RecipeSuggestion = MealSummary & {
    matchedIngredients: string[];
};

function normalizeIngredient(name: string): string {
    const cleaned = name
        .trim()
        .toLowerCase()
        .replace(
            /^(fresh|organic|frozen|canned|dried|chopped|sliced|raw)\s+/,
            "",
        );

    const aliases: Record<string, string> = {
        eggs: "egg",
        tomatoes: "tomato",
        potatoes: "potato",
        onions: "onion",
        carrots: "carrot",
        apples: "apple",
        bananas: "banana",
        mushrooms: "mushroom",
        "bell peppers": "bell pepper",
    };

    return aliases[cleaned] ?? cleaned;
}

export default function RecipesScreen() {
    const router = useRouter();
    const { items, isLoading: pantryLoading } = usePantry();

    const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Include items expiring today or within the next seven days.
    // Exclude items whose expiry date has already passed.
    const expiringItems = useMemo(
        () =>
            items
                .filter((item) => {
                    const days = daysUntilExpiry(item.expiryDate);
                    return days >= 0 && days <= 7;
                })
                .sort(
                    (a, b) =>
                        daysUntilExpiry(a.expiryDate) -
                        daysUntilExpiry(b.expiryDate),
                ),
        [items],
    );

    // Search up to six distinct ingredients, nearest expiry first.
    const ingredientsToSearch = useMemo(
        () =>
            Array.from(
                new Set(
                    expiringItems
                        .map((item) => normalizeIngredient(item.name))
                        .filter(Boolean),
                ),
            ).slice(0, 6),
        [expiringItems],
    );

    async function findRecipes() {
        if (ingredientsToSearch.length === 0 || isSearching) {
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        setError(null);
        setSuggestions([]);

        try {
            // A failed ingredient search won't discard successful results.
            const results = await Promise.all(
                ingredientsToSearch.map(async (ingredient) => {
                    try {
                        const meals =
                            await searchMealsByIngredient(ingredient);

                        return {
                            ingredient,
                            meals,
                            failed: false,
                        };
                    } catch (requestError) {
                        console.warn(
                            `Recipe search failed for ${ingredient}:`,
                            requestError,
                        );

                        return {
                            ingredient,
                            meals: [] as MealSummary[],
                            failed: true,
                        };
                    }
                }),
            );

            const failedCount = results.filter(
                (result) => result.failed,
            ).length;

            if (failedCount === results.length) {
                setError(
                    "We couldn't reach the recipe service. Check your internet connection and try again.",
                );
                return;
            }

            const mealsById = new Map<string, RecipeSuggestion>();

            for (const result of results) {
                if (result.failed) continue;

                for (const meal of result.meals) {
                    const existing = mealsById.get(meal.idMeal);

                    if (existing) {
                        if (
                            !existing.matchedIngredients.includes(
                                result.ingredient,
                            )
                        ) {
                            existing.matchedIngredients.push(
                                result.ingredient,
                            );
                        }
                    } else {
                        mealsById.set(meal.idMeal, {
                            ...meal,
                            matchedIngredients: [result.ingredient],
                        });
                    }
                }
            }

            const rankedSuggestions = Array.from(mealsById.values())
                .sort(
                    (a, b) =>
                        b.matchedIngredients.length -
                        a.matchedIngredients.length ||
                        a.strMeal.localeCompare(b.strMeal),
                )
                .slice(0, 20);

            setSuggestions(rankedSuggestions);

            if (failedCount > 0) {
                setError(
                    "Some ingredient searches failed. Showing the recipes we could retrieve.",
                );
            }
        } catch (searchError) {
            console.error("Recipe search failed:", searchError);
            setError(
                "Something went wrong while finding recipes. Please try again.",
            );
        } finally {
            setIsSearching(false);
        }
    }

    if (pantryLoading) {
        return (
            <SafeAreaView
                className="flex-1 bg-slate-50"
                edges={["top"]}
            >
                <View className="flex-1 items-center justify-center px-6">
                    <ActivityIndicator
                        size="large"
                        color="#047857"
                    />

                    <Text className="mt-3 text-base text-slate-600">
                        Loading your pantry...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            className="flex-1 bg-slate-50"
            edges={["top"]}
        >
            <FlatList
                className="flex-1"
                data={suggestions}
                keyExtractor={(recipe) => recipe.idMeal}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 28,
                    flexGrow: 1,
                }}
                ListHeaderComponent={
                    <View className="pb-5">
                        {/* Screen heading */}
                        <View className="flex-row items-center justify-between">
                            <View className="min-w-0 flex-1 pr-3">
                                <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                                    SMART PANTRY
                                </Text>

                                <Text className="mt-2 text-3xl font-bold text-slate-900">
                                    Recipes
                                </Text>

                                <Text className="mt-2 text-base leading-6 text-slate-600">
                                    Make something useful with ingredients
                                    that expire soon.
                                </Text>
                            </View>

                            <View className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                                <ChefHat
                                    size={29}
                                    color="#047857"
                                    strokeWidth={1.8}
                                />
                            </View>
                        </View>

                        {/* Upcoming expiry overview */}
                        <View className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <View className="flex-row items-center gap-2">
                                <CalendarClock
                                    size={20}
                                    color="#92400E"
                                    strokeWidth={2}
                                />

                                <Text className="flex-1 text-base font-bold text-amber-900">
                                    Expiring soon
                                </Text>

                                <View className="rounded-full bg-white px-2.5 py-1">
                                    <Text className="text-xs font-bold text-amber-900">
                                        {expiringItems.length}
                                    </Text>
                                </View>
                            </View>

                            {expiringItems.length === 0 ? (
                                <Text className="mt-3 text-sm leading-5 text-amber-900">
                                    Nothing is due to expire in the next
                                    seven days. Add pantry items with
                                    upcoming expiry dates to discover
                                    relevant recipes.
                                </Text>
                            ) : (
                                <>
                                    <View className="mt-3 flex-row flex-wrap gap-2">
                                        {expiringItems.map((item) => {
                                            const days = daysUntilExpiry(
                                                item.expiryDate,
                                            );

                                            return (
                                                <View
                                                    key={item.id}
                                                    className="max-w-full rounded-full border border-amber-200 bg-white px-3 py-2"
                                                >
                                                    <Text
                                                        numberOfLines={1}
                                                        className="text-xs font-semibold text-amber-900"
                                                    >
                                                        {item.name}
                                                        {" · "}
                                                        {days === 0
                                                            ? "Today"
                                                            : `${days}d left`}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    <Text className="mt-3 text-xs leading-5 text-amber-900">
                                        We'll search up to six distinct
                                        ingredients, prioritizing those
                                        with the nearest expiry dates.
                                    </Text>
                                </>
                            )}
                        </View>

                        {/* Main search action */}
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Find recipes using ingredients that expire soon"
                            disabled={
                                ingredientsToSearch.length === 0 ||
                                isSearching
                            }
                            onPress={() => void findRecipes()}
                            className={`mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 ${
                                ingredientsToSearch.length === 0 ||
                                isSearching
                                    ? "bg-emerald-300"
                                    : "bg-emerald-700"
                            }`}
                        >
                            {isSearching ? (
                                <>
                                    <ActivityIndicator color="#FFFFFF" />

                                    <Text className="font-bold text-white">
                                        Finding recipes...
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <ChefHat
                                        size={20}
                                        color="#FFFFFF"
                                        strokeWidth={2}
                                    />

                                    <Text className="font-bold text-white">
                                        Find recipes
                                    </Text>
                                </>
                            )}
                        </Pressable>

                        {/* Search errors and retry action */}
                        {error ? (
                            <View className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <View className="flex-row items-start gap-2">
                                    <AlertCircle
                                        size={19}
                                        color="#92400E"
                                    />

                                    <Text className="flex-1 text-sm leading-5 text-amber-900">
                                        {error}
                                    </Text>
                                </View>

                                {ingredientsToSearch.length > 0 ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => void findRecipes()}
                                        disabled={isSearching}
                                        className="mt-3 flex-row items-center gap-2 self-start rounded-lg py-2"
                                    >
                                        <RefreshCw
                                            size={16}
                                            color="#92400E"
                                        />

                                        <Text className="font-bold text-amber-900">
                                            Try again
                                        </Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ) : null}

                        {/* Results heading */}
                        {suggestions.length > 0 ? (
                            <View className="mt-7">
                                <Text className="text-xl font-bold text-slate-900">
                                    Recipe ideas
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-slate-500">
                                    Ranked by the number of matching
                                    ingredients that are expiring soon.
                                </Text>
                            </View>
                        ) : null}
                    </View>
                }
                renderItem={({ item: recipe }) => (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`View recipe details for ${recipe.strMeal}`}
                        onPress={() =>
                            router.push({
                                pathname: "/recipe/[id]",
                                params: { id: recipe.idMeal },
                            })
                        }
                        className="mb-4 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                        {recipe.strMealThumb ? (
                            <Image
                                source={{ uri: recipe.strMealThumb }}
                                resizeMode="cover"
                                style={{
                                    width: "100%",
                                    height: 190,
                                }}
                            />
                        ) : (
                            <View className="h-40 items-center justify-center bg-slate-100">
                                <ImageOff
                                    size={28}
                                    color="#94A3B8"
                                    strokeWidth={1.8}
                                />

                                <Text className="mt-2 text-sm text-slate-500">
                                    Image unavailable
                                </Text>
                            </View>
                        )}

                        <View className="p-4">
                            <Text className="text-lg font-bold leading-6 text-slate-900">
                                {recipe.strMeal}
                            </Text>

                            <Text className="mt-2 text-sm font-semibold text-emerald-800">
                                Matches {recipe.matchedIngredients.length}{" "}
                                expiring{" "}
                                {recipe.matchedIngredients.length === 1
                                    ? "ingredient"
                                    : "ingredients"}
                            </Text>

                            <View className="mt-3 flex-row flex-wrap gap-2">
                                {recipe.matchedIngredients.map(
                                    (ingredient) => (
                                        <View
                                            key={ingredient}
                                            className="rounded-full bg-emerald-50 px-3 py-1.5"
                                        >
                                            <Text className="text-xs font-medium text-emerald-800">
                                                {ingredient.replace(/_/g, " ")}
                                            </Text>
                                        </View>
                                    ),
                                )}
                            </View>

                            <View className="mt-4 flex-row items-center justify-between border-t border-slate-100 pt-3">
                                <Text className="font-bold text-emerald-700">
                                    View recipe
                                </Text>

                                <ArrowRight
                                    size={20}
                                    color="#047857"
                                    strokeWidth={2}
                                />
                            </View>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                            {error ? (
                                <AlertCircle
                                    size={30}
                                    color="#B45309"
                                    strokeWidth={1.8}
                                />
                            ) : !hasSearched ? (
                                ingredientsToSearch.length > 0 ? (
                                    <Salad
                                        size={30}
                                        color="#047857"
                                        strokeWidth={1.8}
                                    />
                                ) : (
                                    <Sprout
                                        size={30}
                                        color="#047857"
                                        strokeWidth={1.8}
                                    />
                                )
                            ) : (
                                <Utensils
                                    size={30}
                                    color="#64748B"
                                    strokeWidth={1.8}
                                />
                            )}
                        </View>

                        <Text className="mt-4 text-center text-lg font-bold text-slate-900">
                            {error
                                ? "Recipes are unavailable"
                                : !hasSearched
                                    ? ingredientsToSearch.length > 0
                                        ? "Ready to find a meal?"
                                        : "Nothing expiring soon"
                                    : "No matching recipes found"}
                        </Text>

                        <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                            {error
                                ? "Check your connection and try again."
                                : !hasSearched
                                    ? ingredientsToSearch.length > 0
                                        ? "Tap Find recipes to search for meals using your expiring ingredients."
                                        : "Your pantry is looking good. Check back when some ingredients are nearing their expiry dates."
                                    : "Try adding an ingredient with a common name, or try again when your pantry has different items."}
                        </Text>

                        {!hasSearched &&
                        ingredientsToSearch.length === 0 ? (
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => router.push("/add-item")}
                                className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3"
                            >
                                <Plus
                                    size={18}
                                    color="#FFFFFF"
                                    strokeWidth={2.2}
                                />

                                <Text className="font-bold text-white">
                                    Add pantry item
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                }
            />
        </SafeAreaView>
    );
}