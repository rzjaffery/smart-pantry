
import { View } from "react-native";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react-native";

import { AppText as Text } from "@/components/AppText";
import {
  daysUntilExpiry,
  getExpiryStatus,
} from "@/lib/expiry";
import type { ExpiryStatus } from "@/types/pantry";

type ExpiryBadgeProps = {
  expiryDate: string;
};

const backgroundClasses: Record<ExpiryStatus, string> = {
  expired: "bg-larder-terracotta-soft",
  today: "bg-larder-terracotta-soft",
  soon: "bg-larder-linen border border-larder-terracotta",
  fresh: "bg-larder-olive-soft",
};

const textClasses: Record<ExpiryStatus, string> = {
  expired: "text-larder-terracotta-deep",
  today: "text-larder-terracotta-deep",
  soon: "text-larder-terracotta-deep",
  fresh: "text-larder-olive",
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
      status === "fresh"
          ? "#556B2F"
          : "#8F4933";

  return (
      <View
          className={`self-start flex-row items-center gap-1.5 rounded-full px-3 py-1 ${backgroundClasses[status]}`}
      >
        <StatusIcon
            size={13}
            color={iconColor}
            strokeWidth={2.2}
        />

        <Text
            className={`text-xs font-semibold ${textClasses[status]}`}
        >
          {label}
        </Text>
      </View>
  );
}
