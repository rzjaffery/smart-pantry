import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import {
    CalendarDays,
    CheckCircle2,
    ShoppingBasket,
    X,
} from "lucide-react-native";

import { usePantry } from "@/context/PantryContext";
import { useShoppingList } from "@/context/ShoppingListContext";
import { formatExpiryDate, toDateKey } from "@/lib/expiry";
import {
    PANTRY_LOCATIONS,
    type PantryLocation,
} from "@/types/pantry";
import type { ShoppingListItem } from "@/types/shopping";

type TransferPurchasedItemProps = {
    item: ShoppingListItem;
};

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

function getTodayAtMidnight(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getTomorrow(): Date {
    const tomorrow = getTodayAtMidnight();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}

export function TransferPurchasedItem({
                                          item,
                                      }: TransferPurchasedItemProps) {
    const { addItem } = usePantry();
    const { deleteItem: deleteShoppingItem } = useShoppingList();

    const [modalVisible, setModalVisible] = useState(false);
    const [quantity, setQuantity] = useState("1");
    const [unit, setUnit] = useState<string>("pieces");
    const [location, setLocation] =
        useState<PantryLocation>("Fridge");
    const [expiryDate, setExpiryDate] = useState<Date>(getTomorrow);
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [wasAddedToPantry, setWasAddedToPantry] = useState(false);

    function closeModal() {
        if (isSaving) {
            return;
        }

        setModalVisible(false);
        setShowIOSPicker(false);
    }

    function openModal() {
        setQuantity("1");
        setUnit("pieces");
        setLocation("Fridge");
        setExpiryDate(getTomorrow());
        setShowIOSPicker(false);
        setModalVisible(true);
    }

    function openDatePicker() {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: expiryDate,
                mode: "date",
                display: "calendar",
                minimumDate: getTodayAtMidnight(),
                onValueChange: (_event, selectedDate) => {
                    if (selectedDate) {
                        setExpiryDate(selectedDate);
                    }
                },
            });

            return;
        }

        if (Platform.OS === "ios") {
            setShowIOSPicker(true);
            return;
        }

        Alert.alert(
            "Open on your phone",
            "Use Expo Go on Android or iOS to select an expiry date.",
        );
    }

    async function handleTransfer() {
        if (isSaving || wasAddedToPantry) {
            return;
        }

        const parsedQuantity = Number(quantity);
        const trimmedUnit = unit.trim();

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
                "Please select a unit for this item.",
            );
            return;
        }

        const expiryDateKey = toDateKey(expiryDate);
        const todayKey = toDateKey(new Date());

        if (expiryDateKey < todayKey) {
            Alert.alert(
                "Invalid expiry date",
                "Please select today or a future date.",
            );
            return;
        }

        setIsSaving(true);

        try {
            await addItem({
                name: item.name.trim(),
                quantity: parsedQuantity,
                unit: trimmedUnit,
                location,
                expiryDate: expiryDateKey,
            });

            setWasAddedToPantry(true);
            setModalVisible(false);
            setShowIOSPicker(false);

            try {
                await deleteShoppingItem(item.id);

                Alert.alert(
                    "Added to pantry",
                    `${item.name} was saved to your pantry and removed from your shopping list.`,
                );
            } catch (deleteError) {
                console.error(
                    "Pantry item was saved, but shopping-list removal failed:",
                    deleteError,
                );

                Alert.alert(
                    "Added to pantry",
                    `${item.name} was saved successfully, but its shopping-list entry could not be removed. Remove that entry manually to avoid transferring it again.`,
                );
            }
        } catch (error) {
            console.error(
                "Failed to transfer shopping item to pantry:",
                error,
            );

            Alert.alert(
                "Couldn't add item to pantry",
                error instanceof Error
                    ? error.message
                    : "Your item could not be saved. Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (!item.isPurchased) {
        return null;
    }

    return (
        <>
            <Pressable
                accessibilityRole="button"
                disabled={wasAddedToPantry}
                onPress={openModal}
                className={`mt-3 min-h-11 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3 ${
                    wasAddedToPantry
                        ? "bg-emerald-50"
                        : "bg-emerald-700"
                }`}
            >
                {wasAddedToPantry ? (
                    <>
                        <CheckCircle2
                            size={18}
                            color="#047857"
                        />
                        <Text className="font-semibold text-emerald-800">
                            Added to pantry
                        </Text>
                    </>
                ) : (
                    <>
                        <ShoppingBasket
                            size={18}
                            color="#FFFFFF"
                        />
                        <Text className="font-semibold text-white">
                            Add to Pantry
                        </Text>
                    </>
                )}
            </Pressable>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
                onRequestClose={closeModal}
            >
                <KeyboardAvoidingView
                    behavior={
                        Platform.OS === "ios"
                            ? "padding"
                            : undefined
                    }
                    className="flex-1 justify-center bg-black/50 px-4 py-6"
                >
                    <View className="max-h-[90%] w-full self-center overflow-hidden rounded-3xl bg-slate-50">
                        <ScrollView
                            contentContainerStyle={{
                                paddingHorizontal: 20,
                                paddingTop: 20,
                                paddingBottom: 28,
                            }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="flex-row items-start justify-between">
                                <View className="min-w-0 flex-1 pr-4">
                                    <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                                        SMART PANTRY
                                    </Text>

                                    <Text className="mt-2 text-2xl font-bold text-slate-900">
                                        Add to pantry
                                    </Text>

                                    <Text className="mt-2 text-sm leading-5 text-slate-600">
                                        Enter the details of the item you
                                        purchased.
                                    </Text>
                                </View>

                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Close transfer form"
                                    onPress={closeModal}
                                    disabled={isSaving}
                                    className="rounded-full bg-white p-2"
                                >
                                    <X
                                        size={21}
                                        color="#475569"
                                    />
                                </Pressable>
                            </View>

                            <View className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <Text className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                                    Purchased item
                                </Text>

                                <Text className="mt-1 text-lg font-bold text-slate-900">
                                    {item.name}
                                </Text>

                                {item.amounts.length > 0 ? (
                                    <Text className="mt-1 text-sm leading-5 text-slate-600">
                                        Shopping-list amount:{" "}
                                        {item.amounts.join(", ")}
                                    </Text>
                                ) : null}

                                <Text className="mt-2 text-xs leading-5 text-slate-600">
                                    Use the amount above as a reference.
                                    Enter the actual quantity and unit you
                                    purchased below.
                                </Text>
                            </View>

                            {/* Quantity */}
                            <View className="mt-5">
                                <Text className="mb-2 text-sm font-semibold text-slate-800">
                                    Quantity
                                </Text>

                                <View className="flex-row gap-3">
                                    <View className="min-w-0 flex-1">
                                        <Text className="mb-2 text-xs font-medium text-slate-500">
                                            Amount
                                        </Text>

                                        <TextInput
                                            value={quantity}
                                            onChangeText={setQuantity}
                                            placeholder="1"
                                            placeholderTextColor="#94A3B8"
                                            keyboardType="decimal-pad"
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
                                        />
                                    </View>

                                    <View className="min-w-0 flex-1">
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
                            </View>

                            {/* Storage location */}
                            <View className="mt-5">
                                <Text className="mb-3 text-sm font-semibold text-slate-800">
                                    Storage location
                                </Text>

                                <View className="flex-row flex-wrap gap-2">
                                    {PANTRY_LOCATIONS.map((option) => {
                                        const selected =
                                            location === option;

                                        return (
                                            <Pressable
                                                key={option}
                                                accessibilityRole="radio"
                                                accessibilityState={{
                                                    selected,
                                                }}
                                                onPress={() =>
                                                    setLocation(option)
                                                }
                                                className={`rounded-full border px-4 py-3 ${
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

                            {/* Expiry date */}
                            <View className="mt-5">
                                <Text className="mb-2 text-sm font-semibold text-slate-800">
                                    Expiry date
                                </Text>

                                <Pressable
                                    accessibilityRole="button"
                                    onPress={openDatePicker}
                                    className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4"
                                >
                                    <View className="flex-row items-center gap-2">
                                        <CalendarDays
                                            size={19}
                                            color="#047857"
                                        />

                                        <Text className="text-base font-medium text-slate-800">
                                            {formatExpiryDate(
                                                toDateKey(expiryDate),
                                            )}
                                        </Text>
                                    </View>

                                    <Text className="text-sm font-semibold text-emerald-700">
                                        Choose date
                                    </Text>
                                </Pressable>

                                <Text className="mt-2 text-xs text-slate-500">
                                    Select the expiry date shown on the
                                    product packaging.
                                </Text>
                            </View>

                            {/* iOS date picker */}
                            {Platform.OS === "ios" && showIOSPicker ? (
                                <View className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                                    <DateTimePicker
                                        value={expiryDate}
                                        mode="date"
                                        display="spinner"
                                        minimumDate={getTodayAtMidnight()}
                                        onValueChange={(
                                            _event,
                                            selectedDate,
                                        ) => {
                                            if (selectedDate) {
                                                setExpiryDate(selectedDate);
                                            }
                                        }}
                                    />

                                    <Pressable
                                        onPress={() =>
                                            setShowIOSPicker(false)
                                        }
                                        className="items-center rounded-lg bg-emerald-700 px-4 py-3"
                                    >
                                        <Text className="font-semibold text-white">
                                            Done
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : null}

                            {/* Save */}
                            <Pressable
                                accessibilityRole="button"
                                disabled={isSaving}
                                onPress={() => {
                                    void handleTransfer();
                                }}
                                className={`mt-7 min-h-12 items-center justify-center rounded-xl px-5 py-4 ${
                                    isSaving
                                        ? "bg-emerald-500"
                                        : "bg-emerald-700"
                                }`}
                            >
                                <Text className="font-bold text-white">
                                    {isSaving
                                        ? "Adding to pantry..."
                                        : "Save to pantry"}
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                disabled={isSaving}
                                onPress={closeModal}
                                className="mt-2 items-center rounded-xl px-5 py-3"
                            >
                                <Text className="font-semibold text-slate-500">
                                    Cancel
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}