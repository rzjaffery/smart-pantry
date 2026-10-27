
import { FlatList, Text, View } from "react-native";
import { PantryItemCard } from "../components/PantryItemCard";
import {
  addDaystoDateKey,
  daysUntilExpiry,
} from "../lib/expiry";
import {
  PANTRY_LOCATION,
  type PantryItem,
  type PantryListRow,
} from "../types/pantry";

// Temporary demo data. We'll replace this with saved pantry
// data and user-created items in a later step.
const DEMO_ITEMS: PantryItem[] = [
  {
    id: "milk-1",
    name: "Milk",
    quantity: 1,
    unit: "carton",
    location: "Fridge",
    expiryDate: addDaystoDateKey(0),
  },
  {
    id: "spinach-1",
    name: "Spinach",
    quantity: 1,
    unit: "bag",
    location: "Fridge",
    expiryDate: addDaystoDateKey(2),
  },
  {
    id: "yogurt-1",
    name: "Yogurt",
    quantity: 4,
    unit: "cups",
    location: "Fridge",
    expiryDate: addDaystoDateKey(6),
  },
  {
    id: "rice-1",
    name: "Rice",
    quantity: 1,
    unit: "kg",
    location: "Pantry",
    expiryDate: addDaystoDateKey(20),
  },
  {
    id: "peas-1",
    name: "Frozen peas",
    quantity: 1,
    unit: "bag",
    location: "Freezer",
    expiryDate: addDaystoDateKey(45),
  },
];

function buildPantryRows(items: PantryItem[]): PantryListRow[] {
  const rows: PantryListRow[] = [];

  for (const location of PANTRY_LOCATION) {
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
  const rows = buildPantryRows(DEMO_ITEMS);

  const expiringToday = DEMO_ITEMS.filter(
    (item) => daysUntilExpiry(item.expiryDate) === 0,
  ).length;

  const expiringThisWeek = DEMO_ITEMS.filter((item) => {
    const days = daysUntilExpiry(item.expiryDate);
    return days >= 1 && days <= 7;
  }).length;

  const freshItems = DEMO_ITEMS.filter(
    (item) => daysUntilExpiry(item.expiryDate) > 7,
  ).length;

  const summaryCards = [
    {
      label: "Total items",
      count: DEMO_ITEMS.length,
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

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 36,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View className="pb-5 pt-4">
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

          return <PantryItemCard item={row.item} />;
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
