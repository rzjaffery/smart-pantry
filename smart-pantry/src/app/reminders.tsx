
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    View,
} from "react-native";
import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
    useReminderSettings,
    type ReminderSettings,
} from "../context/ReminderContext";

function createTimeDate(hour: number, minute: number) {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
}

function formatTime(hour: number, minute: number) {
    return createTimeDate(hour, minute).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function RemindersScreen() {
    const router = useRouter();

    const {
        settings,
        settingsLoaded,
        isSyncing,
        scheduledCount,
        error,
        saveSettings,
    } = useReminderSettings();

    const [draft, setDraft] =
        useState<ReminderSettings>(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const [saveNotice, setSaveNotice] = useState<string | null>(null);

    useEffect(() => {
        if (settingsLoaded) {
            setDraft(settings);
        }
    }, [settings, settingsLoaded]);

    const updateTime = (date: Date) => {
        setDraft((current) => ({
            ...current,
            hour: date.getHours(),
            minute: date.getMinutes(),
        }));
        setSaveNotice(null);
    };

    const openTimePicker = () => {
        const value = createTimeDate(draft.hour, draft.minute);

        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value,
                mode: "time",
                is24Hour: false,
                onValueChange: (_event, selectedDate) => {
                    if (selectedDate) {
                        updateTime(selectedDate);
                    }
                },
            });
            return;
        }

        if (Platform.OS === "ios") {
            setShowIOSPicker(true);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveNotice(null);

        try {
            const success = await saveSettings(draft);

            if (success) {
                setSaveNotice(
                    "Preferences saved. Your reminder schedule is updating.",
                );
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!settingsLoaded) {
        return (
            <SafeAreaView
                edges={["top"]}
                style={{ flex: 1, backgroundColor: "#F8FAFC" }}
            >
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#047857" />
                    <Text className="mt-3 text-slate-600">
                        Loading reminder preferences...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    paddingBottom: 36,
                }}
            >
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.back()}
                    className="self-start py-2"
                >
                    <Text className="font-semibold text-emerald-700">
                        ← Back to pantry
                    </Text>
                </Pressable>

                <View className="mt-5 self-start rounded-full bg-emerald-100 px-3 py-1.5">
                    <Text className="text-xs font-bold tracking-widest text-emerald-800">
                        SMART PANTRY
                    </Text>
                </View>

                <Text className="mt-4 text-3xl font-extrabold text-slate-900">
                    Daily reminders
                </Text>

                <Text className="mt-2 text-base leading-6 text-slate-600">
                    Get a gentle heads-up when pantry items are due to expire
                    the following day.
                </Text>

                <View className="mt-7 rounded-2xl border border-slate-200 bg-white p-4">
                    <View className="flex-row items-center justify-between gap-4">
                        <View className="flex-1">
                            <Text className="text-base font-bold text-slate-900">
                                Expiry reminders
                            </Text>
                            <Text className="mt-1 text-sm leading-5 text-slate-500">
                                Schedule local notifications on this device.
                            </Text>
                        </View>

                        <Switch
                            value={draft.enabled}
                            onValueChange={(enabled) => {
                                setDraft((current) => ({
                                    ...current,
                                    enabled,
                                }));
                                setSaveNotice(null);
                            }}
                            trackColor={{
                                false: "#CBD5E1",
                                true: "#059669",
                            }}
                            thumbColor="#FFFFFF"
                            accessibilityLabel="Enable daily expiry reminders"
                        />
                    </View>

                    <View className="mt-5 border-t border-slate-100 pt-5">
                        <Text className="text-sm font-semibold text-slate-800">
                            Reminder time
                        </Text>

                        <Text className="mt-1 text-sm text-slate-500">
                            Choose when Smart Pantry should notify you.
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={openTimePicker}
                            className="mt-3 flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                            <Text className="text-base font-bold text-slate-900">
                                {formatTime(draft.hour, draft.minute)}
                            </Text>
                            <Text className="font-semibold text-emerald-700">
                                Change time
                            </Text>
                        </Pressable>
                    </View>

                    {Platform.OS === "ios" && showIOSPicker ? (
                        <View className="mt-4">
                            <DateTimePicker
                                value={createTimeDate(draft.hour, draft.minute)}
                                mode="time"
                                display="spinner"
                                onValueChange={(_event, selectedDate) => {
                                    if (selectedDate) {
                                        updateTime(selectedDate);
                                    }
                                }}
                            />

                            <Pressable
                                onPress={() => setShowIOSPicker(false)}
                                className="mt-2 self-start rounded-lg bg-emerald-700 px-4 py-2"
                            >
                                <Text className="font-semibold text-white">
                                    Done
                                </Text>
                            </Pressable>
                        </View>
                    ) : null}
                </View>

                <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => void handleSave()}
                    className={`mt-6 items-center rounded-xl px-5 py-4 ${
                        isSaving ? "bg-emerald-400" : "bg-emerald-700"
                    }`}
                >
                    <Text className="font-bold text-white">
                        {isSaving ? "Saving..." : "Save preferences"}
                    </Text>
                </Pressable>

                {saveNotice ? (
                    <Text className="mt-3 text-sm leading-5 text-emerald-800">
                        {saveNotice}
                    </Text>
                ) : null}

                {error ? (
                    <View className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <Text className="text-sm leading-5 text-amber-900">
                            {error}
                        </Text>
                    </View>
                ) : null}

                <View className="mt-5 rounded-2xl bg-slate-100 p-4">
                    <Text className="font-bold text-slate-800">
                        Schedule status
                    </Text>

                    <Text className="mt-2 text-sm leading-5 text-slate-600">
                        {!draft.enabled
                            ? "Reminders are off. Save your preferences to keep them disabled."
                            : isSyncing
                                ? "Refreshing your upcoming reminders..."
                                : `${scheduledCount} expiry reminder${scheduledCount === 1 ? "" : "s"} currently scheduled.`}
                    </Text>
                </View>

                <Text className="mt-5 text-xs leading-5 text-slate-500">
                    Reminders are calculated from pantry data saved on this
                    device. Keep Smart Pantry up to date by opening it after
                    making changes on another device or after reinstalling the app.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
