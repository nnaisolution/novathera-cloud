import { StyleSheet, Text, View } from "react-native";

import { colors, elevation, radii, spacing, typography } from "../../../theme";
import {
  OBSERVATION_LABELS,
  formatRelativeTime,
  formatUnit,
  formatValue,
  hasSplitComponents,
  type Observation,
} from "../observations";

type Props = {
  observation: Observation;
  now?: Date;
};

/**
 * One latest reading.
 *
 * Blood pressure gets a caveat instead of a fabricated "120/80": `health.list`
 * selects `valueNormalized` only, and the ingest path leaves that column NULL
 * for readings supplied as systolic/diastolic components, so the pair simply is
 * not in this response.
 */
export function MetricCard({ observation, now }: Props) {
  const label = OBSERVATION_LABELS[observation.type];
  const split = hasSplitComponents(observation.type);
  const unit = formatUnit(observation.type, observation.unit);

  const caveat = split
    ? observation.value === null
      ? "Systolic and diastolic are stored, but this view can't read them yet."
      : "Single normalized value — not the systolic/diastolic pair."
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      {observation.value === null ? (
        <Text style={styles.unavailable}>{split ? "Recorded" : "No value"}</Text>
      ) : (
        <View style={styles.valueRow}>
          <Text style={styles.value}>{formatValue(observation.type, observation.value)}</Text>
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
      )}

      <Text style={styles.timestamp}>{formatRelativeTime(observation.effectiveAt, now)}</Text>
      {caveat ? <Text style={styles.caveat}>{caveat}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "47%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 4,
    ...elevation.card,
  },
  label: { ...typography.label, color: colors.secondary, letterSpacing: 0.4, textTransform: "uppercase" },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 4 },
  value: { ...typography.metric, color: colors.text },
  unit: { ...typography.label, color: colors.textMuted },
  unavailable: { ...typography.title, color: colors.textMuted, marginTop: 4 },
  timestamp: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  caveat: { ...typography.caption, color: colors.warning, marginTop: 2 },
});
