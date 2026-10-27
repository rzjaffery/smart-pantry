
import { Text, View } from "react-native";
import {
  daysUntilExpiry,
  getExpiryStatus,
} from "../lib/expiry";
import type { ExpiryStatus } from "../types/pantry";

type ExpiryBadgeProps = {
  expiryDate: string;
};

const backgroundClasses: Record<ExpiryStatus, string> = {
  expired: "bg-red-100",
  today: "bg-red-100",
  soon: "bg-amber-100",
  fresh: "bg-emerald-100",
};

const textClasses: Record<ExpiryStatus, string> = {
  expired: "text-red-700",
  today: "text-red-700",
  soon: "text-amber-800",
  fresh: "text-emerald-800",
};

export function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  const days = daysUntilExpiry(expiryDate);
  const status = getExpiryStatus(days);

  let label: string;

  if (days < 0) {
    label = `${Math.abs(days)}d overdue`;
  } else if (days === 0) {
    label = "Expires today";
  } else if (days <= 7) {
    label = `${days}d left`;
  } else {
    label = "Fresh";
  }

  return (
    <View
      className={`self-start rounded-full px-3 py-1 ${backgroundClasses[status]}`}
    >
      <Text
        className={`text-xs font-semibold ${textClasses[status]}`}
      >
        {label}
      </Text>
    </View>
  );
}
