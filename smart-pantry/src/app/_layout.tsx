import "../../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PantryProvider } from "@/context/PantryContext";
import {ShoppingListProvider} from "@/context/ShoppingListContext";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <PantryProvider>
                <ShoppingListProvider>
                    <Stack screenOptions={{headerShown: false}}>
                        <Stack.Screen name={'(tabs)'}/>
                        <Stack.Screen name={'add-item'}/>
                    </Stack>
                </ShoppingListProvider>
            </PantryProvider>
        </GestureHandlerRootView>
    );
}
