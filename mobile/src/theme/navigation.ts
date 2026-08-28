import { colors, typography } from "./tokens";

/**
 * Shared native-stack chrome. Applied by every tab stack so inner pages
 * inherit the cream header rather than the platform default white bar.
 */
export const stackHeaderOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: {
    ...typography.heading,
    color: colors.text,
  },
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  headerBackTitle: "Back",
  contentStyle: { backgroundColor: colors.background },
} as const;
