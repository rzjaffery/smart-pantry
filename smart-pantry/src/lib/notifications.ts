
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { toDateKey } from "./expiry";
import type { PantryItem } from "../types/pantry";

const REMINDER_TYPE = "pantry-expiry-reminder";
const DAYS_AHEAD = 30;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestReminderPermission(): Promise<boolean> {
    if (Platform.OS === "web") {
        return false;
    }

    const current = await Notifications.getPermissionsAsync();

    if (current.granted) {
        return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
}

export async function cancelExpiryReminders(): Promise<void> {
    const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();

    const reminders = scheduled.filter(
        (notification) =>
            notification.content.data?.type === REMINDER_TYPE,
    );

    await Promise.all(
        reminders.map((notification) =>
            Notifications.cancelScheduledNotificationAsync(
                notification.identifier,
            ),
        ),
    );
}

/**
 * Schedule reminders for the next 30 days.
 *
 * A reminder is scheduled only when at least one pantry item
 * expires the following calendar day.
 *
 * No custom Android notification channel is created.
 */
export async function scheduleExpiryReminders(
    items: PantryItem[],
    hour: number,
    minute: number,
): Promise<number> {
    if (Platform.OS === "web") {
        throw new Error(
            "Expiry reminders must be scheduled on an Android or iOS device.",
        );
    }

    if (
        !Number.isInteger(hour) ||
        hour < 0 ||
        hour > 23 ||
        !Number.isInteger(minute) ||
        minute < 0 ||
        minute > 59
    ) {
        throw new Error("Invalid reminder time.");
    }

    const permission = await Notifications.getPermissionsAsync();

    if (!permission.granted) {
        throw new Error("Notification permission has not been granted.");
    }

    // Keep existing reminders until the replacement schedule
    // has been created successfully.
    const existing = (
        await Notifications.getAllScheduledNotificationsAsync()
    ).filter(
        (notification) =>
            notification.content.data?.type === REMINDER_TYPE,
    );

    const planId = `${Date.now()}`;
    const newIdentifiers: string[] = [];

    const now = new Date();
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    );

    try {
        for (let offset = 0; offset < DAYS_AHEAD; offset++) {
            const reminderDate = new Date(today);
            reminderDate.setDate(today.getDate() + offset);
            reminderDate.setHours(hour, minute, 0, 0);

            // Don't schedule a reminder in the past.
            if (reminderDate.getTime() <= Date.now()) {
                continue;
            }

            const expiryDate = new Date(today);
            expiryDate.setDate(today.getDate() + offset + 1);

            const expiryDateKey = toDateKey(expiryDate);

            const expiringCount = items.filter(
                (item) => item.expiryDate === expiryDateKey,
            ).length;

            // Avoid unnecessary notifications on days with no
            // pantry items expiring the next day.
            if (expiringCount === 0) {
                continue;
            }

            const identifier =
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Smart Pantry · Expiry reminder",
                        body:
                            expiringCount === 1
                                ? "You have 1 item expiring tomorrow. Plan to use it!"
                                : `You have ${expiringCount} items expiring tomorrow. Plan to use them!`,
                        sound: true,
                        data: {
                            type: REMINDER_TYPE,
                            planId,
                            reminderDate: toDateKey(reminderDate),
                            expiryDate: expiryDateKey,
                        },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: reminderDate,
                    },
                });

            newIdentifiers.push(identifier);
        }
    } catch (error) {
        // Roll back the new schedule if any reminder fails.
        await Promise.all(
            newIdentifiers.map((identifier) =>
                Notifications.cancelScheduledNotificationAsync(identifier),
            ),
        );

        throw error;
    }

    // Replace our previous reminder plan only after successful
    // scheduling. Other app notifications are left untouched.
    await Promise.all(
        existing.map((notification) =>
            Notifications.cancelScheduledNotificationAsync(
                notification.identifier,
            ),
        ),
    );

    return newIdentifiers.length;
}

/**
 * Temporary test helper. Keep until daily reminders
 * have been verified on your device.
 */
export async function scheduleTestNotification(): Promise<boolean> {
    const granted = await requestReminderPermission();

    if (!granted) {
        return false;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Smart Pantry reminder 🌿",
            body: "Your local notifications are working!",
            sound: true,
            data: {
                type: "notification-test",
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 10,
        },
    });

    return true;
}



export async function scheduleDateTriggerDiagnostic(): Promise<boolean> {
    const granted = await requestReminderPermission();

    if (!granted) {
        return false;
    }

    // Schedule precisely 30 seconds into the future.
    const triggerDate = new Date(Date.now() + 30_000);

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Smart Pantry date-trigger test",
            body: "Your one-time date-based notification was triggered.",
            sound: true,
            data: {
                type: "date-trigger-diagnostic",
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
        },
    });

    // Verify that the native notification scheduler retained it.
    const scheduled =
        await Notifications.getAllScheduledNotificationsAsync();

    const notification = scheduled.find(
        (entry) => entry.identifier === identifier,
    );

    console.log("[Date trigger diagnostic]", {
        requestedTime: triggerDate.toString(),
        requestedTimeISO: triggerDate.toISOString(),
        identifier,
        storedTrigger: notification?.trigger ?? null,
    });

    return true;
}
