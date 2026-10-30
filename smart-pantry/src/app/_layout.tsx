import { useEffect } from "react";
import "../../global.css";

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PantryProvider } from "@/context/PantryContext";
import { ShoppingListProvider } from "@/context/ShoppingListContext";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        "Satoshi-Regular": require("../../assets/fonts/Satoshi-Regular.otf"),
        "Satoshi-Medium": require("../../assets/fonts/Satoshi-Medium.otf"),
        "Satoshi-Bold": require("../../assets/fonts/Satoshi-Bold.otf"),
        "Satoshi-Black": require("../../assets/fonts/Satoshi-Black.otf"),
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            void SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    if (fontError) {
        console.error("Satoshi font loading failed:", fontError);
    }

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