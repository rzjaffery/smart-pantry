
import "../../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PantryProvider } from "@/context/PantryContext";
import "../lib/notifications";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PantryProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </PantryProvider>
        </GestureHandlerRootView>
    );
}
