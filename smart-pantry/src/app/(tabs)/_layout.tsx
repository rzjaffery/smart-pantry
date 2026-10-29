
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            size={size}
                            color={typeof color === "number" ? "#64748b" : color ?? "#64748b"}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="pantry"
                options={{
                    title: "Pantry",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="basket-outline"
                            size={size}
                            color={typeof color === "number" ? "#64748b" : color ?? "#64748b"}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="recipes"
                options={{
                    title: "Recipes",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="restaurant-outline"
                            size={size}
                            color={typeof color === "number" ? "#64748b" : color ?? "#64748b"}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="time-outline"
                            size={size}
                            color={typeof color === "number" ? "#64748b" : color ?? "#64748b"}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
