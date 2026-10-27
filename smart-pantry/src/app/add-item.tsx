
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

import { usePantry } from "@/context/PantryContext";
import { formatExpiryDate, toDateKey } from "@/lib/expiry";
import {
    PANTRY_LOCATIONS,
    type PantryLocation,
} from "@/types/pantry";

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
    const [unit, setUnit] = useState("item");
    const [location, setLocation] =
        useState<PantryLocation>("Fridge");
    const [expiryDate, setExpiryDate] = useState(getTomorrow);
    const [showIOSPicker, setShowIOSPicker] = useState(false);


    const openDatePicker = () => {
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
    };


    const handleSave = () => {
        const trimmedName = name.trim();
        const trimmedUnit = unit.trim();
        const parsedQuantity = Number(quantity);

        if (!trimmedName) {
            Alert.alert("Item name required", "Enter the name of your food item.");
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
            Alert.alert("Unit required", "Enter a unit such as kg, bottles, or pieces.");
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

        addItem({
            name: trimmedName,
            quantity: parsedQuantity,
            unit: trimmedUnit,
            location,
            expiryDate: expiryDateKey,
        });

        router.back();
    };

    const expiryDateLabel = formatExpiryDate(toDateKey(expiryDate));

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 24,
                    paddingBottom: 40,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                    SMART PANTRY
                </Text>

                <Text className="mt-2 text-3xl font-bold text-slate-900">
                    Add an item
                </Text>

                <Text className="mt-2 text-base leading-6 text-slate-600">
                    Keep track of your ingredients before they expire.
                </Text>

                <View className="mt-7">
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

                <View className="mt-5">
                    <Text className="mb-2 text-sm font-semibold text-slate-800">
                        Quantity
                    </Text>

                    <View className="flex-row gap-3">
                        <TextInput
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder="1"
                            keyboardType="decimal-pad"
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
                        />

                        <TextInput
                            value={unit}
                            onChangeText={setUnit}
                            placeholder="e.g. kg"
                            maxLength={20}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
                        />
                    </View>
                </View>

                <View className="mt-5">
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
                                    className={`rounded-full border px-4 py-3 ${
                                        selected
                                            ? "border-emerald-700 bg-emerald-50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${
                                            selected ? "text-emerald-800" : "text-slate-600"
                                        }`}
                                    >
                                        {option}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View className="mt-5">
                    <Text className="mb-2 text-sm font-semibold text-slate-800">
                        Expiry date
                    </Text>

                    <Pressable
                        onPress={openDatePicker}
                        accessibilityRole="button"
                        className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4"
                    >
                        <Text className="text-base font-medium text-slate-800">
                            {expiryDateLabel}
                        </Text>

                        <Text className="text-sm font-semibold text-emerald-700">
                            Choose date
                        </Text>
                    </Pressable>

                    <Text className="mt-2 text-xs text-slate-500">
                        Expiry date cannot be earlier than today.
                    </Text>
                </View>

                {Platform.OS === "ios" && showIOSPicker && (
                    <View className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                        <DateTimePicker
                            value={expiryDate}
                            mode="date"
                            display="spinner"
                            minimumDate={getTodayAtMidnight()}
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

                <Pressable
                    onPress={handleSave}
                    className="mt-8 items-center rounded-xl bg-emerald-700 px-5 py-4"
                >
                    <Text className="text-base font-bold text-white">
                        Save pantry item
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => router.back()}
                    className="mt-3 items-center rounded-xl px-5 py-3"
                >
                    <Text className="font-semibold text-slate-600">
                        Cancel
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
