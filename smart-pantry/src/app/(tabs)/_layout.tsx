
import { Tabs } from "expo-router";
import {
    House,
    Package,
    ChefHat,
    History as HistoryIcon,
} from "lucide-react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#047857",
                tabBarInactiveTintColor: "#64748b",
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopColor: "#e2e8f0",
                    height: 64,
                    paddingTop: 6,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
                sceneStyle: {
                    backgroundColor: "#f8fafc",
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
