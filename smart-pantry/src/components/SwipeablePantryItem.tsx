
import { useState } from "react";
import {
    Alert,
    Pressable,
    Text,
    View,
} from "react-native";

import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { PantryItemCard } from "./PantryItemCard";
import type {
    PantryItem,
    PantryOutcome,
} from "../types/pantry";

type SwipeablePantryItemProps = {
    item: PantryItem;
    onComplete: (
        id: string,
        outcome: PantryOutcome,
    ) => Promise<void>;
};

export function SwipeablePantryItem({
                                        item,
                                        onComplete,
                                    }: SwipeablePantryItemProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleComplete = async (outcome: PantryOutcome) => {
        if (isSaving) return;

        setIsSaving(true);

        try {
            await onComplete(item.id, outcome);
            // On success, the item leaves the active list.
        } catch {
            setIsSaving(false);

            Alert.alert(
                "Couldn't update item",
                "Your pantry change could not be saved. Please try again.",
            );
        }
    };

    return (
        <ReanimatedSwipeable
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            containerStyle={{
                marginBottom: 12,
                borderRadius: 16,
                overflow: "hidden",
            }}
            renderRightActions={() => (
                <View className="flex-row">
                    <Pressable
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel={`Mark ${item.name} as consumed`}
                        onPress={() => void handleComplete("consumed")}
                        className="w-24 items-center justify-center bg-emerald-700 px-2"
                    >
                        <Text className="text-lg text-white">✓</Text>
                        <Text className="text-center text-xs font-bold text-white">
                            Consumed
                        </Text>
                    </Pressable>

                    <Pressable
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel={`Mark ${item.name} as wasted`}
                        onPress={() => void handleComplete("wasted")}
                        className="w-24 items-center justify-center bg-rose-700 px-2"
                    >
                        <Text className="text-lg text-white">×</Text>
                        <Text className="text-center text-xs font-bold text-white">
                            Wasted
                        </Text>
                    </Pressable>
                </View>
            )}
        >
            <PantryItemCard item={item} />
        </ReanimatedSwipeable>
    );
}
