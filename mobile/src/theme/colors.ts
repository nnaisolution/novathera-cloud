/**
 * Nova Thera brand palette.
 *
 * `brand` holds the literal values handed down by design. Nothing in the app
 * should reach for a raw hex string; screens consume the semantic `colors` map
 * in ./index.ts, which is built from these tokens.
 */
export const brand = {
  primaryForest: "#183C35",
  secondarySage: "#789B8D",
  warmIvory: "#F7F4EE",
  softCream: "#FFFDF8",
  champagneGold: "#C7A66A",
  charcoal: "#26332F",
  // Slightly darker than the original #6D7873 so caption/body on Warm Ivory
  // (surfaceMuted) clears WCAG AA. Cream and white were already over 4.5:1.
  mutedText: "#646E69",
  success: "#4F8068",
  error: "#B94A48",
  white: "#FFFFFF",
} as const;

export const brandTabs = {
  active: "#183C35",
  inactive: "#9AA39F",
} as const;

/** Membership is a screen under `account/`, not a tab, so the gold lives here. */
export const brandAccent = {
  membership: "#C7A66A",
} as const;

/**
 * Tints and shades derived from the brand tokens. Champagne gold measures
 * 2.27:1 against Soft Cream, so it can only carry decoration (rules, borders,
 * fills). `goldInk` is the darkened gold used wherever the accent has to be
 * read as text; it clears 4.5:1 on cream and white (4.75:1 / 4.83:1).
 */
export const derived = {
  forestTint: "#E3EBE7",
  forestDeep: "#0F2A25",
  sageTint: "#DDE6E1",
  goldTint: "#F3EADA",
  goldInk: "#8A6E2F",
  successTint: "#E2ECE7",
  errorTint: "#F4E2E1",
  hairline: "#E4DFD4",
} as const;
