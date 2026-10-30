import "../../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PantryProvider } from "@/context/PantryContext";
import { ShoppingListProvider } from "@/context/ShoppingListContext";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <PantryProvider>
                    <ShoppingListProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(tabs)" />
                            <Stack.Screen name="add-item" />
                        </Stack>
                    </ShoppingListProvider>
                </PantryProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}