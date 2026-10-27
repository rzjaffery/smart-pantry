import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    
    <View className="flex-1 items-center justify-center bg-emerald-50 px-6">
      <Text className="text-3xl font-bold text-emerald-800">
        Smart Pantry
      </Text>

      <Text className="mt-3 text-base text-slate-600 text-center">
        Your pantry, before it expires.
      </Text>

      <View className="mt-8 rounded-2xl bg-white p-5">
        <Text className="text-lg font-semibold text-slate-800">
          Your kitchen, organized
        </Text>

        <Text className="mt-2 text-sm text-slate-500">
          Track freshness. Reduce waste. Find your next meal.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
