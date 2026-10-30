
import {ActivityIndicator, FlatList, Pressable, View} from "react-native";
import { AppText as Text } from "@/components/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CalendarClock,
    CheckCircle2,
    History as HistoryIcon,
    MapPin,
    Trash2,
} from "lucide-react-native";

import { usePantry } from "@/context/PantryContext";

export default function HistoryScreen() {
    const { history, isLoading, storageError } = usePantry();

    const consumedCount = history.filter(
        (entry) => entry.outcome === "consumed",
    ).length;

    const wastedCount = history.filter(
        (entry) => entry.outcome === "wasted",
    ).length;

    if (isLoading) {
        return (
            <SafeAreaView
                className="flex-1 bg-slate-50"
                edges={["top"]}
            >
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#047857" />

                    <Text className="mt-3 text-slate-600">
                        Loading activity...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            className="flex-1 bg-slate-50"
            edges={["top"]}
        >
            <FlatList
                className="flex-1"
                data={history}
                keyExtractor={(entry) => entry.item.id}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 28,
                    flexGrow: 1,
                }}
                ListHeaderComponent={
                    <View className="mb-5">
                        {/* Consistent screen heading */}
                        <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                            SMART PANTRY
                        </Text>

                        <Text className="mt-2 text-3xl font-bold text-slate-900">
                            Activity history
                        </Text>

                        <Text className="mt-2 text-base leading-6 text-slate-600">
                            Track what you've used and what has gone to waste.
                        </Text>

                        {/* Summary cards */}
                        <View className="mt-5 flex-row gap-3">
                            <View className="min-w-0 flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <CheckCircle2
                                    size={22}
                                    color="#047857"
                                    strokeWidth={2}
                                />

                                <Text className="mt-3 text-2xl font-bold text-emerald-800">
                                    {consumedCount}
                                </Text>

                                <Text className="mt-1 text-xs font-semibold text-emerald-800">
                                    Consumed
                                </Text>
                            </View>

                            <View className="min-w-0 flex-1 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                <Trash2
                                    size={22}
                                    color="#BE123C"
                                    strokeWidth={2}
                                />

                                <Text className="mt-3 text-2xl font-bold text-rose-800">
                                    {wastedCount}
                                </Text>

                                <Text className="mt-1 text-xs font-semibold text-rose-800">
                                    Wasted
                                </Text>
                            </View>
                        </View>

                        {storageError ? (
                            <Text className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900">
                                {storageError}
                            </Text>
                        ) : null}

                        <View className="mt-7 flex-row items-center gap-2">
                            <HistoryIcon
                                size={20}
                                color="#0F172A"
                                strokeWidth={2}
                            />

                            <Text className="text-lg font-bold text-slate-900">
                                Recent activity
                            </Text>
                        </View>
                    </View>
                }
                renderItem={({ item: entry }) => {
                    const consumed = entry.outcome === "consumed";
                    const statusColor = consumed ? "#047857" : "#BE123C";

                    return (
                        <View className="mb-3 w-full rounded-2xl border border-slate-200 bg-white p-4">
                            <View className="flex-row items-start justify-between gap-3">
                                <View className="min-w-0 flex-1">
                                    <Text
                                        numberOfLines={2}
                                        className="text-base font-bold leading-6 text-slate-900"
                                    >
                                        {entry.item.name}
                                    </Text>

                                    <Text className="mt-1 text-sm text-slate-500">
                                        {entry.item.quantity} {entry.item.unit}
                                    </Text>
                                </View>

                                <View
                                    className={`max-w-[130px] shrink-0 flex-row items-center gap-1.5 rounded-full px-3 py-2 ${
                                        consumed
                                            ? "bg-emerald-100"
                                            : "bg-rose-100"
                                    }`}
                                >
                                    {consumed ? (
                                        <CheckCircle2
                                            size={14}
                                            color={statusColor}
                                        />
                                    ) : (
                                        <Trash2
                                            size={14}
                                            color={statusColor}
                                        />
                                    )}

                                    <Text
                                        className={`text-xs font-bold ${
                                            consumed
                                                ? "text-emerald-800"
                                                : "text-rose-800"
                                        }`}
                                    >
                                        {consumed ? "Consumed" : "Wasted"}
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-3 gap-3 border-t border-slate-100 pt-3">
                                <View className="flex-row items-center gap-2">
                                    <MapPin
                                        size={15}
                                        color="#64748B"
                                    />

                                    <Text className="flex-1 text-xs leading-5 text-slate-500">
                                        Location: {entry.item.location}
                                    </Text>
                                </View>

                                <View className="flex-row items-start gap-2">
                                    <CalendarClock
                                        size={15}
                                        color="#64748B"
                                    />

                                    <Text className="flex-1 text-xs leading-5 text-slate-500">
                                        Recorded:{" "}
                                        {new Date(
                                            entry.completedAt,
                                        ).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                            <HistoryIcon
                                size={30}
                                color="#047857"
                                strokeWidth={1.8}
                            />
                        </View>

                        <Text className="mt-4 text-lg font-bold text-slate-900">
                            No activity yet
                        </Text>

                        <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                            When you mark a pantry item as consumed or wasted,
                            it will appear here.
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
