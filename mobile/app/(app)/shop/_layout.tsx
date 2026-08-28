import { Stack } from "expo-router";

import { stackHeaderOptions } from "../../../src/theme";

export default function ShopStack() {
  return (
    <Stack screenOptions={stackHeaderOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[slug]" options={{ title: "Product" }} />
      <Stack.Screen name="cart" options={{ title: "Cart" }} />
    </Stack>
  );
}
