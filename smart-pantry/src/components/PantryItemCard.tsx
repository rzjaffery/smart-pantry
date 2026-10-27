import { Text, View } from "react-native";
import type { PantryItem } from "@/types/pantry";
import { formatExpiryDate } from "@/lib/expiry";
import { ExpiryBadge } from "./ExpiryBadge";

type PantryItemCardProps = {
    item: PantryItem;
}

export function PantryItemCard({ item }: PantryItemCardProps) {
    return(
        <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-900">
            {item.name}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            {item.quantity} {item.unit}
          </Text>
        </View>

        <ExpiryBadge expiryDate={item.expiryDate} />
      </View>

      <View className="mt-4 border-t border-slate-100 pt-3">
        <Text className="text-xs text-slate-500">
          Location: {item.location}
        </Text>

        <Text className="mt-1 text-xs text-slate-500">
          Expires: {formatExpiryDate(item.expiryDate)}
        </Text>
      </View>
    </View>

    )
}