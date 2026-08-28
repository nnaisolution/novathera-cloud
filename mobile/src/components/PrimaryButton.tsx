import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  pressed: { backgroundColor: colors.primaryStrong },
  disabled: { opacity: 0.5 },
  label: { ...typography.label, color: colors.onPrimary, fontSize: 16, lineHeight: 22, letterSpacing: 0.2 },
});
