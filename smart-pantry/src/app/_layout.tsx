import "../../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PantryProvider } from "@/context/PantryContext";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <PantryProvider>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name={'(tabs)'}/>
                    <Stack.Screen name={'add-item'}/>
                </Stack>
            </PantryProvider>
        </GestureHandlerRootView>
    );
}
