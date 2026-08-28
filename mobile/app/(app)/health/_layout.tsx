import { Stack } from "expo-router";

import { stackHeaderOptions } from "../../../src/theme";

export default function HealthStack() {
  return (
    <Stack screenOptions={stackHeaderOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-reading" options={{ title: "Add reading" }} />
      <Stack.Screen name="sources" options={{ title: "Data sources" }} />
    </Stack>
  );
}
