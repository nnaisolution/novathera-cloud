import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../../src/components/PrimaryButton";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markGlyph}>N</Text>
      </View>
      <Text style={styles.kicker}>Nova Thera</Text>
      <Text style={styles.title}>Care you can carry with you</Text>
      <Text style={styles.body}>
        Secure access to your care plan, health readings, appointments, and membership — with consent you control.
      </Text>
      <PrimaryButton label="Continue with phone" onPress={() => router.push("/(auth)/phone")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.md,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  markGlyph: { ...typography.title, color: colors.onPrimary, fontSize: 24, lineHeight: 28 },
  kicker: {
    ...typography.label,
    color: colors.secondary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: { ...typography.display, color: colors.text, fontSize: 32, lineHeight: 38 },
  body: { ...typography.body, fontSize: 16, lineHeight: 24, color: colors.textMuted, marginBottom: spacing.sm },
});
