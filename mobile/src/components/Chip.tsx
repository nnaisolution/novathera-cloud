import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

export type ChipTone = "positive" | "neutral" | "attention" | "critical";

type Props = {
  label: string;
  tone: ChipTone;
};

const TONE_FILLS: Record<ChipTone, { background: string; dot: string }> = {
  positive: { background: colors.successMuted, dot: colors.success },
  neutral: { background: colors.surfaceMuted, dot: colors.secondary },
  // The gold tint already carries "read this" on the trends notices.
  attention: { background: colors.accentMuted, dot: colors.warning },
  critical: { background: colors.dangerMuted, dot: colors.danger },
};

/**
 * Small status pill.
 *
 * The label is always charcoal: every tone colour lands between 3.7:1 and
 * 4.1:1 on its own tint, which fails AA at this size. The tone is carried by
 * the fill and the dot, which are decoration and free of that constraint —
 * the same trade OptionSelector makes for its unselected pills.
 */
export function Chip({ label, tone }: Props) {
  const fill = TONE_FILLS[tone];

  return (
    <View style={[styles.chip, { backgroundColor: fill.background }]}>
      <View style={[styles.dot, { backgroundColor: fill.dot }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
  },
  dot: { width: 6, height: 6, borderRadius: radii.pill },
  label: { ...typography.caption, color: colors.text, fontWeight: "600" },
});
