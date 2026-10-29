
import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {Leaf, Plus, Search} from "lucide-react-native";
import { SwipeablePantryItem } from "@/components/SwipeablePantryItem";
import { usePantry } from "@/context/PantryContext";
import { daysUntilExpiry } from "@/lib/expiry";
import { PANTRY_LOCATIONS } from "@/types/pantry";

type ExpiryFilter = "all" | "soon" | "expired" | "later";
type PantrySort = "expiry" | "name";

const EXPIRY_OPTIONS: {
    value: ExpiryFilter;
    label: string;
}[] = [
    { value: "all", label: "All items" },
    { value: "soon", label: "Expiring soon" },
    { value: "expired", label: "Expired" },
    { value: "later", label: "Later" },
];

const SORT_OPTIONS: {
    value: PantrySort;
    label: string;
}[] = [
    { value: "expiry", label: "Expiry: soonest first" },
    { value: "name", label: "Name: A–Z" },
];

function FilterChip({
                        label,
                        selected,
                        onPress,
                    }: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={onPress}
            className={`rounded-full border px-3 py-2 ${
                selected
                    ? "border-emerald-700 bg-emerald-700"
                    : "border-slate-200 bg-white"
            }`}
        >
            <Text
                className={`text-sm font-semibold ${
                    selected ? "text-white" : "text-slate-700"
                }`}
            >
                {label}
            </Text>
        </Pressable>
    );
}

export default function PantryScreen() {
    const router = useRouter();
    const { items, completeItem } = usePantry();

    const pantryItems = items ?? [];

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<string>("All locations");
    const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
    const [sortBy, setSortBy] = useState<PantrySort>("expiry");
    const [filtersExpanded, setFiltersExpanded] = useState(false)

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return pantryItems.filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(query);

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

    const locationGroups = useMemo(
        () =>
            PANTRY_LOCATIONS.map((location) => {
                const groupItems = filteredItems.filter(
                    (item) => item.location === location,
                );

                const sortedItems = [...groupItems].sort((a, b) => {
                    if (sortBy === "name") {
                        return a.name.localeCompare(b.name);
                    }

                    const difference =
                        daysUntilExpiry(a.expiryDate) -
                        daysUntilExpiry(b.expiryDate);

                    if (difference !== 0) {
                        return difference;
                    }

                    return a.name.localeCompare(b.name);
                });

                return {
                    location,
                    items: sortedItems,
                };
            }).filter((group) => group.items.length > 0),
        [filteredItems, sortBy],
    );

    const hasActiveFilters =
        selectedLocation !== "All locations" ||
        expiryFilter !== "all";

    function resetFilters() {
        setSelectedLocation("All locations");
        setExpiryFilter("all");
    }

    return (
        <SafeAreaView
            className="flex-1 bg-slate-50"
            edges={["top"]}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 32,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Screen heading */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                            SMART PANTRY
                        </Text>

                        <Text className="mt-2 text-3xl font-bold text-slate-900">
                            Your pantry
                        </Text>

                        <Text className="mt-1 text-sm leading-5 text-slate-500">
                            Search and manage your food in one place.
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Add pantry item"
                        onPress={() => router.push("/add-item")}
                        className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700"
                    >
                        <Plus
                            size={24}
                            color="#FFFFFF"
                            strokeWidth={2.4}
                        />
                    </Pressable>
                </View>

                {/* Search */}
                <View className="mt-6 flex-row items-center rounded-2xl border border-slate-200 bg-white px-4">
                    <Search
                        size={20}
                        color="#94A3B8"
                        strokeWidth={2}
                    />

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

                {/* Filters */}

                {/* Collapsible filters and sorting */}
                <View className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Filters and sorting"
                        accessibilityState={{ expanded: filtersExpanded }}
                        onPress={() => setFiltersExpanded((current) => !current)}
                        className="flex-row items-center justify-between p-4"
                    >
                        <View className="mr-3 flex-1">
                            <Text className="text-base font-bold text-slate-900">
                                Filters & sorting
                            </Text>

                            <Text className="mt-1 text-xs leading-5 text-slate-500">
                                {selectedLocation}
                                {" · "}
                                {EXPIRY_OPTIONS.find(
                                    (option) => option.value === expiryFilter,
                                )?.label}
                                {" · "}
                                {sortBy === "expiry"
                                    ? "Soonest expiry first"
                                    : "Name A–Z"}
                            </Text>
                        </View>

                        <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                            <Text className="text-xl font-semibold text-emerald-700">
                                {filtersExpanded ? "−" : "+"}
                            </Text>
                        </View>
                    </Pressable>

                    {filtersExpanded && (
                        <View className="gap-5 border-t border-slate-100 p-4">
                            {/* Storage location */}
                            <View>
                                <Text className="text-sm font-bold text-slate-800">
                                    Storage location
                                </Text>

                                <View className="mt-3 flex-row flex-wrap gap-2">
                                    {["All locations", ...PANTRY_LOCATIONS].map(
                                        (location) => (
                                            <FilterChip
                                                key={location}
                                                label={location}
                                                selected={selectedLocation === location}
                                                onPress={() => setSelectedLocation(location)}
                                            />
                                        ),
                                    )}
                                </View>
                            </View>

                            {/* Expiry status */}
                            <View>
                                <Text className="text-sm font-bold text-slate-800">
                                    Expiry status
                                </Text>

                                <View className="mt-3 flex-row flex-wrap gap-2">
                                    {EXPIRY_OPTIONS.map((option) => (
                                        <FilterChip
                                            key={option.value}
                                            label={option.label}
                                            selected={expiryFilter === option.value}
                                            onPress={() => setExpiryFilter(option.value)}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Sorting */}
                            <View>
                                <Text className="text-sm font-bold text-slate-800">
                                    Sort items by
                                </Text>

                                <View className="mt-3 flex-row flex-wrap gap-2">
                                    {SORT_OPTIONS.map((option) => (
                                        <FilterChip
                                            key={option.value}
                                            label={option.label}
                                            selected={sortBy === option.value}
                                            onPress={() => setSortBy(option.value)}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Reset filters */}
                            {hasActiveFilters && (
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={resetFilters}
                                    className="self-start rounded-lg py-2"
                                >
                                    <Text className="font-semibold text-emerald-700">
                                        Reset filters
                                    </Text>
                                </Pressable>
                            )}

                            <Pressable
                                accessibilityRole="button"
                                onPress={() => setFiltersExpanded(false)}
                                className="items-center rounded-xl bg-slate-100 px-4 py-3"
                            >
                                <Text className="font-semibold text-slate-700">
                                    Done
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </View>


                {/* Results heading */}
                <View className="mt-8 flex-row items-end justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-xl font-bold text-slate-900">
                            Pantry items
                        </Text>

                        <Text className="mt-1 text-sm text-slate-500">
                            Swipe right to mark an item consumed or wasted.
                            {" "}Hold an item to edit or delete it.
                        </Text>
                    </View>

                    <Text className="text-sm font-semibold text-slate-500">
                        {filteredItems.length} of {pantryItems.length}
                    </Text>
                </View>

                {/* Empty pantry */}
                {pantryItems.length === 0 ? (
                    <View className="mt-4 items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                        <Leaf
                            size={30}
                            color="#047857"
                            strokeWidth={1.8}
                        />

                        <Text className="mt-3 text-base font-bold text-slate-900">
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
                ) : filteredItems.length === 0 ? (
                    /* No search/filter matches */
                    <View className="mt-4 items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                        <Text className="text-base font-bold text-slate-900">
                            No matching items
                        </Text>

                        <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                            Try another search or reset your filters to see more items.
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                setSearchQuery("");
                                resetFilters();
                            }}
                            className="mt-4 rounded-xl bg-emerald-700 px-5 py-3"
                        >
                            <Text className="font-bold text-white">
                                Clear search and filters
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    /* Grouped pantry items */
                    <View className="mt-5">
                        {locationGroups.map((group) => (
                            <View
                                key={group.location}
                                className="mb-5"
                            >
                                <View className="mb-3 flex-row items-center justify-between">
                                    <Text className="text-base font-bold text-slate-800">
                                        {group.location}
                                    </Text>

                                    <Text className="text-sm text-slate-500">
                                        {group.items.length}
                                        {" "}
                                        {group.items.length === 1
                                            ? "item"
                                            : "items"}
                                    </Text>
                                </View>

                                {group.items.map((item) => (
                                    <SwipeablePantryItem
                                        key={item.id}
                                        item={item}
                                        onComplete={completeItem}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
