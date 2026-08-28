import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../../src/auth/AuthProvider";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { StateMessage } from "../../src/components/StateMessage";
import { colors, radii, spacing, typography, webFocusOutline, webOutlineReset } from "../../src/theme";

const E164 = /^\+[1-9]\d{7,14}$/;

export default function PhoneScreen() {
  const router = useRouter();
  const { requestOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // autoFocus: start focused so the forest ring is present on first paint (web).
  const [focused, setFocused] = useState(true);

  async function onSubmit() {
    setError(null);
    if (!E164.test(phone.trim())) {
      setError("Enter a phone number in E.164 format, e.g. +15551234567");
      return;
    }
    setBusy(true);
    try {
      const { challengeId } = await requestOtp(phone.trim());
      router.push({ pathname: "/(auth)/otp", params: { challengeId } });
    } catch {
      setError("Could not send a verification code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Sign in</Text>
      <Text style={styles.title}>Verify your phone</Text>
      <Text style={styles.body}>
        We send a one-time code. Your number is stored encrypted and is never written to logs.
      </Text>
      <TextInput
        autoFocus
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        placeholder="+15551234567"
        placeholderTextColor={colors.textMuted}
        value={phone}
        onChangeText={setPhone}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, webFocusOutline(focused)]}
        accessibilityLabel="Phone number"
      />
      {error ? (
        <StateMessage tone="error" title="We couldn't continue" body={error} />
      ) : null}
      <PrimaryButton label={busy ? "Sending…" : "Send code"} onPress={onSubmit} disabled={busy} />
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
    fontSize: 18,
    color: colors.text,
    ...webOutlineReset,
  },
});
