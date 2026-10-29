import { useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { PantryItemCard } from "./PantryItemCard";
import { usePantry } from "../context/PantryContext";
import { formatExpiryDate, toDateKey } from "../lib/expiry";

import {
    PANTRY_LOCATIONS,
    type PantryItem,
    type PantryLocation,
    type PantryOutcome,
} from "../types/pantry";
import { Check, Pencil, Trash2, X } from "lucide-react-native";
import {Picker} from "@react-native-picker/picker";

const UNIT_OPTIONS = [
    { label: "Pieces", value: "pieces" },
    { label: "Kilograms (kg)", value: "kg" },
    { label: "Grams (g)", value: "g" },
    { label: "Litres (L)", value: "litre" },
    { label: "Millilitres (ml)", value: "ml" },
    { label: "Carton", value: "carton" },
    { label: "Bottle", value: "bottle" },
    { label: "Can", value: "can" },
    { label: "Jar", value: "jar" },
    { label: "Pack", value: "pack" },
    { label: "Packet", value: "packet" },
    { label: "Bag", value: "bag" },
    { label: "Dozen", value: "dozen" },
    { label: "Bunch", value: "bunch" },
    { label: "Loaf", value: "loaf" },
    { label: "Slice", value: "slice" },
    { label: "Cup", value: "cup" },
] as const;

type SwipeablePantryItemProps = {
    item: PantryItem;
    onComplete: (
        id: string,
        outcome: PantryOutcome,
    ) => Promise<void>;
};

function dateFromKey(dateKey: string): Date {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function SwipeablePantryItem({
                                        item,
                                        onComplete,
                                    }: SwipeablePantryItemProps) {
    const { updateItem, deleteItem } = usePantry();

    const [isSaving, setIsSaving] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [showIOSPicker, setShowIOSPicker] = useState(false);

    const [name, setName] = useState(item.name);
    const [quantity, setQuantity] = useState(String(item.quantity));
    const [unit, setUnit] = useState(item.unit);
    const [location, setLocation] =
        useState<PantryLocation>(item.location);
    const [expiryDate, setExpiryDate] = useState<Date>(
        () => dateFromKey(item.expiryDate),
    );

    const openEdit = () => {
        // Start with the latest saved values every time Edit is opened.
        setName(item.name);
        setQuantity(String(item.quantity));
        setUnit(item.unit);
        setLocation(item.location);
        setExpiryDate(dateFromKey(item.expiryDate));
        setShowIOSPicker(false);

        setMenuVisible(false);
        setEditVisible(true);
    };

    const handleComplete = async (outcome: PantryOutcome) => {
        if (isSaving) return;

        setIsSaving(true);

        try {
            await onComplete(item.id, outcome);
        } catch (error) {
            console.error("Pantry item update failed:", error);

            Alert.alert(
                "Couldn't update item",
                "Your pantry change could not be saved. Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setMenuVisible(false);

        Alert.alert(
            "Delete pantry item?",
            `Are you sure you want to delete "${item.name}"? This will remove it from your active pantry without adding it to History.`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        void (async () => {
                            if (isSaving) return;

                            setIsSaving(true);

                            try {
                                await deleteItem(item.id);
                            } catch (error) {
                                console.error(
                                    "Failed to delete pantry item:",
                                    error,
                                );

                                Alert.alert(
                                    "Couldn't delete item",
                                    "The item could not be deleted. Please try again.",
                                );
                            } finally {
                                setIsSaving(false);
                            }
                        })();
                    },
                },
            ],
        );
    };

    const openDatePicker = () => {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: expiryDate,
                mode: "date",
                display: "calendar",
                onChange: (event, selectedDate) => {
                    if (event.type === "set" && selectedDate) {
                        setExpiryDate(selectedDate);
                    }
                },
            });
            return;
        }

        if (Platform.OS === "ios") {
            setShowIOSPicker(true);
        }
    };

    const handleSaveEdit = async () => {
        if (isSaving) return;

        const trimmedName = name.trim();
        const trimmedUnit = unit.trim();
        const parsedQuantity = Number(quantity);

        if (!trimmedName) {
            Alert.alert(
                "Item name required",
                "Enter a name for this pantry item.",
            );
            return;
        }

        if (
            quantity.trim() === "" ||
            !Number.isFinite(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            Alert.alert(
                "Invalid quantity",
                "Enter a quantity greater than zero.",
            );
            return;
        }

        if (!trimmedUnit) {
            Alert.alert(
                "Unit required",
                "Enter a unit such as kg, bottles, or pieces.",
            );
            return;
        }

        const expiryDateKey = toDateKey(expiryDate);

        setIsSaving(true);

        try {
            await updateItem(item.id, {
                name: trimmedName,
                quantity: parsedQuantity,
                unit: trimmedUnit,
                location,
                expiryDate: expiryDateKey,
            });

            setEditVisible(false);
            setShowIOSPicker(false);
        } catch (error) {
            console.error("Failed to edit pantry item:", error);

            Alert.alert(
                "Couldn't save changes",
                "Your edits could not be saved. Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const expiryDateLabel = formatExpiryDate(toDateKey(expiryDate));

    return (
        <>
            {/* The swipe actions remain unchanged. */}
                <ReanimatedSwipeable
                    friction={2}
                    rightThreshold={40}
                    overshootRight={false}
                    containerStyle={{
                        marginBottom: 12,
                        borderRadius: 16,
                        overflow: "hidden",
                    }}
                    renderRightActions={() => (
                        <View className="flex-row">
                            <Pressable
                                disabled={isSaving}
                                accessibilityRole="button"
                                accessibilityLabel={`Mark ${item.name} as consumed`}
                                onPress={() => void handleComplete("consumed")}
                                className="w-24 items-center justify-center bg-emerald-700 px-2"
                            >
                                <Check
                                    size={22}
                                    color="#FFFFFF"
                                    strokeWidth={2.5}
                                />
                                <Text className="text-center text-xs font-bold text-white">
                                    Consumed
                                </Text>
                            </Pressable>

                            <Pressable
                                disabled={isSaving}
                                accessibilityRole="button"
                                accessibilityLabel={`Mark ${item.name} as wasted`}
                                onPress={() => void handleComplete("wasted")}
                                className="w-24 items-center justify-center bg-rose-700 px-2"
                            >
                                <X
                                    size={22}
                                    color="#FFFFFF"
                                    strokeWidth={2.5}
                                />
                                <Text className="text-center text-xs font-bold text-white">
                                    Wasted
                                </Text>
                            </Pressable>
                        </View>
                    )}
                >
                    <Pressable
                        disabled={isSaving}
                        delayLongPress={450}
                        onLongPress={() => setMenuVisible(true)}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.name}. Press and hold for edit or delete options.`}
                        accessibilityHint="Press and hold to edit or delete this pantry item. Swipe right for consumed or wasted."
                    >
                        <PantryItemCard item={item} />
                    </Pressable>
                </ReanimatedSwipeable>

            {/* Floating menu opened by a long press. */}
                <Modal
                    visible={menuVisible}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => setMenuVisible(false)}
                >
                    <View className="flex-1 items-center justify-center px-6">
                        <Pressable
                            accessibilityLabel="Close item menu"
                            onPress={() => setMenuVisible(false)}
                            style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: "rgba(15, 23, 42, 0.45)" },
                            ]}
                        />

                        <View className="w-full max-w-md rounded-2xl bg-white p-5">
                            <Text className="text-lg font-bold text-slate-900">
                                {item.name}
                            </Text>

                            <Text className="mt-1 text-sm text-slate-500">
                                What would you like to do with this item?
                            </Text>

                            <Pressable
                                accessibilityRole="button"
                                onPress={openEdit}
                                className="mt-5 flex-row items-center rounded-xl bg-emerald-50 px-4 py-4"
                            >
                                <Pencil size={21} color="#047857" strokeWidth={2} />
                                <View className="flex-1 pl-3">
                                    <Text className="font-bold text-emerald-800">
                                        Edit item
                                    </Text>
                                    <Text className="mt-1 text-sm text-emerald-700">
                                        Change its details
                                    </Text>
                                </View>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                onPress={handleDelete}
                                className="mt-3 flex-row items-center rounded-xl bg-rose-50 px-4 py-4"
                            >
                                <View className="mr-3">
                                    <Trash2
                                        size={21}
                                        color="#BE123C"
                                        strokeWidth={2}
                                    />
                                </View>
                                <View className="flex-1 pl-1 ">
                                    <Text className="font-bold text-rose-700">
                                        Delete item
                                    </Text>
                                    <Text className="mt-1 text-sm text-rose-600">
                                        Remove it from your active pantry
                                    </Text>
                                </View>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                onPress={() => setMenuVisible(false)}
                                className="mt-3 items-center rounded-xl px-4 py-3"
                            >
                                <Text className="font-semibold text-slate-500">
                                    Cancel
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                {/* Edit form shown as a floating popup over the dashboard. */}
                <Modal
                    visible={editVisible}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => {
                        setEditVisible(false);
                        setShowIOSPicker(false);
                    }}
                >
                    <View className="flex-1 justify-center px-5 py-6">
                        <Pressable
                            accessibilityLabel="Close edit form"
                            onPress={() => {
                                if (!isSaving) {
                                    setEditVisible(false);
                                    setShowIOSPicker(false);
                                }
                            }}
                            style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: "rgba(15, 23, 42, 0.5)" },
                            ]}
                        />

                        <View
                            className="w-full self-center overflow-hidden rounded-2xl bg-slate-50"
                            style={{ maxWidth: 480, maxHeight: "90%" }}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingTop: 20,
                                    paddingBottom: 24,
                                }}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                                    SMART PANTRY
                                </Text>

                                <Text className="mt-2 text-2xl font-bold text-slate-900">
                                    Edit item
                                </Text>

                                <Text className="mt-1 text-sm text-slate-500">
                                    Update the details for {item.name}.
                                </Text>

                                <View className="mt-5">
                                    <Text className="mb-2 text-sm font-semibold text-slate-800">
                                        Item name
                                    </Text>

                                    <TextInput
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="e.g. Fresh milk"
                                        placeholderTextColor="#94A3B8"
                                        autoCapitalize="words"
                                        maxLength={80}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
                                    />
                                </View>

                                <View className="flex-row gap-3 pt-4">
                                    <View className="flex-1">
                                        <Text className="mb-2 text-xs font-medium text-slate-500">
                                            Amount
                                        </Text>

                                        <TextInput
                                            value={quantity}
                                            onChangeText={setQuantity}
                                            placeholder="1"
                                            placeholderTextColor="#94A3B8"
                                            keyboardType="decimal-pad"
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900"
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <Text className="mb-2 text-xs font-medium text-slate-500">
                                            Unit
                                        </Text>

                                        <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                            <Picker
                                                selectedValue={unit}
                                                onValueChange={(value: string) =>
                                                    setUnit(value)
                                                }
                                                mode="dropdown"
                                                dropdownIconColor="#047857"
                                                prompt="Select a unit"
                                                style={{
                                                    height: 52,
                                                    color: "#0F172A",
                                                }}
                                            >
                                                {UNIT_OPTIONS.map((option) => (
                                                    <Picker.Item
                                                        key={option.value}
                                                        label={option.label}
                                                        value={option.value}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                </View>

                                <View className="mt-4">
                                    <Text className="mb-3 text-sm font-semibold text-slate-800">
                                        Storage location
                                    </Text>

                                    <View className="flex-row flex-wrap gap-2">
                                        {PANTRY_LOCATIONS.map((option) => {
                                            const selected = location === option;

                                            return (
                                                <Pressable
                                                    key={option}
                                                    accessibilityRole="radio"
                                                    accessibilityState={{ selected }}
                                                    onPress={() => setLocation(option)}
                                                    className={`rounded-full border px-3 py-3 ${
                                                        selected
                                                            ? "border-emerald-700 bg-emerald-50"
                                                            : "border-slate-200 bg-white"
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-sm font-semibold ${
                                                            selected
                                                                ? "text-emerald-800"
                                                                : "text-slate-600"
                                                        }`}
                                                    >
                                                        {option}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View className="mt-4">
                                    <Text className="mb-2 text-sm font-semibold text-slate-800">
                                        Expiry date
                                    </Text>

                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={openDatePicker}
                                        className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4"
                                    >
                                        <Text className="text-base font-medium text-slate-800">
                                            {expiryDateLabel}
                                        </Text>

                                        <Text className="text-sm font-semibold text-emerald-700">
                                            Choose date
                                        </Text>
                                    </Pressable>

                                    {Platform.OS === "ios" && showIOSPicker && (
                                        <View className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                                            <DateTimePicker
                                                value={expiryDate}
                                                mode="date"
                                                display="spinner"
                                                onValueChange={(_event, selectedDate) => {
                                                    if (selectedDate) {
                                                        setExpiryDate(selectedDate);
                                                    }
                                                }}
                                            />

                                            <Pressable
                                                onPress={() => setShowIOSPicker(false)}
                                                className="items-center rounded-lg bg-emerald-700 px-4 py-3"
                                            >
                                                <Text className="font-semibold text-white">
                                                    Done
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>

                                <Pressable
                                    accessibilityRole="button"
                                    disabled={isSaving}
                                    onPress={() => void handleSaveEdit()}
                                    className={`mt-6 items-center rounded-xl px-5 py-4 ${
                                        isSaving ? "bg-emerald-500" : "bg-emerald-700"
                                    }`}
                                >
                                    <Text className="font-bold text-white">
                                        {isSaving ? "Saving..." : "Save changes"}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    accessibilityRole="button"
                                    disabled={isSaving}
                                    onPress={() => {
                                        setEditVisible(false);
                                        setShowIOSPicker(false);
                                    }}
                                    className="mt-2 items-center rounded-xl px-5 py-3"
                                >
                                    <Text className="font-semibold text-slate-600">
                                        Cancel
                                    </Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
        </>
    );
}
