
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { usePantry } from "@/context/PantryContext";
import { daysUntilExpiry } from "@/lib/expiry";
import {
    AlertCircle,
    CircleCheck,
    Clock,
    Leaf,
    Plus,
} from "lucide-react-native";

function SummaryCard({
                         title,
                         value,
                         detail,
                     }: {
    title: string;
    value: number;
    detail: string;
}) {
    return (
        <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="text-sm font-medium text-slate-500">
                {title}
            </Text>

            <Text className="mt-2 text-3xl font-bold text-slate-900">
                {value}
            </Text>

            <Text className="mt-1 text-xs leading-5 text-slate-500">
                {detail}
            </Text>
        </View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { items } = usePantry();

    const pantryItems = items ?? [];

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
            attention: expired + expiringSoon,
        };
    }, [pantryItems]);

    const attentionItems = useMemo(() => {
        return pantryItems
            .filter((item) => daysUntilExpiry(item.expiryDate) <= 3)
            .sort(
                (a, b) =>
                    daysUntilExpiry(a.expiryDate) -
                    daysUntilExpiry(b.expiryDate),
            )
            .slice(0, 3);
    }, [pantryItems]);

    function getExpiryLabel(expiryDate: string) {
        const daysLeft = daysUntilExpiry(expiryDate);

        if (daysLeft < 0) {
            const days = Math.abs(daysLeft);

            return `Expired ${days} ${days === 1 ? "day" : "days"} ago`;
        }

        if (daysLeft === 0) {
            return "Expires today";
        }

        if (daysLeft === 1) {
            return "Expires tomorrow";
        }

        return `Expires in ${daysLeft} days`;
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
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome header */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                            SMART PANTRY
                        </Text>

                        <Text className="mt-2 text-3xl font-bold text-slate-900">
                            Your kitchen,
                            {"\n"}under control.
                        </Text>

                        <Text className="mt-2 text-sm leading-5 text-slate-500">
                            Know what you have and what to use next.
                        </Text>
                    </View>

                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                        <Leaf
                            size={30}
                            color="#047857"
                            strokeWidth={1.8}
                        />
                    </View>
                </View>

                {/* Add item action */}
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/add-item")}
                    className="mt-7 flex-row items-center justify-between rounded-2xl bg-emerald-700 p-5"
                >
                    <View className="flex-1 pr-3">
                        <Text className="text-lg font-bold text-white">
                            Add a pantry item
                        </Text>

                        <Text className="mt-1 text-sm leading-5 text-emerald-50">
                            Save food, quantity, and expiry date.
                        </Text>
                    </View>

                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <Plus
                            size={24}
                            color="#FFFFFF"
                            strokeWidth={2.4}
                        />
                    </View>
                </Pressable>

                {/* Simple overview */}
                <View className="mt-7">
                    <Text className="mb-3 text-xl font-bold text-slate-900">
                        Your overview
                    </Text>

                    <View className="flex-row gap-3">
                        <SummaryCard
                            title="Pantry items"
                            value={summary.total}
                            detail="Items currently saved"
                        />

                        <SummaryCard
                            title="Need attention"
                            value={summary.attention}
                            detail="Expired or expiring soon"
                        />
                    </View>
                </View>

                {/* Expiry attention section */}
                <View className="mt-8">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                            <Text className="text-xl font-bold text-slate-900">
                                Use these soon
                            </Text>

                            <Text className="mt-1 text-sm text-slate-500">
                                Your next expiry priorities.
                            </Text>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.push("/pantry")}
                            className="rounded-lg px-2 py-2"
                        >
                            <Text className="font-semibold text-emerald-700">
                                View all
                            </Text>
                        </Pressable>
                    </View>

                    {attentionItems.length === 0 ? (
                        <View className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-6">
                            <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                <CircleCheck
                                    size={22}
                                    color="#047857"
                                    strokeWidth={2}
                                />
                            </View>

                            <Text className="text-base font-bold text-slate-900">
                                All clear!
                            </Text>

                            <Text className="mt-1 text-sm leading-5 text-slate-500">
                                No items are expired or expiring within the next three days.
                            </Text>
                        </View>
                    ) : (
                        <View className="mt-4 gap-3">
                            {attentionItems.map((item) => {
                                const daysLeft = daysUntilExpiry(
                                    item.expiryDate,
                                );

                                const expired = daysLeft < 0;

                                return (
                                    <View
                                        key={item.id}
                                        className="flex-row items-center rounded-2xl border border-slate-200 bg-white p-4"
                                    >
                                        <View
                                            className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                                                expired
                                                    ? "bg-rose-100"
                                                    : "bg-amber-100"
                                            }`}
                                        >
                                            <Text className="text-xl">
                                                {expired ? (
                                                    <AlertCircle
                                                        size={22}
                                                        color="#BE123C"
                                                        strokeWidth={2}
                                                    />
                                                ) : (
                                                    <Clock
                                                        size={22}
                                                        color="#B45309"
                                                        strokeWidth={2}
                                                    />
                                                )}
                                            </Text>
                                        </View>

                                        <View className="flex-1">
                                            <Text
                                                numberOfLines={1}
                                                className="font-bold text-slate-900"
                                            >
                                                {item.name}
                                            </Text>

                                            <Text className="mt-1 text-xs text-slate-500">
                                                {item.quantity} {item.unit}
                                                {" · "}
                                                {item.location}
                                            </Text>
                                        </View>

                                        <View className="ml-2 items-end">
                                            <Text
                                                className={`text-right text-xs font-bold ${
                                                    expired
                                                        ? "text-rose-700"
                                                        : "text-amber-700"
                                                }`}
                                            >
                                                {getExpiryLabel(item.expiryDate)}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Pantry shortcut */}
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/pantry")}
                    className="mt-7 items-center rounded-2xl border border-slate-200 bg-white px-5 py-4"
                >
                    <Text className="font-bold text-slate-800">
                        Manage my pantry →
                    </Text>

                    <Text className="mt-1 text-sm text-slate-500">
                        Search, filter, sort, edit, and update items.
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
