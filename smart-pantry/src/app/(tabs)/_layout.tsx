
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    House,
    Package,
    ChefHat,
    History as HistoryIcon,
    ShoppingBasket,
} from "lucide-react-native";

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: "#556B2F",
                tabBarInactiveTintColor: "#746861",

                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopColor: "#E8E0D6",
                    height: 64 + insets.bottom,
                    paddingTop: 6,
                    paddingBottom: 8 + insets.bottom,
                },

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },

                sceneStyle: {
                    backgroundColor: "#F9F6F0",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused }) => (
                        <House
                            color={color}
                            size={size}
                            strokeWidth={focused ? 2.5 : 1.8}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="pantry"
                options={{
                    title: "Pantry",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Package
                            color={color}
                            size={size}
                            strokeWidth={focused ? 2.5 : 1.8}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="recipes"
                options={{
                    title: "Recipes",
                    tabBarIcon: ({ color, size, focused }) => (
                        <ChefHat
                            color={color}
                            size={size}
                            strokeWidth={focused ? 2.5 : 1.8}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="shopping"
                options={{
                    title: "Shopping",
                    tabBarIcon: ({ color, size, focused }) => (
                        <ShoppingBasket
                            color={color}
                            size={size}
                            strokeWidth={focused ? 2.5 : 1.8}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color, size, focused }) => (
                        <HistoryIcon
                            color={color}
                            size={size}
                            strokeWidth={focused ? 2.5 : 1.8}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
