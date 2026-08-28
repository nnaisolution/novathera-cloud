import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, elevation, radii, spacing, typography } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

type Tone = "loading" | "empty" | "error";

type Props = {
  tone: Tone;
  title: string;
  body: string;
  /** Optional secondary line for a caveat the patient should see. */
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const TONE_STYLES: Record<Tone, { glyph: string; tint: string; background: string }> = {
  loading: { glyph: "", tint: colors.primary, background: colors.primaryMuted },
  empty: { glyph: "+", tint: colors.primary, background: colors.primaryMuted },
  error: { glyph: "!", tint: colors.danger, background: colors.dangerMuted },
};

export function StateMessage({ tone, title, body, note, actionLabel, onAction }: Props) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <View style={styles.container} accessibilityRole={tone === "error" ? "alert" : undefined}>
      <View style={[styles.badge, { backgroundColor: toneStyle.background }]}>
        {tone === "loading" ? (
          <ActivityIndicator color={toneStyle.tint} />
        ) : (
          <Text style={[styles.glyph, { color: toneStyle.tint }]}>{toneStyle.glyph}</Text>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
    ...elevation.card,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  glyph: { fontSize: 22, fontWeight: "700", lineHeight: 26 },
  title: { ...typography.heading, color: colors.text, textAlign: "center" },
  body: { ...typography.body, color: colors.textMuted, textAlign: "center" },
  note: { ...typography.caption, color: colors.warning, textAlign: "center", marginTop: spacing.xs },
  action: { alignSelf: "stretch", marginTop: spacing.sm },
});
