import { Text, View } from "react-native";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react-native";

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

  const StatusIcon =
      status === "expired"
          ? AlertCircle
          : status === "today" || status === "soon"
              ? Clock
              : CheckCircle2;

  const iconColor =
      status === "expired" || status === "today"
          ? "#B91C1C"
          : status === "soon"
              ? "#92400E"
              : "#166534";

  return (
      <View
          className={`self-start flex-row items-center gap-1.5 rounded-full px-3 py-1 ${backgroundClasses[status]}`}
      >
        <StatusIcon size={13} color={iconColor} strokeWidth={2.2} />
        <Text
            className={`text-xs font-semibold ${textClasses[status]}`}
        >
          {label}
        </Text>
      </View>
  );
}

