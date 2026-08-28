import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme";

export type SelectorOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: readonly SelectorOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /**
   * "segmented" splits the width evenly and suits a short fixed set;
   * "scroll" keeps pills at their natural width and scrolls horizontally.
   */
  layout?: "segmented" | "scroll";
};

export function OptionSelector<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  layout = "segmented",
}: Props<T>) {
  const pills = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected }}
        onPress={() => onChange(option.value)}
        style={[
          styles.pill,
          layout === "segmented" && styles.pillSegment,
          selected && styles.pillSelected,
        ]}
      >
        <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
          {option.label}
        </Text>
      </Pressable>
    );
  });

  if (layout === "scroll") {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={accessibilityLabel}
        contentContainerStyle={styles.scrollContent}
      >
        {pills}
      </ScrollView>
    );
  }

  return (
    <View style={styles.segmented} accessibilityLabel={accessibilityLabel}>
      {pills}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: 3,
    gap: 3,
  },
  scrollContent: { gap: spacing.xs, paddingRight: spacing.md },
  pill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  pillSegment: { flex: 1, paddingHorizontal: spacing.xs },
  pillSelected: { backgroundColor: colors.primary },
  // Charcoal rather than muted: these 13px labels need 4.5:1, and charcoal
  // leaves more margin on the ivory pill than muted (which now clears 4.81:1).
  // The selected state is carried by the forest fill, not by the label colour.
  label: { ...typography.label, color: colors.text },
  labelSelected: { color: colors.onPrimary },
});
