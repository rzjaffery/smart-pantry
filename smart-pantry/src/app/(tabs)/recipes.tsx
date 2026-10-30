import { useMemo, useState } from "react";
import {ActivityIndicator, FlatList, Pressable, View,} from "react-native";
import { AppText as Text } from "@/components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {ArrowRight, CalendarClock, ChefHat, Clock, Plus, ShieldAlert, Utensils,} from "lucide-react-native";
import { usePantry } from "@/context/PantryContext";
import { daysUntilExpiry } from "@/lib/expiry";
import { LOCAL_RECIPE_CATALOG } from "@/features/recipes/recipeCatalog";
import { rankRecipesForPantry } from "@/features/recipes/recipeMatcher";
import { HALAL_RECIPE_NOTICE } from "@/features/recipes/recipeTypes";
import type { LocalRecipeMatch } from "@/features/recipes/recipeTypes";

type RecipeCategory = | "all" | "breakfast" | "lunch" | "dinner" | "snack" | "dessert" | "drink";
type RecipeMatchFilter = | "any" | "two" | "three" | "complete";

const CATEGORY_OPTIONS: {value: RecipeCategory; label: string; }[] = [
    { value: "all", label: "All" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snacks" },
    { value: "dessert", label: "Desserts" },
    { value: "drink", label: "Drinks" },
];

const MATCH_OPTIONS: {value: RecipeMatchFilter; label: string; }[] = [
    { value: "any", label: "Any match" },
    { value: "two", label: "2+ ingredients" },
    { value: "three", label: "3+ ingredients" },
    { value: "complete", label: "Complete recipe" },
];

function RecipeFilterChip({label, selected, onPress}:{label: string, selected: boolean, onPress: () => void}){
    return(
        <Pressable
            accessibilityRole='button'
            accessibilityState={{selected}}
            onPress={onPress}
            className={`rounded-full border px-3 py-2 ${selected
            ?"border-emerald-700 bg-emerald-700"
            :"border-slate-200 bg-white"}`}>

            <Text
                className={`text-sm font-semibold ${
                    selected ? "text-white" : "text-slate-700"
                }`}>
                {label}
            </Text>
        </Pressable>
    )
}

export default function RecipesScreen() {
    const router = useRouter();
    const { items, isLoading: pantryLoading } = usePantry();

    const pantryItems = items ?? [];

    const [suggestions, setSuggestions] = useState<LocalRecipeMatch[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>("all");
    const [matchFilter, setMatchFilter] = useState<RecipeMatchFilter>("any");
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Never use expired items to recommend a recipe.
    const usablePantryItems = useMemo(
        () =>
            pantryItems.filter(
                (item) => daysUntilExpiry(item.expiryDate) >= 0,
            ),
        [pantryItems],
    );

    const expiringItems = useMemo(
        () =>
            usablePantryItems
                .filter((item) => daysUntilExpiry(item.expiryDate) <= 7)
                .sort(
                    (a, b) =>
                        daysUntilExpiry(a.expiryDate) -
                        daysUntilExpiry(b.expiryDate),
                ),
        [usablePantryItems],
    );

    const visibleSuggestions = useMemo(
        () => {
            return suggestions.filter((match) => {
                const matchesCategory = selectedCategory === "all" || match.recipe.tags.includes(selectedCategory);

                let matchesQuality = true;

                if (matchFilter === 'two')
                    matchesQuality = match.matchedCount >= 2;
                else if (matchFilter === 'three')
                    matchesQuality = match.matchedCount >=3;
                else if (matchFilter === 'complete')
                    matchesQuality = match.missingIngredients.length === 0;

                return matchesCategory && matchesQuality;
            });
        },[suggestions, selectedCategory, matchFilter]
    )

    function findRecipes() {
        if (usablePantryItems.length === 0) {
            setSuggestions([]);
            setHasSearched(true);
            return;
        }

        const matches = rankRecipesForPantry(
            usablePantryItems,
            LOCAL_RECIPE_CATALOG,
            expiringItems,
        );

        setSuggestions(matches);
        setHasSearched(true);
    }

    if (pantryLoading) {
        return (
            <SafeAreaView
                className="flex-1 bg-slate-50"
                edges={["top"]}
            >
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#047857" />

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
                data={visibleSuggestions}
                keyExtractor={(match) => match.recipe.id}
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
                                    Find meals that use the food you already have.
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

                        {/* Expiring ingredients */}
                        <View className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <View className="flex-row items-center gap-2">
                                <CalendarClock
                                    size={20}
                                    color="#92400E"
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
                                    Nothing expires within the next seven days.
                                    You can still find recipes using your other
                                    non-expired pantry ingredients.
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
                                                            : days === 1
                                                                ? "Tomorrow"
                                                                : `${days}d left`}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Local catalogue and halal notice */}
                        <View className="mt-4 flex-row items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                            <ShieldAlert
                                size={21}
                                color="#B45309"
                            />

                            <View className="flex-1">
                                <Text className="text-sm font-bold text-slate-900">
                                    Halal status
                                </Text>

                                <Text className="mt-1 text-sm leading-5 text-slate-600">
                                    {HALAL_RECIPE_NOTICE}
                                </Text>
                            </View>
                        </View>

                        <Text className="mt-4 text-xs text-slate-500">
                            {LOCAL_RECIPE_CATALOG.length} locally stored starter recipes
                            {" · "}Works offline
                        </Text>

                        {/* Search action */}
                        <Pressable
                            accessibilityRole="button"
                            disabled={usablePantryItems.length === 0}
                            onPress={findRecipes}
                            className={`mt-4 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 ${
                                usablePantryItems.length === 0
                                    ? "bg-emerald-300"
                                    : "bg-emerald-700"
                            }`}
                        >
                            <ChefHat
                                size={20}
                                color="#FFFFFF"
                            />

                            <Text className="font-bold text-white">
                                {hasSearched
                                    ? "Refresh recipe matches"
                                    : "Find recipes"}
                            </Text>
                        </Pressable>

                        {/* Results heading */}

                        {/* Recipe filters and results */}
                        {suggestions.length > 0 ? (
                            <View className="mt-7">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 pr-3">
                                        <Text className="text-xl font-bold text-slate-900">
                                            Recipe ideas
                                        </Text>

                                        <Text className="mt-1 text-sm text-slate-500">
                                            {visibleSuggestions.length} of {suggestions.length} recipes
                                        </Text>
                                    </View>
                                </View>

                                {/* Collapsible filters */}
                                <View className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityState={{ expanded: filtersExpanded }}
                                        onPress={() =>
                                            setFiltersExpanded((current) => !current)
                                        }
                                        className="flex-row items-center justify-between p-4"
                                    >
                                        <View className="flex-1 pr-3">
                                            <Text className="font-bold text-slate-900">
                                                Filter recipes
                                            </Text>

                                            <Text className="mt-1 text-xs text-slate-500">
                                                {CATEGORY_OPTIONS.find(
                                                    (option) =>
                                                        option.value === selectedCategory,
                                                )?.label}
                                                {" · "}
                                                {MATCH_OPTIONS.find(
                                                    (option) =>
                                                        option.value === matchFilter,
                                                )?.label}
                                            </Text>
                                        </View>

                                        <Text className="text-sm font-semibold text-emerald-700">
                                            {filtersExpanded ? "Close −" : "Open +"}
                                        </Text>
                                    </Pressable>

                                    {filtersExpanded && (
                                        <View className="gap-5 border-t border-slate-100 p-4">
                                            <View>
                                                <Text className="text-sm font-bold text-slate-800">
                                                    Meal category
                                                </Text>

                                                <View className="mt-3 flex-row flex-wrap gap-2">
                                                    {CATEGORY_OPTIONS.map((option) => (
                                                        <RecipeFilterChip
                                                            key={option.value}
                                                            label={option.label}
                                                            selected={
                                                                selectedCategory === option.value
                                                            }
                                                            onPress={() =>
                                                                setSelectedCategory(option.value)
                                                            }
                                                        />
                                                    ))}
                                                </View>
                                            </View>

                                            <View>
                                                <Text className="text-sm font-bold text-slate-800">
                                                    Ingredient availability
                                                </Text>

                                                <View className="mt-3 flex-row flex-wrap gap-2">
                                                    {MATCH_OPTIONS.map((option) => (
                                                        <RecipeFilterChip
                                                            key={option.value}
                                                            label={option.label}
                                                            selected={matchFilter === option.value}
                                                            onPress={() =>
                                                                setMatchFilter(option.value)
                                                            }
                                                        />
                                                    ))}
                                                </View>
                                            </View>

                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={() => {
                                                    setSelectedCategory("all");
                                                    setMatchFilter("any");
                                                }}
                                                className="self-start py-2"
                                            >
                                                <Text className="font-semibold text-emerald-700">
                                                    Reset recipe filters
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={() => setFiltersExpanded(false)}
                                                className="items-center rounded-xl bg-slate-100 px-4 py-3"
                                            >
                                                <Text className="font-semibold text-slate-700">
                                                    Done
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ) : null}

                    </View>
                }
                renderItem={({ item: match }) => {
                    const recipe = match.recipe;

                    const ingredientsToShow =
                        match.matchedExpiringIngredients.length > 0
                            ? match.matchedExpiringIngredients
                            : match.matchedIngredients;

                    return (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`View recipe details for ${recipe.title}`}
                            onPress={() =>
                                router.push({
                                    pathname: "/recipe/[id]",
                                    params: { id: recipe.id },
                                })
                            }
                            className="mb-4 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                            <View className="flex-row items-start gap-3 p-4">
                                <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                    <Utensils
                                        size={23}
                                        color="#047857"
                                        strokeWidth={1.8}
                                    />
                                </View>

                                <View className="min-w-0 flex-1">
                                    <Text className="text-lg font-bold leading-6 text-slate-900">
                                        {recipe.title}
                                    </Text>

                                    <Text className="mt-1 text-sm leading-5 text-slate-600">
                                        {recipe.description}
                                    </Text>
                                </View>
                            </View>

                            <View className="px-4">
                                <View className="flex-row flex-wrap gap-2">
                                    <View className="flex-row items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5">
                                        <Clock size={13} color="#475569" />

                                        <Text className="text-xs font-semibold text-slate-700">
                                            {recipe.prepMinutes +
                                                recipe.cookMinutes} min total
                                        </Text>
                                    </View>

                                    <View className="rounded-full bg-amber-50 px-2.5 py-1.5">
                                        <Text className="text-xs font-semibold text-amber-800">
                                            Not halal-certified
                                        </Text>
                                    </View>
                                </View>

                                <View className="mt-4">
                                    <Text className="text-sm font-bold text-slate-800">
                                        {match.expiringMatchCount > 0
                                            ? `Uses ${match.expiringMatchCount} expiring ingredient${match.expiringMatchCount === 1 ? "" : "s"}`
                                            : `Matches ${match.matchedCount} pantry ingredient${match.matchedCount === 1 ? "" : "s"}`}
                                    </Text>

                                    <View className="mt-2 flex-row flex-wrap gap-2">
                                        {ingredientsToShow.map((name) => (
                                            <View
                                                key={name}
                                                className="rounded-full bg-emerald-50 px-3 py-1.5"
                                            >
                                                <Text className="text-xs font-semibold text-emerald-800">
                                                    {name}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {match.missingIngredients.length > 0 ? (
                                    <View className="mt-4">
                                        <Text className="text-sm font-semibold text-slate-700">
                                            Also needed
                                        </Text>

                                        <Text className="mt-1 text-sm leading-5 text-slate-500">
                                            {match.missingIngredients
                                                .slice(0, 4)
                                                .map((ingredient) => ingredient.name)
                                                .join(", ")}
                                            {match.missingIngredients.length > 4
                                                ? `, +${match.missingIngredients.length - 4} more`
                                                : ""}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="mt-3 text-sm font-semibold text-emerald-700">
                                        You have all the required ingredients.
                                    </Text>
                                )}

                                <View className="mt-4 flex-row items-center justify-between border-t border-slate-100 py-4">
                                    <Text className="font-bold text-emerald-700">
                                        View recipe
                                    </Text>

                                    <ArrowRight
                                        size={20}
                                        color="#047857"
                                    />
                                </View>
                            </View>
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                            <ChefHat
                                size={29}
                                color="#047857"
                            />
                        </View>

                        <Text className="mt-4 text-center text-lg font-bold text-slate-900">
                            {hasSearched
                                ? suggestions.length > 0
                                    ? "No recipes match these filters"
                                    : "No matching recipes yet"
                                : usablePantryItems.length > 0
                                    ? "Ready to find a recipe?"
                                    : "Your pantry is empty"}
                        </Text>

                        <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                            {hasSearched && suggestions.length > 0
                                ? "Try selecting another meal category or reducing the ingredient match requirement."
                                : hasSearched
                                    ? "The local catalogue does not currently have a recipe matching your ingredients."
                                    : "Add pantry items to discover recipes that use them."}
                        </Text>

                        {hasSearched && suggestions.length > 0 && (
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => {
                                    setSelectedCategory("all");
                                    setMatchFilter("any");
                                    setFiltersExpanded(false);
                                }}
                                className="mt-5 rounded-xl bg-emerald-700 px-5 py-3"
                            >
                                <Text className="font-bold text-white">
                                    Reset recipe filters
                                </Text>
                            </Pressable>
                        )}

                        {hasSearched && usablePantryItems.length > 0 ? (
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => router.push("/pantry")}
                                className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3"
                            >
                                <Plus size={18} color="#FFFFFF" />

                                <Text className="font-bold text-white">
                                    Manage pantry
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                }
            />
        </SafeAreaView>
    );
}
