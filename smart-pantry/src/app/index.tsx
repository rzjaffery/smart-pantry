
import {FlatList, Pressable, Text, View, ActivityIndicator} from "react-native";
import { PantryItemCard } from "@/components/PantryItemCard";
import {
  addDaysToDateKey,
  daysUntilExpiry,
} from "@/lib/expiry";
import {
  PANTRY_LOCATIONS,
  type PantryItem,
  type PantryListRow,
} from "@/types/pantry";
import {useRouter} from "expo-router";
import {usePantry} from "@/context/PantryContext";
import {useMemo} from "react";
import { SwipeablePantryItem } from "../components/SwipeablePantryItem";

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
    },
    {
      label: "Expiring today",
      count: expiringToday,
      border: "border-red-200",
      valueColor: "text-red-600",
    },
    {
      label: "Expiring this week",
      count: expiringThisWeek,
      border: "border-amber-200",
      valueColor: "text-amber-700",
    },
    {
      label: "Fresh",
      count: freshItems,
      border: "border-emerald-200",
      valueColor: "text-emerald-700",
    },
  ];

  if (isLoading) {
    return (
        <View className="flex-1 items-center justify-center bg-slate-50">
          <ActivityIndicator size="large" color="#047857" />

          <Text className="mt-3 text-base text-slate-600">
            Loading your pantry...
          </Text>
        </View>
    );
  }

  return (
    <View className="flex-auto bg-slate-50">
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop:40,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View className="pb-5 pt-4">
            {storageError ? (
                <View className="mt-4 rounded-xl bg-amber-50 p-3">
                  <Text className="text-sm text-amber-900">
                    {storageError}
                  </Text>
                </View>
            ) : null}
            <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              SMART PANTRY
            </Text>

            <Text className="mt-2 text-3xl font-bold text-slate-900">
              Good food, less waste.
            </Text>

            <Text className="mt-2 text-base leading-6 text-slate-600">
              Keep track of what's fresh and use ingredients
              before they expire.
            </Text>

            <View className="mt-6 flex-row flex-wrap">
              {summaryCards.map((card) => (
                <View
                  key={card.label}
                  className="mb-2 w-1/2 px-1"
                >
                  <View
                    className={`min-h-24 rounded-2xl border bg-white p-4 ${card.border}`}
                  >
                    <Text
                      className={`text-2xl font-bold ${card.valueColor}`}
                    >
                      {card.count}
                    </Text>

                    <Text className="mt-2 text-xs font-medium text-slate-600">
                      {card.label}
                    </Text>
                  </View>
                </View>
              ))}
                    <Pressable
                        onPress={() => router.push("/add-item")}
                        className="mt-5 self-start rounded-xl bg-emerald-700 px-5 py-3"
                    >
                      <Text className="font-bold text-white">
                        + Add item
                      </Text>
                    </Pressable>

              <Pressable
                  onPress={() => router.push("/history")}
                  className="mt-3 self-start rounded-xl border border-slate-200 bg-white px-5 py-3"
              >
                <Text className="font-semibold text-slate-700">
                  View activity ({history.length})
                </Text>
              </Pressable>

            </View>

            <Text className="mb-1 mt-6 text-xl font-bold text-slate-900">
              Your pantry
            </Text>

            <Text className="text-sm text-slate-500">
              Items organized by storage location
            </Text>
          </View>
        }
        renderItem={({ item: row }) => {
          if (row.type === "location") {
            return (
              <Text className="mb-3 mt-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                {row.location}
              </Text>
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
          <View className="mt-6 items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
            <Text className="text-4xl">🥬</Text>

            <Text className="mt-3 text-lg font-bold text-slate-900">
              Your pantry is empty
            </Text>

            <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
              Your ingredients will appear here when you add
              your first pantry item.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
