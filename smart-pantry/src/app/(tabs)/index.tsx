import { useMemo, useState } from "react";
import {Pressable,ScrollView,Text,TextInput,View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SwipeablePantryItem } from "@/components/SwipeablePantryItem";
import { usePantry } from "@/context/PantryContext";
import { daysUntilExpiry } from "@/lib/expiry";
import { PANTRY_LOCATIONS} from "@/types/pantry";
type ExpiryFilter = "all" | "soon" | "expired" | "later";
type PantrySort = "expiry" | "name";

function SummaryCard({
                       label,
                       value,
                       detail,
                     }: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
      <View className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-sm font-medium text-slate-500">
          {label}
        </Text>

        <Text className="mt-2 text-2xl font-bold text-slate-900">
          {value}
        </Text>

        <Text className="mt-1 text-xs text-slate-500">
          {detail}
        </Text>
      </View>
  );
}

function NavigationButton({
                            title,
                            subtitle,
                            onPress,
                            primary = false,
                          }: {
  title: string;
  subtitle: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
      <Pressable
          accessibilityRole="button"
          onPress={onPress}
          className={`rounded-2xl border p-4 ${
              primary
                  ? "border-emerald-700 bg-emerald-700"
                  : "border-slate-200 bg-white"
          }`}
      >
        <Text
            className={`text-base font-bold ${
                primary ? "text-white" : "text-slate-900"
            }`}
        >
          {title}
        </Text>

        <Text
            className={`mt-1 text-sm ${
                primary ? "text-emerald-50" : "text-slate-500"
            }`}
        >
          {subtitle}
        </Text>
      </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const {items, completeItem} = usePantry();

  const pantryItems = items ?? [];
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<string>("All locations");
    const [sortBy, setSortBy] = useState<PantrySort>("expiry");
    const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return pantryItems.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(query);

            const matchesLocation =
                selectedLocation === "All locations" ||
                item.location === selectedLocation;

            const daysLeft = daysUntilExpiry(item.expiryDate);

            let matchesExpiry = true;

            if (expiryFilter === "soon") {
                matchesExpiry = daysLeft >= 0 && daysLeft <= 3;
            } else if (expiryFilter === "expired") {
                matchesExpiry = daysLeft < 0;
            } else if (expiryFilter === "later") {
                matchesExpiry = daysLeft > 3;
            }

            return (
                matchesSearch &&
                matchesLocation &&
                matchesExpiry
            );
        });
    }, [
        pantryItems,
        searchQuery,
        selectedLocation,
        expiryFilter,
    ]);

  const summary = useMemo(() => {
    let expired = 0;
    let expiringSoon = 0;

    for (const item of pantryItems) {
      const daysLeft = daysUntilExpiry(item.expiryDate);

      if (daysLeft < 0) {
        expired += 1;
      } else if (daysLeft <= 3) {
        expiringSoon += 1;
      }
    }

    return {
      total: pantryItems.length,
      expired,
      expiringSoon,
    };
  }, [pantryItems]);

    const locationGroups = useMemo(
        () =>
            PANTRY_LOCATIONS.map((location) => {
                const groupItems = filteredItems.filter(
                    (item) => item.location === location
                );

                const sortedItems = [...groupItems].sort((a, b) => {
                    if (sortBy === "name") {
                        return a.name.localeCompare(b.name);
                    }

                    const expiryDifference =
                        daysUntilExpiry(a.expiryDate) -
                        daysUntilExpiry(b.expiryDate);

                    if (expiryDifference !== 0) {
                        return expiryDifference;
                    }

                    // If expiry dates match, sort alphabetically.
                    return a.name.localeCompare(b.name);
                });

                return {
                    location,
                    items: sortedItems,
                };
            }).filter((group) => group.items.length > 0),
        [filteredItems, sortBy]
    );

  return (
      <SafeAreaView
          className="flex-1 bg-slate-50"
          edges={["top"]}
      >
        <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 36,
            }}
            showsVerticalScrollIndicator={false}
        >
          {/* Dashboard heading */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                SMART PANTRY
              </Text>

              <Text className="mt-2 text-3xl font-bold text-slate-900">
                Your pantry
              </Text>

              <Text className="mt-2 text-base leading-6 text-slate-600">
                Keep track of your food and use items before they expire.
              </Text>
            </View>

            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <Text className="text-2xl">🥬</Text>
            </View>
          </View>

          {/* Summary cards */}
          <View className="mt-6 flex-row gap-3">
            <SummaryCard
                label="Pantry items"
                value={summary.total}
                detail="Items saved"
            />

            <SummaryCard
                label="Expiring soon"
                value={summary.expiringSoon}
                detail="Within 3 days"
            />

            <SummaryCard
                label="Expired"
                value={summary.expired}
                detail="Check these"
            />
          </View>

          {/* Quick actions */}
          <View className="mt-7">
            <Text className="text-xl font-bold text-slate-900">
              Quick actions
            </Text>

            <View className="mt-3 gap-3">
              <NavigationButton
                  title="+ Add item"
                  subtitle="Save a food item and its expiry date"
                  primary
                  onPress={() => router.push("/add-item")}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <NavigationButton
                      title="History"
                      subtitle="Previously consumed or wasted items"
                      onPress={() => router.push("/history")}
                  />
                </View>

                <View className="flex-1">
                  <NavigationButton
                      title="Recipes"
                      subtitle="Ideas for your ingredients"
                      onPress={() => router.push("/recipes")}
                  />
                </View>
              </View>

            </View>
          </View>

          {/* Pantry items grouped by storage location */}
          <View className="mt-8 flex-row items-end justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xl font-bold text-slate-900">
                Pantry by location
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                Swipe an item to mark it consumed or wasted.
              </Text>
            </View>

            <Text className="text-sm font-semibold text-slate-500">
              {summary.total} total
            </Text>
          </View>

            <View className="mt-4 flex-row items-center rounded-xl border border-slate-200 bg-white px-4">
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search pantry items..."
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    returnKeyType="search"
                    accessibilityLabel="Search pantry items by name"
                    className="min-h-12 flex-1 py-3 text-base text-slate-900"
                />

                {searchQuery.length > 0 && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        onPress={() => setSearchQuery("")}
                        className="ml-2 rounded-lg px-2 py-2"
                    >
                        <Text className="font-semibold text-emerald-700">
                            Clear
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Sorting options */}
            <View>
                <Text className="text-sm font-bold text-slate-800">
                    Sort items by
                </Text>

                <View className="mt-2 flex-row flex-wrap gap-2">
                    {[
                        { value: "expiry", label: "Expiry: soonest first" },
                        { value: "name", label: "Name: A–Z" },
                    ].map((option) => {
                        const selected = sortBy === option.value;

                        return (
                            <Pressable
                                key={option.value}
                                accessibilityRole="button"
                                accessibilityState={{ selected }}
                                onPress={() =>
                                    setSortBy(option.value as PantrySort)
                                }
                                className={`rounded-full border px-3 py-2 ${
                                    selected
                                        ? "border-emerald-700 bg-emerald-700"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <Text
                                    className={`text-sm font-semibold ${
                                        selected
                                            ? "text-white"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View className="mt-5 gap-4">
                {/* Storage location filter */}
                <View>
                    <Text className="text-sm font-bold text-slate-800">
                        Storage location
                    </Text>

                    <View className="mt-2 flex-row flex-wrap gap-2">
                        {["All locations", ...PANTRY_LOCATIONS].map(
                            (location) => {
                                const selected = selectedLocation === location;

                                return (
                                    <Pressable
                                        key={location}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected }}
                                        onPress={() => setSelectedLocation(location)}
                                        className={`rounded-full border px-3 py-2 ${
                                            selected
                                                ? "border-emerald-700 bg-emerald-700"
                                                : "border-slate-200 bg-white"
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${
                                                selected
                                                    ? "text-white"
                                                    : "text-slate-700"
                                            }`}
                                        >
                                            {location}
                                        </Text>
                                    </Pressable>
                                );
                            }
                        )}
                    </View>
                </View>

                {/* Expiry filter */}
                <View>
                    <Text className="text-sm font-bold text-slate-800">
                        Expiry status
                    </Text>

                    <View className="mt-2 flex-row flex-wrap gap-2">
                        {[
                            { value: "all", label: "All items" },
                            { value: "soon", label: "Expiring soon" },
                            { value: "expired", label: "Expired" },
                            { value: "later", label: "Later" },
                        ].map((option) => {
                            const selected = expiryFilter === option.value;

                            return (
                                <Pressable
                                    key={option.value}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    onPress={() =>
                                        setExpiryFilter(
                                            option.value as ExpiryFilter
                                        )
                                    }
                                    className={`rounded-full border px-3 py-2 ${
                                        selected
                                            ? "border-emerald-700 bg-emerald-700"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${
                                            selected
                                                ? "text-white"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Reset filters */}
                {(selectedLocation !== "All locations" ||
                    expiryFilter !== "all") && (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                            setSelectedLocation("All locations");
                            setExpiryFilter("all");
                        }}
                        className="self-start rounded-lg py-1"
                    >
                        <Text className="font-semibold text-emerald-700">
                            Reset filters
                        </Text>
                    </Pressable>
                )}
            </View>

          {pantryItems.length === 0 ? (
              <View className="mt-4 items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                <Text className="text-base font-bold text-slate-800">
                  Your pantry is empty
                </Text>

                <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                  Add your first item to start tracking quantities and expiry dates.
                </Text>

                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/add-item")}
                    className="mt-4 rounded-xl bg-emerald-700 px-5 py-3"
                >
                  <Text className="font-bold text-white">
                    Add your first item
                  </Text>
                </Pressable>
              </View>
          )  : filteredItems.length === 0 ? (
              <View className="mt-4 items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                  <Text className="text-base font-bold text-slate-800">
                      No matching items
                  </Text>

                  <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                      Try another name or clear your search to see all pantry items.
                  </Text>
                  <Pressable accessibilityRole="button" onPress={() => setSearchQuery("")} className="mt-4 rounded-xl bg-emerald-700 px-5 py-3">
                    <Text className="font-bold text-white">
                        Clear search
                    </Text>
                </Pressable>
              </View>
          ) : (
              <View className="mt-4 gap-5">
                {locationGroups.map((group) => (
                    <View key={group.location}>
                      {/* Location title */}
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-base font-bold text-slate-800">
                          {group.location}
                        </Text>

                        <Text className="text-sm text-slate-500">
                          {group.items.length}{" "}
                          {group.items.length === 1
                              ? "item"
                              : "items"}
                        </Text>
                      </View>

                      {/* Swipeable pantry rows */}
                      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {group.items.map((item, index) => (
                            <SwipeablePantryItem
                                key={
                                    item.id ??
                                    `${group.location}-${item.name}-${index}`
                                }
                                item={item}
                                onComplete={completeItem}
                            />
                        ))}
                      </View>
                    </View>
                ))}
              </View>
          )}
        </ScrollView>
      </SafeAreaView>
  );
}