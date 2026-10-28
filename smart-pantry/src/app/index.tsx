
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { SwipeablePantryItem } from "@/components/SwipeablePantryItem";
import { usePantry } from "@/context/PantryContext";
import { daysUntilExpiry } from "@/lib/expiry";
// import { scheduleTestNotification } from "@/lib/notifications";
import {
  PANTRY_LOCATIONS,
  type PantryItem,
  type PantryListRow,
} from "../types/pantry";

function buildPantryRows(items: PantryItem[]): PantryListRow[] {
  const rows: PantryListRow[] = [];

  for (const location of PANTRY_LOCATIONS) {
    const locationItems = items.filter(
        (item) => item.location === location,
    );

    if (locationItems.length === 0) continue;

    rows.push({
      type: "location",
      key: `location-${location}`,
      location,
    });

    for (const item of locationItems) {
      rows.push({
        type: "item",
        key: item.id,
        item,
      });
    }
  }

  return rows;
}

export default function HomeScreen() {
  const router = useRouter();

  const {
    items,
    history,
    isLoading,
    storageError,
    completeItem,
  } = usePantry();

  const rows = useMemo(
      () => buildPantryRows(items),
      [items],
  );

  const expiringToday = items.filter(
      (item) => daysUntilExpiry(item.expiryDate) === 0,
  ).length;

  const expiringThisWeek = items.filter((item) => {
    const days = daysUntilExpiry(item.expiryDate);
    return days >= 1 && days <= 7;
  }).length;

  const freshItems = items.filter(
      (item) => daysUntilExpiry(item.expiryDate) > 7,
  ).length;

  const summaryCards = [
    {
      label: "Total items",
      count: items.length,
      border: "border-slate-200",
      valueColor: "text-slate-900",
      background: "bg-white",
    },
    {
      label: "Expiring today",
      count: expiringToday,
      border: "border-red-200",
      valueColor: "text-red-700",
      background: "bg-red-50",
    },
    {
      label: "Expiring this week",
      count: expiringThisWeek,
      border: "border-amber-200",
      valueColor: "text-amber-800",
      background: "bg-amber-50",
    },
    {
      label: "Fresh",
      count: freshItems,
      border: "border-emerald-200",
      valueColor: "text-emerald-800",
      background: "bg-emerald-50",
    },
  ];

  if (isLoading) {
    return (
        <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        >
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
                size="large"
                color="#047857"
            />
            <Text className="mt-3 text-base text-slate-600">
              Loading your pantry...
            </Text>
          </View>
        </SafeAreaView>
    );
  }

  // const handleTestNotification = async () => {
  //   try {
  //     const scheduled = await scheduleTestNotification();
  //
  //     if (!scheduled) {
  //       Alert.alert(
  //           "Notifications disabled",
  //           "Enable notifications for Smart Pantry in your device settings, then try again.",
  //       );
  //       return;
  //     }
  //
  //     Alert.alert(
  //         "Test scheduled",
  //         "A test notification is scheduled for about 10 seconds from now. Close this message and press Home to test it in the background.",
  //     );
  //   } catch (error) {
  //     console.error("Notification test failed:", error);
  //
  //     Alert.alert(
  //         "Notification error",
  //         "We couldn't schedule the test notification. Check the Expo terminal for details.",
  //     );
  //   }
  // };


  return (
      <SafeAreaView
          edges={["top"]}
          style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      >
        <FlatList
            className="flex-1"
            data={rows}
            keyExtractor={(row) => row.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 32,
              flexGrow: 1,
            }}
            ListHeaderComponent={
              <View className="pb-6">
                {/* Brand and main heading */}
                <View className="self-start rounded-full bg-emerald-100 px-3 py-1.5">
                  <Text className="text-xs font-bold tracking-widest text-emerald-800">
                    SMART PANTRY
                  </Text>
                </View>

                <Text className="mt-4 text-3xl font-extrabold leading-10 text-slate-900">
                  Good food,{"\n"}less waste.
                </Text>

                <Text className="mt-3 text-base leading-6 text-slate-600">
                  Keep track of what's fresh and use your ingredients
                  before they expire.
                </Text>

                {/* Storage warning */}
                {storageError ? (
                    <View className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <Text className="text-sm leading-5 text-amber-900">
                        {storageError}
                      </Text>
                    </View>
                ) : null}

                {/* Summary cards */}
                <View className="mt-6 flex-row flex-wrap">
                  {summaryCards.map((card) => (
                      <View
                          key={card.label}
                          className="mb-3 w-1/2 px-1"
                      >
                        <View
                            className={`min-h-28 rounded-2xl border p-4 ${card.border} ${card.background}`}
                        >
                          <Text
                              className={`text-3xl font-extrabold ${card.valueColor}`}
                          >
                            {card.count}
                          </Text>

                          <Text className="mt-2 text-xs font-semibold leading-4 text-slate-600">
                            {card.label}
                          </Text>
                        </View>
                      </View>
                  ))}
                </View>

                {/* Actions are outside the summary-card grid */}
                <View className="mt-2 flex-row flex-wrap items-center gap-3">
                  <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/add-item")}
                      className="rounded-xl bg-emerald-700 px-5 py-3.5 active:bg-emerald-800"
                  >
                    <Text className="font-bold text-white">
                      + Add item
                    </Text>
                  </Pressable>

                  <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/history")}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3.5"
                  >
                    <Text className="font-semibold text-slate-700">
                      History ({history.length})
                    </Text>
                  </Pressable>

                  <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/recipes")}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5"
                  >
                    <Text className="font-semibold text-emerald-800">
                      Recipes
                    </Text>
                  </Pressable>

                  {/*<Pressable*/}
                  {/*    accessibilityRole="button"*/}
                  {/*    onPress={() => void handleTestNotification()}*/}
                  {/*    className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5"*/}
                  {/*>*/}
                  {/*  <Text className="font-semibold text-emerald-800">*/}
                  {/*    Test reminder*/}
                  {/*  </Text>*/}
                  {/*</Pressable>*/}

                </View>

                {/* Pantry section heading */}
                <View className="mb-2 mt-8">
                  <Text className="text-2xl font-bold text-slate-900">
                    Your pantry
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-slate-500">
                    Your ingredients, organized by storage location.
                  </Text>
                </View>
              </View>
            }
            renderItem={({ item: row }) => {
              if (row.type === "location") {
                return (
                    <View className="mb-3 mt-2">
                      <Text className="text-sm font-bold uppercase tracking-widest text-slate-500">
                        {row.location}
                      </Text>
                    </View>
                );
              }

              return (
                  <SwipeablePantryItem
                      item={row.item}
                      onComplete={completeItem}
                  />
              );
            }}
            ListEmptyComponent={
              <View className="mt-2 items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10">
                <Text className="text-4xl">🥬</Text>

                <Text className="mt-4 text-center text-lg font-bold text-slate-900">
                  Your pantry is empty
                </Text>

                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Start tracking your ingredients by adding your first
                  pantry item.
                </Text>

                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/add-item")}
                    className="mt-5 rounded-xl bg-emerald-700 px-5 py-3"
                >
                  <Text className="font-bold text-white">
                    Add your first item
                  </Text>
                </Pressable>
              </View>
            }
        />
      </SafeAreaView>
  );
}
