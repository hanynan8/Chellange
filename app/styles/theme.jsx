/**
 * theme.js
 *
 * Single source of truth for design tokens consumed by JS/inline-styles.
 * Values point to CSS custom properties defined in tokens.css —
 * never raw hex values.
 *
 * Usage:
 *   import { T } from "@/styles/theme";
 *   <div style={{ background: T.bg }} />
 */

export const T = {
  /* Backgrounds */
  bg:           "var(--color-bg)",
  bgCard:       "var(--color-bg-card)",

  /* Borders */
  border:       "var(--color-border)",
  borderStrong: "var(--color-border-strong)",

  /* Accent */
  accent:       "var(--color-accent)",
  accentSoft:   "var(--color-accent-soft)",
  accentGlow:   "var(--color-accent-glow)",

  /* Text */
  text:         "var(--color-text)",
  textMid:      "var(--color-text-mid)",
  textSoft:     "var(--color-text-soft)",

  /* Providers */
  aws:          "var(--color-aws)",
  azure:        "var(--color-azure)",
  gcp:          "var(--color-gcp)",
  onprem:       "var(--color-onprem)",
  green:        "var(--color-green)",

  /* Typography */
  mono:         "var(--font-mono)",
  sans:         "var(--font-sans)",

  /* Fluid sizes (CSS clamp) */
  orbSize:      "var(--orb-size)",
  logoSize:     "var(--logo-size)",
  cardPadding:  "var(--card-padding)",
};

/**
 * resolveColor
 * Maps a provider colorKey string → its CSS variable token.
 * Keeps components free of any hardcoded color logic.
 *
 * @param {string} colorKey  — "aws" | "azure" | "gcp" | "onprem" | "green" | "accent"
 * @returns {string}         — "var(--color-xxx)"
 */
export function resolveColor(colorKey) {
  const map = {
    aws:    "var(--color-aws)",
    azure:  "var(--color-azure)",
    gcp:    "var(--color-gcp)",
    onprem: "var(--color-onprem)",
    green:  "var(--color-green)",
    accent: "var(--color-accent)",
  };
  return map[colorKey] ?? "var(--color-accent)";
}

/**
 * applyTheme
 * Sets data-theme attribute on <html> so tokens.css dark-mode
 * variables take effect instantly without a React re-render cycle.
 *
 * @param {boolean} dark
 */
export function applyTheme(dark) {
  document.documentElement.setAttribute(
    "data-theme",
    dark ? "dark" : "light"
  );
}