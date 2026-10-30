import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Leaf,
    Plus,
} from "lucide-react-native";

import { AppText as Text } from "@/components/AppText";
import { usePantry } from "@/context/PantryContext";
import { daysUntilExpiry } from "@/lib/expiry";

type SummaryCardProps = {
    title: string;
    value: number;
    detail: string;
    tone?: "olive" | "terracotta";
};

function SummaryCard({
                         title,
                         value,
                         detail,
                         tone = "olive",
                     }: SummaryCardProps) {
    const valueColor =
        tone === "terracotta"
            ? "text-larder-terracotta-deep"
            : "text-larder-olive";

    return (
        <View className="flex-1 rounded-2xl border border-larder-border bg-larder-alabaster p-4">
            <Text className="text-sm font-medium text-larder-muted">
                {title}
            </Text>

            <Text className={`mt-2 text-3xl font-bold ${valueColor}`}>
                {value}
            </Text>

            <Text className="mt-1 text-xs leading-5 text-larder-muted">
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
            className="flex-1 bg-larder-linen"
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
                {/* Brand and welcome header */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-xs font-bold uppercase tracking-widest text-larder-olive">
                            SAVORSHELF
                        </Text>

                        <Text className="mt-2 text-3xl font-bold tracking-display text-larder-espresso">
                            Your kitchen,
                            {"\n"}under control.
                        </Text>

                        <Text className="mt-2 text-sm leading-5 text-larder-muted">
                            Know what you have and what to use next.
                        </Text>
                    </View>

                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-larder-olive-soft">
                        <Leaf
                            size={30}
                            color="#556B2F"
                            strokeWidth={1.8}
                        />
                    </View>
                </View>

                {/* Add item action */}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add a pantry item"
                    onPress={() => router.push("/add-item")}
                    className="mt-7 flex-row items-center justify-between rounded-2xl bg-larder-olive p-5"
                >
                    <View className="flex-1 pr-3">
                        <Text className="text-lg font-bold text-white">
                            Add a pantry item
                        </Text>

                        <Text className="mt-1 text-sm leading-5 text-white">
                            Save food, quantity, and expiry date.
                        </Text>
                    </View>

                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <Plus
                            size={24}
                            color="#FFFFFF"
                            strokeWidth={2.4}
                        />
                    </View>
                </Pressable>

                {/* Pantry overview */}
                <View className="mt-7">
                    <Text className="mb-3 text-xl font-bold tracking-display text-larder-espresso">
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
                            detail={`${summary.expired} expired · ${summary.expiringSoon} expiring soon`}
                            tone="terracotta"
                        />
                    </View>
                </View>

                {/* Expiry attention section */}
                <View className="mt-8">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                            <Text className="text-xl font-bold tracking-display text-larder-espresso">
                                Use these soon
                            </Text>

                            <Text className="mt-1 text-sm text-larder-muted">
                                Your next expiry priorities.
                            </Text>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="View all pantry items"
                            onPress={() => router.push("/pantry")}
                            className="rounded-lg px-2 py-2"
                        >
                            <Text className="font-semibold text-larder-olive">
                                View all
                            </Text>
                        </Pressable>
                    </View>

                    {attentionItems.length === 0 ? (
                        <View className="mt-4 rounded-2xl border border-larder-border bg-larder-alabaster px-5 py-6">
                            <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-larder-olive-soft">
                                <CheckCircle2
                                    size={22}
                                    color="#556B2F"
                                    strokeWidth={2}
                                />
                            </View>

                            <Text className="text-base font-bold text-larder-espresso">
                                All clear!
                            </Text>

                            <Text className="mt-1 text-sm leading-5 text-larder-muted">
                                No items are expired or expiring within the
                                next three days.
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
                                        className="flex-row items-center rounded-2xl border border-larder-border bg-larder-alabaster p-4"
                                    >
                                        <View
                                            className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                                                expired
                                                    ? "bg-larder-terracotta-soft"
                                                    : "bg-larder-linen"
                                            }`}
                                        >
                                            {expired ? (
                                                <AlertCircle
                                                    size={22}
                                                    color="#8F4933"
                                                    strokeWidth={2}
                                                />
                                            ) : (
                                                <Clock
                                                    size={22}
                                                    color="#C26D4C"
                                                    strokeWidth={2}
                                                />
                                            )}
                                        </View>

                                        <View className="min-w-0 flex-1">
                                            <Text
                                                numberOfLines={1}
                                                className="font-bold text-larder-espresso"
                                            >
                                                {item.name}
                                            </Text>

                                            <Text className="mt-1 text-xs text-larder-muted">
                                                {item.quantity} {item.unit}
                                                {" · "}
                                                {item.location}
                                            </Text>
                                        </View>

                                        <View className="ml-2 items-end">
                                            <Text
                                                className={`text-right text-xs font-bold ${
                                                    expired
                                                        ? "text-larder-terracotta-deep"
                                                        : "text-larder-terracotta"
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
                    accessibilityLabel="Manage my pantry"
                    onPress={() => router.push("/pantry")}
                    className="mt-7 items-center rounded-2xl border border-larder-border bg-larder-alabaster px-5 py-4"
                >
                    <Text className="font-bold text-larder-olive">
                        Manage my pantry
                    </Text>

                    <Text className="mt-1 text-center text-sm text-larder-muted">
                        Search, filter, sort, edit, and update items.
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}