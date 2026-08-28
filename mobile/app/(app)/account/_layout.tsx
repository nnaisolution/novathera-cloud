import { Stack } from "expo-router";

import { stackHeaderOptions } from "../../../src/theme";

export default function AccountStack() {
  return (
    <Stack screenOptions={stackHeaderOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="consent" options={{ title: "Consent" }} />
      <Stack.Screen name="membership" options={{ title: "Membership" }} />
      <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
    </Stack>
  );
}
