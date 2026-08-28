import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, elevation, radii, spacing, typography } from "../theme";

type Props = {
  title: string;
  caption?: string;
  onPress: () => void;
  /** Decorative glyph shown in a forest-tinted badge. */
  mark?: string;
  accented?: boolean;
};

/**
 * A tappable destination card for tab-home menus. Replaces stacked primary
 * buttons so Health, Care, and Account read as a clinical index rather than
 * a list of CTAs.
 */
export function NavCard({ title, caption, onPress, mark, accented = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption ? `${title}. ${caption}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, accented && styles.accented, pressed && styles.pressed]}
    >
      {mark ? (
        <View style={styles.badge}>
          <Text style={styles.mark}>{mark}</Text>
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      <Text style={styles.chevron} accessibilityElementsHidden>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    ...elevation.card,
  },
  accented: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  pressed: { opacity: 0.82 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: { ...typography.heading, color: colors.primary },
  copy: { flex: 1, gap: 2 },
  title: { ...typography.heading, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted },
  chevron: { fontSize: 22, lineHeight: 24, color: colors.secondary, fontWeight: "500" },
});
