
import { Text, View } from "react-native";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock,
} from "lucide-react-native";

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
        ? "#BE123C"
        : expiringSoon
            ? "#B45309"
            : "#047857";

    const accentClass = expired
        ? "bg-rose-500"
        : expiringSoon
            ? "bg-amber-500"
            : "bg-emerald-500";

    const borderClass = expired
        ? "border-rose-200"
        : expiringSoon
            ? "border-amber-200"
            : "border-emerald-200";

    const iconBackgroundClass = expired
        ? "bg-rose-50"
        : expiringSoon
            ? "bg-amber-50"
            : "bg-emerald-50";

    return (
        <View
            className={`overflow-hidden rounded-2xl border bg-white ${borderClass}`}
        >
            <View className="flex-row">
                <View className={`w-1.5 ${accentClass}`} />

                <View className="min-w-0 flex-1 p-4">
                    <View className="flex-row items-start justify-between gap-3">
                        <View className="min-w-0 flex-1">
                            <Text
                                numberOfLines={2}
                                className="text-base font-bold leading-6 text-slate-900"
                            >
                                {item.name}
                            </Text>

                            <Text className="mt-1 text-base font-semibold text-slate-700">
                                {item.quantity} {item.unit}
                            </Text>
                        </View>

                        <View className="shrink-0">
                            <ExpiryBadge expiryDate={item.expiryDate} />
                        </View>
                    </View>

                    <View className="mt-4 flex-row gap-x-4 gap-y-3 border-t border-slate-100 pt-3">
                        <View className="flex-row items-center gap-2">
                            <View
                                className={`h-9 w-9 items-center justify-center rounded-lg ${iconBackgroundClass}`}
                            >
                                <StatusIcon
                                    size={19}
                                    color={statusColor}
                                    strokeWidth={2}
                                />
                            </View>

                            <View className="flex-2">
                                <Text className="text-xs text-slate-500">
                                    Storage location
                                </Text>

                                <Text className="mt-0.5 text-sm font-semibold text-slate-800">
                                    {item.location}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-2">
                            <View className="h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                <CalendarDays
                                    size={18}
                                    color="#475569"
                                    strokeWidth={1.8}
                                />
                            </View>

                            <View>
                                <Text className="text-xs text-slate-500">
                                    Expiry date
                                </Text>

                                <Text className="mt-0.5 text-sm font-semibold text-slate-800">
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
