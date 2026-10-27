export const PANTRY_LOCATION = [
    "Fridge",
    "Freezer",
    "Pantry",
] as const;

export type PantryLocation = (typeof PANTRY_LOCATION)[number];

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

