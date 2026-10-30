
import { View } from "react-native";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock,
} from "lucide-react-native";

import { AppText as Text } from "@/components/AppText";
import type { PantryItem } from "@/types/pantry";
import {
    daysUntilExpiry,
    formatExpiryDate,
} from "@/lib/expiry";

import { ExpiryBadge } from "./ExpiryBadge";

type PantryItemCardProps = {
    item: PantryItem;
};

export function PantryItemCard({ item }: PantryItemCardProps) {
    const daysLeft = daysUntilExpiry(item.expiryDate);
    const expired = daysLeft < 0;
    const expiringSoon = !expired && daysLeft <= 3;

    const StatusIcon = expired
        ? AlertCircle
        : expiringSoon
            ? Clock
            : CheckCircle2;

    const statusColor = expired
        ? "#8F4933"
        : expiringSoon
            ? "#C26D4C"
            : "#556B2F";

    const accentClass = expired
        ? "bg-larder-terracotta-deep"
        : expiringSoon
            ? "bg-larder-terracotta"
            : "bg-larder-olive";

    const borderClass = expired || expiringSoon
        ? "border-larder-terracotta-soft"
        : "border-larder-border";

    const iconBackgroundClass = expired || expiringSoon
        ? "bg-larder-terracotta-soft"
        : "bg-larder-olive-soft";

    return (
        <View
            className={`overflow-hidden rounded-2xl border bg-larder-alabaster ${borderClass}`}
        >
            <View className="flex-row">
                {/* Status accent */}
                <View className={`w-1.5 ${accentClass}`} />

                <View className="min-w-0 flex-1 p-4">
                    {/* Item information */}
                    <View className="flex-row items-start justify-between gap-3">
                        <View className="min-w-0 flex-1">
                            <Text
                                numberOfLines={2}
                                className="text-base font-bold leading-6 tracking-display text-larder-espresso"
                            >
                                {item.name}
                            </Text>

                            <Text className="mt-1 text-base font-medium text-larder-olive">
                                {item.quantity} {item.unit}
                            </Text>
                        </View>

                        <View className="shrink-0">
                            <ExpiryBadge expiryDate={item.expiryDate} />
                        </View>
                    </View>

                    {/* Storage and expiry information */}
                    <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-3 border-t border-larder-border pt-3">
                        {/* Storage location */}
                        <View className="min-w-0 flex-1 flex-row items-center gap-2">
                            <View
                                className={`h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBackgroundClass}`}
                            >
                                <StatusIcon
                                    size={18}
                                    color={statusColor}
                                    strokeWidth={2}
                                />
                            </View>

                            <View className="min-w-0 flex-1">
                                <Text className="text-xs text-larder-muted">
                                    Storage location
                                </Text>

                                <Text
                                    numberOfLines={1}
                                    className="mt-0.5 text-sm font-semibold text-larder-espresso"
                                >
                                    {item.location}
                                </Text>
                            </View>
                        </View>

                        {/* Expiry date */}
                        <View className="min-w-0 flex-1 flex-row items-center gap-2">
                            <View className="h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-larder-olive-soft">
                                <CalendarDays
                                    size={18}
                                    color="#556B2F"
                                    strokeWidth={1.8}
                                />
                            </View>

                            <View className="min-w-0 flex-1">
                                <Text className="text-xs text-larder-muted">
                                    Expiry date
                                </Text>

                                <Text
                                    numberOfLines={1}
                                    className="mt-0.5 text-sm font-semibold text-larder-espresso"
                                >
                                    {formatExpiryDate(item.expiryDate)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
