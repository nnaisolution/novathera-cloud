import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/auth/AuthProvider";
import { TrpcProvider } from "../src/api/trpc";
import { hrefFromDeepLink } from "../src/navigation/deepLinks";
import { observeNotificationUrls } from "../src/notifications/push";

function useNotificationDeepLinks() {
  useEffect(() => {
    return observeNotificationUrls((url) => {
      const href = hrefFromDeepLink(url);
      if (href) router.push(href);
    });
  }, []);
}

export default function RootLayout() {
  useNotificationDeepLinks();

  return (
    <AuthProvider>
      <TrpcProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="appointments" />
          <Stack.Screen name="booking" />
        </Stack>
      </TrpcProvider>
    </AuthProvider>
  );
}
