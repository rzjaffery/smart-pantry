import { ExpiryStatus } from "@/types/pantry";

const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(
  days: number,
  from: Date = new Date(),
): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  date.setDate(date.getDate() + days);

  return toDateKey(date);
}

function dateKeytoDayNumber(dateKey: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) {
    throw new Error(`Invalid date key: ${dateKey}, Expected YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid Calender date: ${dateKey}`);
  }

  return timestamp / MILLISECONDS_IN_A_DAY;
}

export function daysUntilExpiry(
  expirtyDate: string,
  now: Date = new Date(),
): number {
  return dateKeytoDayNumber(expirtyDate) - dateKeytoDayNumber(toDateKey(now));
}

export function getExpiryStatus(days: number): ExpiryStatus {
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days <= 7) return "soon";
  return "fresh";
}

export function formatExpiryDate(dateKey: string): string {
  dateKeytoDayNumber(dateKey); // Validate date key

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
