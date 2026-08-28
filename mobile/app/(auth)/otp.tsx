import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../../src/auth/AuthProvider";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { StateMessage } from "../../src/components/StateMessage";
import { env } from "../../src/config/env";
import { colors, radii, spacing, typography, webFocusOutline, webOutlineReset } from "../../src/theme";

export default function OtpScreen() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // autoFocus: start focused so the forest ring is present on first paint (web).
  const [focused, setFocused] = useState(true);

  async function onSubmit() {
    if (!challengeId || code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyOtp(challengeId, code);
      router.replace("/(app)/dashboard");
    } catch {
      setError("That code is invalid or expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Verify</Text>
      <Text style={styles.title}>Enter your code</Text>
      <Text style={styles.body}>
        Codes expire quickly and are hashed on the server. We never display your phone number on this screen.
      </Text>
      <TextInput
        autoFocus
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, webFocusOutline(focused)]}
        accessibilityLabel="Verification code"
      />
      {env.enableOtpDebugHint ? (
        <Text style={styles.hint}>Development: the API may accept 000000 when OTP_DEV_BYPASS is enabled.</Text>
      ) : null}
      {error ? (
        <StateMessage tone="error" title="We couldn't verify that code" body={error} />
      ) : null}
      <PrimaryButton label={busy ? "Verifying…" : "Verify"} onPress={onSubmit} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    ...typography.label,
    color: colors.secondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: { ...typography.title, color: colors.text },
  body: { ...typography.body, color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    color: colors.text,
    ...webOutlineReset,
  },
  hint: { ...typography.caption, color: colors.warning },
});
