
import "../../global.css";

import { Stack } from "expo-router";
import { PantryProvider } from "@/context/PantryContext";

export default function RootLayout() {
  return (
      <PantryProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PantryProvider>
  );
}
