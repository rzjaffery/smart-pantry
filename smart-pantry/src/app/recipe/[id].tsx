import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    CheckCircle2,
    ChefHat,
    Clock,
    CookingPot,
    Info,
    ShieldAlert,
    ShoppingBasket,
    ShoppingCart,
    Users,
} from "lucide-react-native";

import { usePantry } from "@/context/PantryContext";
import { useShoppingList } from "@/context/ShoppingListContext";
import { daysUntilExpiry } from "@/lib/expiry";
import { LOCAL_RECIPE_CATALOG } from "@/features/recipes/recipeCatalog";
import { isIngredientAvailable } from "@/features/recipes/recipeMatcher";
import {
    HALAL_RECIPE_NOTICE,
} from "@/features/recipes/recipeTypes";

export default function RecipeDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();

    const { items } = usePantry();
    const { addItems } = useShoppingList();

    const [isAddingToShopping, setIsAddingToShopping] = useState(false);

    const recipe = useMemo(
        () =>
            LOCAL_RECIPE_CATALOG.find(
                (entry) => entry.id === params.id,
            ),
        [params.id],
    );

    const usablePantryItems = useMemo(
        () =>
            (items ?? []).filter(
                (item) => daysUntilExpiry(item.expiryDate) >= 0,
            ),
        [items],
    );

    const missingIngredients = useMemo(() => {
        if (!recipe) {
            return [];
        }

        return recipe.ingredients.filter((ingredient) => {
            if (ingredient.optional) {
                return false;
            }

            return !isIngredientAvailable(
                ingredient,
                usablePantryItems,
            );
        });
    }, [recipe, usablePantryItems]);

    async function handleAddMissingIngredients() {
        if (!recipe || missingIngredients.length === 0 || isAddingToShopping) {
            return;
        }

        setIsAddingToShopping(true);

        try {
            await addItems(
                missingIngredients.map((ingredient) => ({
                    name: ingredient.name,
                    amount: ingredient.amount,
                    sourceRecipeId: recipe.id,
                })),
            );

            Alert.alert(
                "Shopping list updated",
                `${missingIngredients.length} missing ingredient${
                    missingIngredients.length === 1 ? " has" : "s have"
                } been added or merged into your shopping list.`,
                [
                    {
                        text: "View shopping list",
                        onPress: () => router.push("/shopping"),
                    },
                    {
                        text: "Continue cooking",
                        style: "cancel",
                    },
                ],
            );
        } catch (error) {
            console.error(
                "Failed to add missing recipe ingredients:",
                error,
            );

            Alert.alert(
                "Couldn't update shopping list",
                error instanceof Error
                    ? error.message
                    : "Please try again.",
            );
        } finally {
            setIsAddingToShopping(false);
        }
    }

    if (!recipe) {
        return (
            <SafeAreaView
                className="flex-1 items-center justify-center bg-slate-50 px-6"
                edges={["top", "bottom"]}
            >
                <View className="items-center">
                    <Info
                        size={36}
                        color="#64748B"
                    />

                    <Text className="mt-4 text-xl font-bold text-slate-900">
                        Recipe not found
                    </Text>

                    <Text className="mt-2 text-center text-sm leading-6 text-slate-600">
                        This recipe may have been removed or is no longer
                        available.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.back()}
                        className="mt-6 min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3"
                    >
                        <ArrowLeft
                            size={18}
                            color="#FFFFFF"
                        />

                        <Text className="font-bold text-white">
                            Back to recipes
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            className="flex-1 bg-slate-50"
            edges={["top", "bottom"]}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    paddingBottom: 32,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Back navigation */}
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.back()}
                    className="mb-5 min-h-10 flex-row items-center gap-2 self-start rounded-lg py-2"
                >
                    <ArrowLeft
                        size={19}
                        color="#047857"
                    />

                    <Text className="font-semibold text-emerald-700">
                        Back to recipes
                    </Text>
                </Pressable>

                {/* Recipe heading */}
                <View className="flex-row items-start gap-3">
                    <View className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                        <ChefHat
                            size={29}
                            color="#047857"
                            strokeWidth={1.8}
                        />
                    </View>

                    <View className="min-w-0 flex-1">
                        <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                            SMART PANTRY RECIPES
                        </Text>

                        <Text className="mt-2 text-2xl font-bold leading-8 text-slate-900">
                            {recipe.title}
                        </Text>
                    </View>
                </View>

                <Text className="mt-4 text-base leading-6 text-slate-600">
                    {recipe.description}
                </Text>

                {/* Preparation information */}
                <View className="mt-5 flex-row gap-3">
                    <View className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-3">
                        <Clock
                            size={20}
                            color="#047857"
                        />

                        <Text className="mt-3 text-xs text-slate-500">
                            Preparation
                        </Text>

                        <Text className="mt-1 text-base font-bold text-slate-900">
                            {recipe.prepMinutes} min
                        </Text>
                    </View>

                    <View className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-3">
                        <CookingPot
                            size={20}
                            color="#047857"
                        />

                        <Text className="mt-3 text-xs text-slate-500">
                            Cooking
                        </Text>

                        <Text className="mt-1 text-base font-bold text-slate-900">
                            {recipe.cookMinutes === 0
                                ? "No cooking"
                                : `${recipe.cookMinutes} min`}
                        </Text>
                    </View>

                    <View className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-3">
                        <Users
                            size={20}
                            color="#047857"
                        />

                        <Text className="mt-3 text-xs text-slate-500">
                            Servings
                        </Text>

                        <Text className="mt-1 text-base font-bold text-slate-900">
                            {recipe.servings}
                        </Text>
                    </View>
                </View>

                {/* Halal status notice */}
                <View className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <View className="flex-row items-center gap-2">
                        <ShieldAlert
                            size={21}
                            color="#B45309"
                        />

                        <Text className="flex-1 text-base font-bold text-amber-900">
                            Not halal-certified
                        </Text>
                    </View>

                    <Text className="mt-2 text-sm leading-5 text-amber-900">
                        {HALAL_RECIPE_NOTICE}
                    </Text>
                </View>

                {/* Ingredient checklist */}
                <View className="mt-7">
                    <Text className="text-xl font-bold text-slate-900">
                        Ingredients
                    </Text>

                    <Text className="mt-1 text-sm leading-5 text-slate-500">
                        Ingredients available in your non-expired pantry are
                        marked below.
                    </Text>

                    <View className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {recipe.ingredients.map((ingredient, index) => {
                            const available = isIngredientAvailable(
                                ingredient,
                                usablePantryItems,
                            );

                            return (
                                <View
                                    key={ingredient.id}
                                    className={`flex-row items-start gap-3 p-4 ${
                                        index > 0
                                            ? "border-t border-slate-100"
                                            : ""
                                    }`}
                                >
                                    {available ? (
                                        <CheckCircle2
                                            size={20}
                                            color="#047857"
                                        />
                                    ) : (
                                        <ShoppingBasket
                                            size={20}
                                            color="#B45309"
                                        />
                                    )}

                                    <View className="min-w-0 flex-1">
                                        <Text className="text-sm font-semibold text-slate-900">
                                            {ingredient.name}
                                            {ingredient.optional
                                                ? " (optional)"
                                                : ""}
                                        </Text>

                                        <Text className="mt-1 text-sm text-slate-500">
                                            {ingredient.amount}
                                        </Text>

                                        <Text
                                            className={`mt-1 text-xs font-semibold ${
                                                available
                                                    ? "text-emerald-700"
                                                    : "text-amber-700"
                                            }`}
                                        >
                                            {available
                                                ? "In your pantry"
                                                : "Not found in usable pantry items"}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Add missing ingredients to shopping list */}
                <View className="mt-5">
                    {missingIngredients.length > 0 ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Add missing ingredients to shopping list"
                            disabled={isAddingToShopping}
                            onPress={() => {
                                void handleAddMissingIngredients();
                            }}
                            className={`min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 ${
                                isAddingToShopping
                                    ? "bg-emerald-500"
                                    : "bg-emerald-700"
                            }`}
                        >
                            {isAddingToShopping ? (
                                <Text className="font-bold text-white">
                                    Updating shopping list...
                                </Text>
                            ) : (
                                <>
                                    <ShoppingCart
                                        size={20}
                                        color="#FFFFFF"
                                        strokeWidth={2}
                                    />

                                    <Text className="font-bold text-white">
                                        Add {missingIngredients.length} missing
                                        ingredient
                                        {missingIngredients.length === 1
                                            ? ""
                                            : "s"}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    ) : (
                        <View className="flex-row items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                            <CheckCircle2
                                size={20}
                                color="#047857"
                            />

                            <Text className="font-semibold text-emerald-800">
                                You already have all required ingredients!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Cooking instructions */}
                <View className="mt-8">
                    <Text className="text-xl font-bold text-slate-900">
                        Instructions
                    </Text>

                    <View className="mt-4 gap-3">
                        {recipe.instructions.map((instruction, index) => (
                            <View
                                key={`${recipe.id}-step-${index}`}
                                className="flex-row items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                            >
                                <View className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                    <Text className="text-sm font-bold text-emerald-800">
                                        {index + 1}
                                    </Text>
                                </View>

                                <Text className="flex-1 text-sm leading-6 text-slate-700">
                                    {instruction}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Matching explanation */}
                <View className="mt-6 flex-row items-start gap-3 rounded-2xl bg-slate-100 p-4">
                    <Info
                        size={19}
                        color="#475569"
                    />

                    <Text className="flex-1 text-sm leading-5 text-slate-600">
                        Pantry availability is estimated from ingredient names
                        and aliases. Always check product labels, quantities,
                        and expiry dates before preparing a meal.
                    </Text>
                </View>

                {/* Bottom back button */}
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.back()}
                    className="mt-6 min-h-12 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3"
                >
                    <ArrowLeft
                        size={18}
                        color="#FFFFFF"
                    />

                    <Text className="font-bold text-white">
                        Back to recipes
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}