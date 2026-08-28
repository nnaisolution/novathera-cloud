import { Redirect, Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { useAuth } from "../../src/auth/AuthProvider";
import { useDeviceHealthSync } from "../../src/features/health/hooks/useDeviceHealthSync";
import { useLocalReminders } from "../../src/features/notifications/hooks/useLocalReminders";
import { colors } from "../../src/theme";

export default function AppTabsLayout() {
  const { status } = useAuth();
  useDeviceHealthSync();
  useLocalReminders();

  if (status === "signedOut") {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { color: colors.text, fontWeight: "700" },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopColor: colors.tabBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3, paddingBottom: 6 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>⌂</Text>,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>+</Text>,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>$</Text>,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: "Care",
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>♥</Text>,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>•</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // The glyphs are plain text, so they ignore the tab tint unless it is passed
  // through explicitly.
  icon: { fontSize: 18, lineHeight: 22 },
});
