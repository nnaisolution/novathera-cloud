import { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, typography } from "../theme";

type Props = {
  children?: ReactNode;
  kicker?: string;
  title?: string;
  subtitle?: string;
  /** When true, pads below the status bar. Tab-root screens that hide the stack header need this. */
  withTopInset?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Opt-in pull-to-refresh for screens backed by a remote query. */
  refreshControl?: ScrollViewProps["refreshControl"];
};

/**
 * Shared page chrome: warm cream canvas, consistent padding, optional kicker
 * and title. Used by tab roots and remaining inner pages so they share one
 * visual language with the dashboard.
 */
export function Screen({
  children,
  kicker,
  title,
  subtitle,
  withTopInset = false,
  contentStyle,
  refreshControl,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        withTopInset && { paddingTop: insets.top + spacing.md },
        contentStyle,
      ]}
      refreshControl={refreshControl}
    >
      {kicker || title || subtitle ? (
        <View style={styles.header}>
          {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: { gap: 6, marginBottom: spacing.xs },
  kicker: {
    ...typography.label,
    color: colors.secondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
});
