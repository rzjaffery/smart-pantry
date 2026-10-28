
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Allow notifications to display while the app is open.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const CHANNEL_ID = "pantry-reminders";

export async function scheduleTestNotification(): Promise<boolean> {
    if (Platform.OS === "web") {
        throw new Error(
            "Test local notifications on your Android or iOS device.",
        );
    }

    // Android requires a notification channel.
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: "Pantry reminders",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#047857",
        });
    }

    // Check permission before asking for it.
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

    // Schedule a test notification for 10 seconds from now.
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Smart Pantry reminder 🌿",
            body: "Local notifications are working! Next, we'll remind you about expiring food.",
            sound: true,
            data: {
                type: "notification-test",
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 10,
            ...(Platform.OS === "android"
                ? { channelId: CHANNEL_ID }
                : {}),
        },
    });

    return true;
}
