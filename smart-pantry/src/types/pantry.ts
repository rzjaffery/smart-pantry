export const PANTRY_LOCATIONS = [
    "Fridge",
    "Freezer",
    "Pantry",
] as const;

export type PantryLocation = (typeof PANTRY_LOCATIONS)[number];

export type PantryOutcome = "consumed" | "wasted";

export type ExpiryStatus = "expired" | "today" | "soon" | "fresh";

export interface PantryItem{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    location: PantryLocation;
    expiryDate: string;
}

export type PantryListRow = | {
    type: "location";
    key: string;
    location: PantryLocation;
} | {
    type: "item";
    key: string;
    item: PantryItem;
}

export interface PantryHistoryEntry {
    item: PantryItem;
    outcome: PantryOutcome;
    completedAt: string;
}