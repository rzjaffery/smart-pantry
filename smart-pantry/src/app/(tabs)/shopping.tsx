
import { useMemo, useState } from "react";
import {ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {ShoppingBasket, Plus, Circle, CircleCheck, Trash2, Pencil, X, ShoppingCart, PackageCheck,} from "lucide-react-native";

import { useShoppingList } from "@/context/ShoppingListContext";
import type { ShoppingListItem } from "@/types/shopping";

export default function ShoppingScreen() {
    const {
        items,
        isLoading,
        storageError,
        addItem,
        togglePurchased,
        updateItem,
        deleteItem,
        clearPurchased,
    } = useShoppingList();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [itemName, setItemName] = useState("");
    const [amount, setAmount] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const purchasedCount = items.filter(
        (item) => item.isPurchased,
    ).length;

    const remainingCount = items.length - purchasedCount;

    const progress =
        items.length === 0
            ? 0
            : (purchasedCount / items.length) * 100;

    const sortedItems = useMemo(
        () =>
            [...items].sort(
                (a, b) =>
                    Number(a.isPurchased) - Number(b.isPurchased) ||
                    a.createdAt.localeCompare(b.createdAt),
            ),
        [items],
    );

    function openAddModal() {
        setEditingItemId(null);
        setItemName("");
        setAmount("");
        setModalVisible(true);
    }

    function openEditModal(item: ShoppingListItem) {
        setEditingItemId(item.id);
        setItemName(item.name);
        setAmount(item.amounts.join(", "));
        setModalVisible(true);
    }

    function closeModal() {
        if (isSaving) return;

        setModalVisible(false);
        setEditingItemId(null);
        setItemName("");
        setAmount("");
    }

    async function handleSave() {
        if (isSaving) return;

        const trimmedName = itemName.trim();
        const trimmedAmount = amount.trim();

        if (!trimmedName) {
            Alert.alert(
                "Item name required",
                "Enter the name of the item you want to buy.",
            );
            return;
        }

        setIsSaving(true);

        try {
            if (editingItemId) {
                await updateItem(editingItemId, {
                    name: trimmedName,
                    amounts: trimmedAmount
                        ? [trimmedAmount]
                        : [],
                });
            } else {
                await addItem({
                    name: trimmedName,
                    amount: trimmedAmount || undefined,
                });
            }

            setModalVisible(false);
            setEditingItemId(null);
            setItemName("");
            setAmount("");
        } catch (error) {
            console.error(
                "Shopping-list save failed:",
                error,
            );

            Alert.alert(
                "Couldn't save item",
                error instanceof Error
                    ? error.message
                    : "Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    function handleDelete(item: ShoppingListItem) {
        Alert.alert(
            "Delete shopping item?",
            `Remove "${item.name}" from your shopping list?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        void deleteItem(item.id).catch((error) => {
                            console.error(
                                "Shopping item deletion failed:",
                                error,
                            );

                            Alert.alert(
                                "Couldn't delete item",
                                "Please try again.",
                            );
                        });
                    },
                },
            ],
        );
    }

    function handleClearPurchased() {
        if (purchasedCount === 0) return;

        Alert.alert(
            "Clear purchased items?",
            `Remove all ${purchasedCount} purchased items from your shopping list?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Clear purchased",
                    style: "destructive",
                    onPress: () => {
                        void clearPurchased().catch((error) => {
                            console.error(
                                "Clearing purchased items failed:",
                                error,
                            );

                            Alert.alert(
                                "Couldn't clear items",
                                "Please try again.",
                            );
                        });
                    },
                },
            ],
        );
    }

    if (isLoading) {
        return (
            <SafeAreaView
                className="flex-1 items-center justify-center bg-slate-50"
                edges={["top"]}
            >
                <ActivityIndicator
                    size="large"
                    color="#047857"
                />

                <Text className="mt-3 text-sm text-slate-500">
                    Loading your shopping list...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            className="flex-1 bg-slate-50"
            edges={["top"]}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 30,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between">
                    <View className="min-w-0 flex-1 pr-3">
                        <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                            SMART PANTRY
                        </Text>

                        <Text className="mt-2 text-3xl font-bold text-slate-900">
                            Shopping list
                        </Text>

                        <Text className="mt-2 text-sm leading-5 text-slate-500">
                            Keep track of everything you need to buy.
                        </Text>
                    </View>

                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                        <ShoppingBasket
                            size={29}
                            color="#047857"
                            strokeWidth={1.8}
                        />
                    </View>
                </View>

                {/* Shopping progress */}
                <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-sm font-semibold text-slate-500">
                                Shopping progress
                            </Text>

                            <Text className="mt-1 text-2xl font-bold text-slate-900">
                                {purchasedCount}
                                <Text className="text-base font-medium text-slate-400">
                                    {" / "}
                                    {items.length}
                                </Text>
                            </Text>
                        </View>

                        <View className="items-end">
                            <Text className="text-sm font-bold text-emerald-700">
                                {Math.round(progress)}%
                            </Text>

                            <Text className="mt-1 text-xs text-slate-500">
                                Completed
                            </Text>
                        </View>
                    </View>

                    <View className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <View
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${progress}%` }}
                        />
                    </View>

                    <View className="mt-4 flex-row gap-3">
                        <View className="flex-1 rounded-xl bg-amber-50 p-3">
                            <Text className="text-xl font-bold text-amber-800">
                                {remainingCount}
                            </Text>

                            <Text className="mt-1 text-xs font-semibold text-amber-800">
                                Remaining
                            </Text>
                        </View>

                        <View className="flex-1 rounded-xl bg-emerald-50 p-3">
                            <Text className="text-xl font-bold text-emerald-800">
                                {purchasedCount}
                            </Text>

                            <Text className="mt-1 text-xs font-semibold text-emerald-800">
                                Purchased
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Add item button */}
                <Pressable
                    accessibilityRole="button"
                    onPress={openAddModal}
                    className="mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4"
                >
                    <Plus
                        size={21}
                        color="#FFFFFF"
                        strokeWidth={2.4}
                    />

                    <Text className="font-bold text-white">
                        Add shopping item
                    </Text>
                </Pressable>

                {/* Storage error */}
                {storageError ? (
                    <View className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <Text className="text-sm leading-5 text-amber-900">
                            {storageError}
                        </Text>
                    </View>
                ) : null}

                {/* Shopping list heading */}
                <View className="mt-8 flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-xl font-bold text-slate-900">
                            Your items
                        </Text>

                        <Text className="mt-1 text-sm text-slate-500">
                            {remainingCount} left to purchase
                        </Text>
                    </View>

                    {purchasedCount > 0 && (
                        <Pressable
                            accessibilityRole="button"
                            onPress={handleClearPurchased}
                            className="flex-row items-center gap-1 rounded-lg px-2 py-2"
                        >
                            <Trash2
                                size={15}
                                color="#BE123C"
                            />

                            <Text className="text-xs font-semibold text-rose-700">
                                Clear purchased
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Empty state */}
                {sortedItems.length === 0 ? (
                    <View className="mt-4 items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-9">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                            <ShoppingCart
                                size={29}
                                color="#047857"
                                strokeWidth={1.8}
                            />
                        </View>

                        <Text className="mt-4 text-lg font-bold text-slate-900">
                            Your shopping list is empty
                        </Text>

                        <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                            Add the things you need to buy and keep track of
                            your shopping in one place.
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={openAddModal}
                            className="mt-5 rounded-xl bg-emerald-700 px-5 py-3"
                        >
                            <Text className="font-bold text-white">
                                Add your first item
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="mt-4 gap-3">
                        {sortedItems.map((item) => (
                            <View
                                key={item.id}
                                className={`w-full flex-row items-center gap-3 rounded-2xl border p-4 ${
                                    item.isPurchased
                                        ? "border-emerald-100 bg-emerald-50/50"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                {/* Purchased checkbox */}
                                <Pressable
                                    accessibilityRole="checkbox"
                                    accessibilityState={{
                                        checked: item.isPurchased,
                                    }}
                                    accessibilityLabel={`Mark ${item.name} as ${
                                        item.isPurchased
                                            ? "not purchased"
                                            : "purchased"
                                    }`}
                                    onPress={() => {
                                        void togglePurchased(item.id).catch(
                                            (error) => {
                                                console.error(
                                                    "Could not update purchased status:",
                                                    error,
                                                );

                                                Alert.alert(
                                                    "Couldn't update item",
                                                    "Please try again.",
                                                );
                                            },
                                        );
                                    }}
                                    className="min-h-10 min-w-10 items-center justify-center"
                                >
                                    {item.isPurchased ? (
                                        <CircleCheck
                                            size={25}
                                            color="#047857"
                                            strokeWidth={2}
                                        />
                                    ) : (
                                        <Circle
                                            size={25}
                                            color="#94A3B8"
                                            strokeWidth={1.8}
                                        />
                                    )}
                                </Pressable>

                                {/* Item information */}
                                <View className="min-w-0 flex-1">
                                    <Text
                                        numberOfLines={2}
                                        className={`text-base font-bold leading-6 ${
                                            item.isPurchased
                                                ? "text-slate-400 line-through"
                                                : "text-slate-900"
                                        }`}
                                    >
                                        {item.name}
                                    </Text>

                                    {item.amounts.length > 0 ? (
                                        <Text className="mt-1 text-sm text-slate-500">
                                            {item.amounts.join(" · ")}
                                        </Text>
                                    ) : (
                                        <Text className="mt-1 text-xs text-slate-400">
                                            No quantity specified
                                        </Text>
                                    )}

                                    {item.sourceRecipeIds.length > 0 ? (
                                        <Text className="mt-1 text-xs font-medium text-emerald-700">
                                            Added from{" "}
                                            {item.sourceRecipeIds.length}{" "}
                                            {item.sourceRecipeIds.length === 1
                                                ? "recipe"
                                                : "recipes"}
                                        </Text>
                                    ) : null}
                                </View>

                                {/* Edit and delete actions */}
                                <View className="flex-row items-center gap-1">
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Edit ${item.name}`}
                                        onPress={() => openEditModal(item)}
                                        className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
                                    >
                                        <Pencil
                                            size={17}
                                            color="#475569"
                                        />
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Delete ${item.name}`}
                                        onPress={() => handleDelete(item)}
                                        className="h-10 w-10 items-center justify-center rounded-xl bg-rose-50"
                                    >
                                        <Trash2
                                            size={17}
                                            color="#BE123C"
                                        />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Completion message */}
                {items.length > 0 && remainingCount === 0 ? (
                    <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <PackageCheck
                            size={25}
                            color="#047857"
                        />

                        <View className="flex-1">
                            <Text className="font-bold text-emerald-900">
                                Shopping completed!
                            </Text>

                            <Text className="mt-1 text-xs leading-5 text-emerald-800">
                                All your listed items have been marked as purchased.
                            </Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            {/* Add and edit modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeModal}
            >
                <View className="flex-1 justify-center px-5 py-6">
                    <Pressable
                        accessibilityLabel="Close shopping item form"
                        onPress={closeModal}
                        style={StyleSheet.absoluteFill}
                    >
                        <View className="flex-1 bg-slate-900/50" />
                    </Pressable>

                    <KeyboardAvoidingView
                        behavior={
                            Platform.OS === "ios"
                                ? "padding"
                                : undefined
                        }
                    >
                        <View className="w-full self-center rounded-2xl bg-white p-5" style={{ maxWidth: 460 }}>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xl font-bold text-slate-900">
                                    {editingItemId
                                        ? "Edit shopping item"
                                        : "Add shopping item"}
                                </Text>

                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Close"
                                    disabled={isSaving}
                                    onPress={closeModal}
                                    className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                                >
                                    <X
                                        size={19}
                                        color="#475569"
                                    />
                                </Pressable>
                            </View>

                            <Text className="mt-2 text-sm leading-5 text-slate-500">
                                Enter the ingredient or product you need to buy.
                            </Text>

                            <View className="mt-5">
                                <Text className="mb-2 text-sm font-semibold text-slate-800">
                                    Item name
                                </Text>

                                <TextInput
                                    value={itemName}
                                    onChangeText={setItemName}
                                    placeholder="e.g. Dark chocolate"
                                    placeholderTextColor="#94A3B8"
                                    autoCapitalize="words"
                                    maxLength={80}
                                    accessibilityLabel="Shopping item name"
                                    className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
                                />
                            </View>

                            <View className="mt-4">
                                <Text className="mb-2 text-sm font-semibold text-slate-800">
                                    Quantity or amount (optional)
                                </Text>

                                <TextInput
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="e.g. 200 g or 2 packs"
                                    placeholderTextColor="#94A3B8"
                                    maxLength={80}
                                    accessibilityLabel="Shopping item amount"
                                    className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
                                />
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                disabled={isSaving}
                                onPress={() => void handleSave()}
                                className={`mt-6 min-h-12 flex-row items-center justify-center rounded-xl px-5 py-3 ${
                                    isSaving
                                        ? "bg-emerald-500"
                                        : "bg-emerald-700"
                                }`}
                            >
                                <Text className="font-bold text-white">
                                    {isSaving
                                        ? "Saving..."
                                        : editingItemId
                                            ? "Save changes"
                                            : "Add to shopping list"}
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                disabled={isSaving}
                                onPress={closeModal}
                                className="mt-2 min-h-11 items-center justify-center rounded-xl px-5 py-3"
                            >
                                <Text className="font-semibold text-slate-500">
                                    Cancel
                                </Text>
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
