import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

type Tone = "neutral" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: Tone;
  accessibilityLabel?: string;
};

export function SecondaryButton({ label, onPress, disabled, tone = "neutral", accessibilityLabel }: Props) {
  const danger = tone === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, danger && styles.danger, disabled && styles.disabled]}
    >
      <Text style={[styles.label, danger && styles.dangerLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  danger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  disabled: { opacity: 0.5 },
  label: { ...typography.label, color: colors.primary, fontSize: 16, lineHeight: 22 },
  dangerLabel: { color: colors.danger },
});
