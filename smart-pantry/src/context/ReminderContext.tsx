
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";

import { usePantry } from "./PantryContext";
import {
    cancelExpiryReminders,
    requestReminderPermission,
    scheduleExpiryReminders,
} from "@/lib/notifications";

export type ReminderSettings = {
    enabled: boolean;
    hour: number;
    minute: number;
};

type ReminderContextValue = {
    settings: ReminderSettings;
    settingsLoaded: boolean;
    isSyncing: boolean;
    scheduledCount: number;
    error: string | null;
    saveSettings: (next: ReminderSettings) => Promise<boolean>;
};

const SETTINGS_KEY = "@smart-pantry/reminder-settings";

const DEFAULT_SETTINGS: ReminderSettings = {
    enabled: false,
    hour: 9,
    minute: 0,
};

const ReminderContext = createContext<
    ReminderContextValue | undefined
>(undefined);

function isReminderSettings(
    value: unknown,
): value is ReminderSettings {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const settings = value as Record<string, unknown>;

    return (
        typeof settings.enabled === "boolean" &&
        typeof settings.hour === "number" &&
        Number.isInteger(settings.hour) &&
        settings.hour >= 0 &&
        settings.hour <= 23 &&
        typeof settings.minute === "number" &&
        Number.isInteger(settings.minute) &&
        settings.minute >= 0 &&
        settings.minute <= 59
    );
}

export function ReminderProvider({
                                     children,
                                 }: PropsWithChildren) {
    const { items, isLoading: pantryLoading } = usePantry();

    const [settings, setSettings] =
        useState<ReminderSettings>(DEFAULT_SETTINGS);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [settingsLoadFailed, setSettingsLoadFailed] =
        useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [scheduledCount, setScheduledCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const queueRef = useRef<Promise<void>>(Promise.resolve());

    useEffect(() => {
        let active = true;

        async function loadSettings() {
            try {
                const raw = await AsyncStorage.getItem(SETTINGS_KEY);

                if (raw !== null) {
                    const parsed: unknown = JSON.parse(raw);

                    if (!isReminderSettings(parsed)) {
                        throw new Error("Saved reminder settings are invalid.");
                    }

                    if (active) {
                        setSettings(parsed);
                    }
                }
            } catch (loadError) {
                console.error("Failed to load reminder settings:", loadError);

                if (active) {
                    setSettingsLoadFailed(true);
                    setError(
                        "We couldn't load your reminder preferences. Save your settings again to recover.",
                    );
                }
            } finally {
                if (active) {
                    setSettingsLoaded(true);
                }
            }
        }

        void loadSettings();

        return () => {
            active = false;
        };
    }, []);

    // Keep scheduled notifications synchronized with pantry data
    // and the user's saved reminder preferences.
    useEffect(() => {
        if (
            !settingsLoaded ||
            settingsLoadFailed ||
            pantryLoading
        ) {
            return;
        }

        let active = true;

        const operation = queueRef.current.then(async () => {
            if (!active) return;

            setIsSyncing(true);

            try {

                if (settings.enabled) {
                    const scheduledCountResult =
                        await scheduleExpiryReminders(
                            items,
                            settings.hour,
                            settings.minute,
                        );

                    if (active) {
                        setScheduledCount(scheduledCountResult);
                        setError(null);
                    }
                } else {
                    await cancelExpiryReminders();

                    if (active) {
                        setScheduledCount(0);
                        setError(null);
                    }
                }

            } catch (syncError) {
                console.error("Failed to synchronize reminders:", syncError);

                if (active) {
                    setError(
                        "We couldn't update scheduled reminders. Check notification permissions and try saving your settings again.",
                    );
                }
            } finally {
                if (active) {
                    setIsSyncing(false);
                }
            }
        });

        // Keep later updates running even if an earlier update fails.
        queueRef.current = operation.catch(() => undefined);

        return () => {
            active = false;
        };
    }, [
        items,
        pantryLoading,
        settings,
        settingsLoaded,
        settingsLoadFailed,
    ]);

    const saveSettings = useCallback(
        async (next: ReminderSettings): Promise<boolean> => {
            if (
                !isReminderSettings(next) ||
                settingsLoadFailed
            ) {
                setError("Please check your reminder settings and try again.");
                return false;
            }

            try {
                if (next.enabled) {
                    const granted = await requestReminderPermission();

                    if (!granted) {
                        setError(
                            "Notifications are disabled. Allow notification permission in Android settings before enabling reminders.",
                        );
                        return false;
                    }
                }

                await AsyncStorage.setItem(
                    SETTINGS_KEY,
                    JSON.stringify(next),
                );

                setSettings(next);
                setError(null);
                return true;
            } catch (saveError) {
                console.error("Failed to save reminder settings:", saveError);
                setError("We couldn't save your settings. Please try again.");
                return false;
            }
        },
        [settingsLoadFailed],
    );

    const value = useMemo(
        () => ({
            settings,
            settingsLoaded,
            isSyncing,
            scheduledCount,
            error,
            saveSettings,
        }),
        [
            settings,
            settingsLoaded,
            isSyncing,
            scheduledCount,
            error,
            saveSettings,
        ],
    );

    return (
        <ReminderContext.Provider value={value}>
            {children}
        </ReminderContext.Provider>
    );
}

export function useReminderSettings(): ReminderContextValue {
    const context = useContext(ReminderContext);

    if (!context) {
        throw new Error(
            "useReminderSettings must be used inside ReminderProvider.",
        );
    }

    return context;
}
