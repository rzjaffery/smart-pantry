
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
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
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CalendarDays,
    Check,
    ChevronRight,
    MapPin,
    PackagePlus,
    Save,
    Scale,
    X,
} from "lucide-react-native";

import { usePantry } from "@/context/PantryContext";
import { formatExpiryDate, toDateKey } from "@/lib/expiry";
import {
    PANTRY_LOCATIONS,
    type PantryLocation,
} from "@/types/pantry";

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

export default function AddItemScreen() {
    const router = useRouter();
    const { addItem } = usePantry();

    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [unit, setUnit] = useState<string>("pieces");
    const [location, setLocation] =
        useState<PantryLocation>("Fridge");
    const [expiryDate, setExpiryDate] =
        useState<Date>(getTomorrow);
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const openDatePicker = () => {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: expiryDate,
                mode: "date",
                display: "calendar",
                minimumDate: getTodayAtMidnight(),
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
            return;
        }

        Alert.alert(
            "Open on your phone",
            "Use Expo Go on Android or iOS to select an expiry date.",
        );
    };

    const handleSave = async () => {
        if (isSaving) return;

        const trimmedName = name.trim();
        const trimmedUnit = unit.trim();
        const parsedQuantity = Number(quantity);

        if (!trimmedName) {
            Alert.alert(
                "Item name required",
                "Enter the name of your food item.",
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
                name: trimmedName,
                quantity: parsedQuantity,
                unit: trimmedUnit,
                location,
                expiryDate: expiryDateKey,
            });

            router.back();
        } catch (error) {
            console.error("Failed to save pantry item:", error);

            Alert.alert(
                "Couldn't save item",
                "Your pantry item wasn't saved. Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const expiryDateLabel = formatExpiryDate(toDateKey(expiryDate));

    return (
        <SafeAreaView
            className="flex-1 bg-slate-50"
            edges={["top", "right", "bottom", "left"]}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 32,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Page heading */}
                    <View className="flex-row items-center justify-between">
                        <View className="min-w-0 flex-1 pr-3">
                            <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                                SMART PANTRY
                            </Text>

                            <Text className="mt-2 text-3xl font-bold text-slate-900">
                                Add an item
                            </Text>

                            <Text className="mt-2 text-sm leading-6 text-slate-600">
                                Add your food and keep track of when it expires.
                            </Text>
                        </View>

                        <View className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                            <PackagePlus
                                size={28}
                                color="#047857"
                                strokeWidth={1.8}
                            />
                        </View>
                    </View>

                    {/* Form container */}
                    <View className="mt-7 rounded-2xl border border-slate-200 bg-white p-4">
                        {/* Item name */}
                        <View>
                            <Text className="mb-2 text-sm font-semibold text-slate-800">
                                Item name
                            </Text>

                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g. Fresh milk"
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="words"
                                autoCorrect={false}
                                maxLength={80}
                                returnKeyType="next"
                                accessibilityLabel="Item name"
                                className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
                            />
                        </View>

                        {/* Quantity and unit */}
                        <View className="mt-5">
                            <View className="mb-3 flex-row items-center gap-2">
                                <Scale
                                    size={17}
                                    color="#047857"
                                />
                                <Text className="text-sm font-semibold text-slate-800">
                                    Quantity
                                </Text>
                            </View>

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
                                        accessibilityLabel="Quantity amount"
                                        className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base text-slate-900"
                                    />
                                </View>

                                <View className="min-w-0 flex-1">
                                    <Text className="mb-2 text-xs font-medium text-slate-500">
                                        Unit
                                    </Text>

                                    <View className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
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
                        <View className="mt-6">
                            <View className="mb-3 flex-row items-center gap-2">
                                <MapPin
                                    size={17}
                                    color="#047857"
                                />
                                <Text className="text-sm font-semibold text-slate-800">
                                    Storage location
                                </Text>
                            </View>

                            <View className="flex-row flex-wrap gap-2">
                                {PANTRY_LOCATIONS.map((option) => {
                                    const selected = location === option;

                                    return (
                                        <Pressable
                                            key={option}
                                            accessibilityRole="radio"
                                            accessibilityState={{ selected }}
                                            onPress={() => setLocation(option)}
                                            className={`flex-row items-center gap-2 rounded-xl border px-3 py-3 ${
                                                selected
                                                    ? "border-emerald-700 bg-emerald-50"
                                                    : "border-slate-200 bg-slate-50"
                                            }`}
                                        >
                                            {selected ? (
                                                <Check
                                                    size={15}
                                                    color="#047857"
                                                    strokeWidth={2.5}
                                                />
                                            ) : null}

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
                        <View className="mt-6">
                            <View className="mb-3 flex-row items-center gap-2">
                                <CalendarDays
                                    size={17}
                                    color="#047857"
                                />
                                <Text className="text-sm font-semibold text-slate-800">
                                    Expiry date
                                </Text>
                            </View>

                            <Pressable
                                onPress={openDatePicker}
                                accessibilityRole="button"
                                accessibilityLabel={`Choose expiry date, currently ${expiryDateLabel}`}
                                className="min-h-14 flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                            >
                                <View className="min-w-0 flex-1 pr-2">
                                    <Text className="text-xs text-slate-500">
                                        Selected date
                                    </Text>

                                    <Text className="mt-1 text-sm font-semibold text-slate-900">
                                        {expiryDateLabel}
                                    </Text>
                                </View>

                                <View className="flex-row items-center gap-1">
                                    <Text className="text-sm font-semibold text-emerald-700">
                                        Change
                                    </Text>

                                    <ChevronRight
                                        size={17}
                                        color="#047857"
                                    />
                                </View>
                            </Pressable>

                            <Text className="mt-2 text-xs leading-5 text-slate-500">
                                Choose today or a future date.
                            </Text>
                        </View>

                        {/* Inline iOS date picker */}
                        {Platform.OS === "ios" && showIOSPicker && (
                            <View className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <DateTimePicker
                                    value={expiryDate}
                                    mode="date"
                                    display="spinner"
                                    minimumDate={getTodayAtMidnight()}
                                    onChange={(_event, selectedDate) => {
                                        if (selectedDate) {
                                            setExpiryDate(selectedDate);
                                        }
                                    }}
                                />

                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => setShowIOSPicker(false)}
                                    className="mt-2 items-center rounded-xl bg-emerald-700 px-4 py-3"
                                >
                                    <Text className="font-semibold text-white">
                                        Done
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Form actions */}
                    <Pressable
                        onPress={() => void handleSave()}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel="Save pantry item"
                        className={`mt-6 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 ${
                            isSaving ? "bg-emerald-500" : "bg-emerald-700"
                        }`}
                    >
                        {isSaving ? (
                            <Text className="text-base font-bold text-white">
                                Saving item...
                            </Text>
                        ) : (
                            <>
                                <Save
                                    size={19}
                                    color="#FFFFFF"
                                    strokeWidth={2}
                                />

                                <Text className="text-base font-bold text-white">
                                    Save pantry item
                                </Text>
                            </>
                        )}
                    </Pressable>

                    <Pressable
                        onPress={() => router.back()}
                        disabled={isSaving}
                        accessibilityRole="button"
                        className="mt-3 min-h-12 flex-row items-center justify-center gap-2 rounded-xl px-5 py-3"
                    >
                        <X
                            size={17}
                            color="#64748B"
                        />

                        <Text className="font-semibold text-slate-600">
                            Cancel
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
