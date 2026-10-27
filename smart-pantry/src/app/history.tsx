
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    View,
} from "react-native";

import { usePantry } from "@/context/PantryContext";

export default function HistoryScreen() {
    const router = useRouter();
    const { history, isLoading, storageError } = usePantry();

    const consumedCount = history.filter(
        (entry) => entry.outcome === "consumed",
    ).length;

    const wastedCount = history.filter(
        (entry) => entry.outcome === "wasted",
    ).length;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#047857" />
                <Text className="mt-3 text-slate-600">
                    Loading activity...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <FlatList
                data={history}
                keyExtractor={(entry) => entry.item.id}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 45,
                    paddingBottom: 20,
                    flexGrow: 1,
                }}
                ListHeaderComponent={
                    <View className="mb-5">
                        <Pressable onPress={() => router.back()}>
                            <Text className="font-semibold text-emerald-700">
                                ← Back to pantry
                            </Text>
                        </Pressable>

                        <Text className="mt-5 text-3xl font-bold text-slate-900">
                            Activity history
                        </Text>

                        <Text className="mt-2 text-base text-slate-600">
                            See how you're reducing food waste.
                        </Text>

                        <View className="mt-5 flex-row gap-3">
                            <View className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <Text className="text-2xl font-bold text-emerald-800">
                                    {consumedCount}
                                </Text>
                                <Text className="mt-1 text-xs font-semibold text-emerald-800">
                                    Consumed
                                </Text>
                            </View>

                            <View className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                <Text className="text-2xl font-bold text-rose-800">
                                    {wastedCount}
                                </Text>
                                <Text className="mt-1 text-xs font-semibold text-rose-800">
                                    Wasted
                                </Text>
                            </View>
                        </View>

                        {storageError ? (
                            <Text className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                                {storageError}
                            </Text>
                        ) : null}

                        <Text className="mb-2 mt-7 text-lg font-bold text-slate-900">
                            Recent activity
                        </Text>
                    </View>
                }
                renderItem={({ item: entry }) => {
                    const consumed = entry.outcome === "consumed";

                    return (
                        <View className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
                            <View className="flex-row items-start justify-between gap-3">
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-slate-900">
                                        {entry.item.name}
                                    </Text>

                                    <Text className="mt-1 text-sm text-slate-500">
                                        {entry.item.quantity} {entry.item.unit}
                                    </Text>
                                </View>

                                <View
                                    className={`rounded-full px-3 py-1 ${
                                        consumed ? "bg-emerald-100" : "bg-rose-100"
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${
                                            consumed ? "text-emerald-800" : "text-rose-800"
                                        }`}
                                    >
                                        {consumed ? "Consumed" : "Wasted"}
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-3 border-t border-slate-100 pt-3">
                                <Text className="text-xs text-slate-500">
                                    Location: {entry.item.location}
                                </Text>

                                <Text className="mt-1 text-xs text-slate-500">
                                    Recorded:{" "}
                                    {new Date(entry.completedAt).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
                        <Text className="text-4xl">🌱</Text>

                        <Text className="mt-3 text-lg font-bold text-slate-900">
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
        </View>
    );
}
