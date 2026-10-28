import "../../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PantryProvider } from "@/context/PantryContext";
import { ReminderProvider } from "@/context/ReminderContext";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PantryProvider>
                <ReminderProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </ReminderProvider>
            </PantryProvider>
        </GestureHandlerRootView>
    );
}
