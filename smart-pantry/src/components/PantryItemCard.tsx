import { Text, View } from "react-native";
import type { PantryItem } from "@/types/pantry";
import {daysUntilExpiry, formatExpiryDate} from "@/lib/expiry";
import { ExpiryBadge } from "./ExpiryBadge";

type PantryItemCardProps = {
    item: PantryItem;
}

export function PantryItemCard({ item }: PantryItemCardProps) {

  const daysLeft = daysUntilExpiry(item.expiryDate);
  const statusStyle =
      daysLeft < 0
          ? {
            border: "border-rose-200",
            accent: "bg-rose-500",
            iconBackground: "bg-rose-50",
            icon: "!" ,
          }
          : daysLeft <= 3
              ? {
                border: "border-amber-200",
                accent: "bg-amber-500",
                iconBackground: "bg-amber-50",
                icon: "!",
              }
              : {
                border: "border-emerald-200",
                accent: "bg-emerald-500",
                iconBackground: "bg-emerald-50",
                icon: "✓",
              };
    return(
        <View
            className={`overflow-hidden rounded-2xl border bg-white ${statusStyle.border}`}
        >
          <View className="flex-row">
            {/* Expiry status indicator */}
            <View className={`w-1.5 ${statusStyle.accent}`} />

            <View className="min-w-0 flex-1 p-4">
              {/* Item name, quantity, and expiry badge */}
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

              {/* Storage and expiry details */}
              <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-3 border-t border-slate-100 pt-3">
                <View className="flex-row items-center gap-2">
                  <View
                      className={`h-8 w-8 items-center justify-center rounded-lg ${statusStyle.iconBackground}`}
                  >
                    <Text className="text-sm font-bold text-slate-700">
                      {statusStyle.icon}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-xs text-slate-500">
                      Storage location
                    </Text>

                    <Text
                        numberOfLines={1}
                        className="mt-0.5 text-sm font-semibold text-slate-800"
                    >
                      {item.location}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Text className="text-sm">📅</Text>
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
    )
}