import { Stack } from "expo-router";

import { stackHeaderOptions } from "../../../src/theme";

export default function DashboardStack() {
  return (
    <Stack screenOptions={stackHeaderOptions}>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="trends" options={{ title: "Trends" }} />
    </Stack>
  );
}
