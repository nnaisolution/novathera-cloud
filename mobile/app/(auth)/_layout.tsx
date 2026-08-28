import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { stackHeaderOptions } from "../../src/theme";

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === "signedIn") {
    return <Redirect href="/(app)/dashboard" />;
  }

  return (
    <Stack screenOptions={{ ...stackHeaderOptions, title: "Nova Thera" }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="phone" options={{ title: "Sign in" }} />
      <Stack.Screen name="otp" options={{ title: "Verify" }} />
    </Stack>
  );
}
