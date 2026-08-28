import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text } from "react-native";

import { useAuth } from "../../../src/auth/AuthProvider";
import { Card } from "../../../src/components/Card";
import { NavCard } from "../../../src/components/NavCard";
import { Screen } from "../../../src/components/Screen";
import { SecondaryButton } from "../../../src/components/SecondaryButton";
import { colors, typography } from "../../../src/theme";

export default function PrivacyScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You'll need a new code the next time you open Nova Thera.", [
      { text: "Not now", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);
  };

  return (
    <Screen
      kicker="Account"
      title="Privacy"
      subtitle="What Nova Thera stores, what this app can see, and how you control it."
    >
      <Card title="What this app can see">
        <Text style={styles.body}>
          Your display name, language, and time zone. Readings you log after granting
          treatment consent. Appointments and membership from the clinic system when this
          device has a clinic session.
        </Text>
        <Text style={styles.body}>
          Your phone number is the credential you sign in with. It is stored encrypted and
          hashed for lookup, and the app is never sent it back — so it cannot be displayed
          or changed here.
        </Text>
      </Card>

      <Card title="What the clinic holds, not shown here">
        <Text style={styles.body}>
          Date of birth and sex at birth sit on your clinical record, which this app has no
          read access to. Nova Thera does not keep an email or postal address for you in
          this product.
        </Text>
        <Text style={styles.body}>
          There is no export or delete-my-data action in this API. Ask the clinic if you
          need a copy of your record or want an account closed.
        </Text>
      </Card>

      <Card title="How identifiers are protected">
        <Text style={styles.body}>
          One-time codes are hashed. Device tokens for future push alerts are stored
          hashed. HealthKit and Health Connect stay off until you grant OS permission and
          in-app consent. Audit logs are scoped so they do not carry clinical values.
        </Text>
      </Card>

      <NavCard
        mark="C"
        title="Health data consent"
        caption="Grant or revoke treatment and sharing"
        onPress={() => router.push("/(app)/account/consent")}
      />

      <SecondaryButton tone="danger" label="Sign out" onPress={confirmSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.textMuted },
});
