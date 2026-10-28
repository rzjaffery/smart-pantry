
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function scheduleTestNotification(): Promise<boolean> {
    if (Platform.OS === "web") {
        throw new Error(
            "Please test local notifications on your Android or iOS device.",
        );
    }

    // Check whether notifications are allowed.
    const currentPermission =
        await Notifications.getPermissionsAsync();

    let granted = currentPermission.granted;

    if (!granted) {
        const requestedPermission =
            await Notifications.requestPermissionsAsync();

        granted = requestedPermission.granted;
    }

    if (!granted) {
        return false;
    }

    // Use the default notification channel instead of creating
    // a custom Android channel, which currently fails on your device.
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Smart Pantry reminder 🌿",
            body: "Your local notification test is working!",
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
