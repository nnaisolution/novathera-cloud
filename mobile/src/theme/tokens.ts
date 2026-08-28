import { Platform, type TextStyle, type ViewStyle } from "react-native";

import { brand, brandAccent, brandTabs, derived } from "./colors";

/**
 * Semantic tokens. The key names predate the brand refresh and are consumed by
 * the auth screens, the tab layout, and the shared buttons, so they are kept
 * and remapped onto brand values rather than renamed.
 *
 * Text pairings were checked against WCAG AA (relative luminance). The
 * tightest body pairing is `textMuted` on `surfaceMuted` (Warm Ivory) at
 * 4.81:1; on Soft Cream it is 5.20:1. `accent` is decorative only (2.27:1 on
 * cream); `warning` is the darkened gold used when the accent must be read.
 *
 * These live apart from ./index so that ./navigation can read them without
 * importing the barrel, which would form a require cycle and leave `colors`
 * uninitialized at module-evaluation time.
 */
export const colors = {
  background: brand.softCream,
  surface: brand.white,
  /** Inset rows, chips, and chart plot areas that need to recede from a card. */
  surfaceMuted: brand.warmIvory,

  primary: brand.primaryForest,
  primaryStrong: derived.forestDeep,
  primaryMuted: derived.forestTint,
  onPrimary: brand.white,

  secondary: brand.secondarySage,
  secondaryMuted: derived.sageTint,

  text: brand.charcoal,
  textMuted: brand.mutedText,
  onAccent: brand.charcoal,

  border: derived.hairline,
  borderStrong: derived.sageTint,

  danger: brand.error,
  dangerMuted: derived.errorTint,
  warning: derived.goldInk,
  success: brand.success,
  successMuted: derived.successTint,

  /** Champagne gold. Decoration only — see the note above. */
  accent: brandAccent.membership,
  accentMuted: derived.goldTint,

  tabActive: brandTabs.active,
  tabInactive: brandTabs.inactive,
  tabBackground: brand.white,
  tabBorder: derived.hairline,

  chartLine: brand.primaryForest,
  chartFill: derived.forestTint,
  chartGrid: derived.sageTint,
  chartPoint: brand.primaryForest,
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

/**
 * Soft clinical elevation — enough to lift a card off cream, not a drop
 * shadow. Web must use `boxShadow`; the `shadow*` props warn as deprecated
 * there. iOS keeps the native shadow, Android keeps `elevation`.
 */
const cardElevationIos: ViewStyle = {
  shadowColor: brand.primaryForest,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
};

export const elevation = {
  card: Platform.select<ViewStyle>({
    web: {
      // Forest at the same 6% opacity as the iOS shadow.
      boxShadow: "0px 6px 14px rgba(24, 60, 53, 0.06)",
    },
    ios: cardElevationIos,
    android: { elevation: 2, shadowColor: brand.primaryForest },
    default: { ...cardElevationIos, elevation: 2 },
  }) ?? { ...cardElevationIos, elevation: 2 },
};

/**
 * Kill the browser's default blue focus outline. Pair with `webFocusOutline`
 * so a forest ring appears only while the field is focused.
 */
export const webOutlineReset: TextStyle = Platform.OS === "web" ? { outlineWidth: 0 } : {};

/** Forest focus ring for web inputs. Empty on native so iOS/Android are untouched. */
export function webFocusOutline(focused: boolean): TextStyle {
  if (Platform.OS !== "web" || !focused) return {};
  return {
    outlineWidth: 2,
    outlineStyle: "solid",
    outlineColor: colors.primary,
    outlineOffset: 2,
    boxShadow: `0 0 0 4px ${colors.primaryMuted}`,
  };
}

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: "700" },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: "700" },
  metric: { fontSize: 28, lineHeight: 32, fontWeight: "700" },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
  label: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
} as const;
