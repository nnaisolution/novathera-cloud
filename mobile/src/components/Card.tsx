import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, elevation, radii, spacing, typography } from "../theme";

type Props = {
  children: ReactNode;
  title?: string;
  caption?: string;
  /** Champagne gold rule for membership-flavoured surfaces. */
  accented?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, title, caption, accented, style }: Props) {
  return (
    <View style={[styles.card, accented && styles.accented, style]}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...elevation.card,
  },
  accented: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  title: { ...typography.heading, color: colors.text, flexShrink: 1 },
  caption: { ...typography.caption, color: colors.textMuted },
});
