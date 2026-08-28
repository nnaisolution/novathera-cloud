import { Stack } from "expo-router";

import { stackHeaderOptions } from "../../../src/theme";

export default function CareStack() {
  return (
    <Stack screenOptions={stackHeaderOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="programs/index" options={{ title: "Programs" }} />
      <Stack.Screen name="programs/[id]" options={{ title: "Program" }} />
      <Stack.Screen name="aftercare" options={{ title: "Aftercare" }} />
      <Stack.Screen name="appointments" options={{ title: "Appointments" }} />
      <Stack.Screen name="appointments/[id]" options={{ title: "Appointment" }} />
      <Stack.Screen name="book" options={{ title: "Book visit" }} />
    </Stack>
  );
}
