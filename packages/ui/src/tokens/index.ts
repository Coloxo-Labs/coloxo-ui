export const colorTokens = {
  // Semantic (preferred)
  textPrimary: "var(--cx-color-text-primary)",
  textSecondary: "var(--cx-color-text-secondary)",
  textTertiary: "var(--cx-color-text-tertiary)",
  textQuaternary: "var(--cx-color-text-quaternary)",
  bgPrimary: "var(--cx-color-bg-primary)",
  bgSecondary: "var(--cx-color-bg-secondary)",
  bgBrandSolid: "var(--cx-color-bg-brand-solid)",
  borderPrimary: "var(--cx-color-border-primary)",
  borderSecondary: "var(--cx-color-border-secondary)",
  fgPrimary: "var(--cx-color-fg-primary)",
  fgQuaternary: "var(--cx-color-fg-quaternary)",
  focusRing: "var(--cx-color-focus-ring)",
  brand600: "var(--cx-brand-600)",
  // Legacy aliases
  primary: "var(--cx-color-primary)",
  primaryHover: "var(--cx-color-primary-hover)",
  primaryActive: "var(--cx-color-primary-active)",
  primarySubtle: "var(--cx-color-primary-subtle)",
  primaryOn: "var(--cx-color-primary-on)",
  fg: "var(--cx-color-fg)",
  fgMuted: "var(--cx-color-fg-muted)",
  fgSubtle: "var(--cx-color-fg-subtle)",
  fgInverse: "var(--cx-color-fg-inverse)",
  bg: "var(--cx-color-bg)",
  bgSubtle: "var(--cx-color-bg-subtle)",
  bgMuted: "var(--cx-color-bg-muted)",
  bgOverlay: "var(--cx-color-bg-overlay)",
  border: "var(--cx-color-border)",
  borderStrong: "var(--cx-color-border-strong)",
  success: "var(--cx-color-success)",
  successSubtle: "var(--cx-color-success-subtle)",
  warning: "var(--cx-color-warning)",
  warningSubtle: "var(--cx-color-warning-subtle)",
  error: "var(--cx-color-error)",
  errorSubtle: "var(--cx-color-error-subtle)",
  info: "var(--cx-color-info)",
  infoSubtle: "var(--cx-color-info-subtle)",
  disabledBg: "var(--cx-color-disabled-bg)",
  disabledFg: "var(--cx-color-disabled-fg)",
} as const;

export const typographyTokens = {
  fontBody: "var(--cx-font-body)",
  fontSans: "var(--cx-font-sans)",
  fontMono: "var(--cx-font-mono)",
  textXs: "var(--cx-text-xs)",
  textSm: "var(--cx-text-sm)",
  textMd: "var(--cx-text-md)",
  textLg: "var(--cx-text-lg)",
  textXl: "var(--cx-text-xl)",
  text2xl: "var(--cx-text-2xl)",
  text3xl: "var(--cx-text-3xl)",
  displayMd: "var(--cx-display-md)",
  weightRegular: "var(--cx-font-weight-regular)",
  weightMedium: "var(--cx-font-weight-medium)",
  weightSemibold: "var(--cx-font-weight-semibold)",
} as const;

export const spacingTokens = {
  0: "var(--cx-space-0)",
  1: "var(--cx-space-1)",
  1.5: "var(--cx-space-1-5)",
  2: "var(--cx-space-2)",
  2.5: "var(--cx-space-2-5)",
  3: "var(--cx-space-3)",
  3.5: "var(--cx-space-3-5)",
  4: "var(--cx-space-4)",
  5: "var(--cx-space-5)",
  6: "var(--cx-space-6)",
  8: "var(--cx-space-8)",
  10: "var(--cx-space-10)",
  12: "var(--cx-space-12)",
} as const;

export const radiusTokens = {
  none: "var(--cx-radius-none)",
  xs: "var(--cx-radius-xs)",
  sm: "var(--cx-radius-sm)",
  md: "var(--cx-radius-md)",
  lg: "var(--cx-radius-lg)",
  xl: "var(--cx-radius-xl)",
  "2xl": "var(--cx-radius-2xl)",
  full: "var(--cx-radius-full)",
} as const;

export const shadowTokens = {
  xs: "var(--cx-shadow-xs)",
  sm: "var(--cx-shadow-sm)",
  md: "var(--cx-shadow-md)",
  lg: "var(--cx-shadow-lg)",
  xl: "var(--cx-shadow-xl)",
  xsSkeuomorphic: "var(--cx-shadow-xs-skeuomorphic)",
  focus: "var(--cx-shadow-focus)",
  focusError: "var(--cx-shadow-focus-error)",
} as const;

export const sizeTokens = {
  controlXs: "var(--cx-control-height-xs)",
  controlSm: "var(--cx-control-height-sm)",
  controlMd: "var(--cx-control-height-md)",
  controlLg: "var(--cx-control-height-lg)",
  controlXl: "var(--cx-control-height-xl)",
  iconXs: "var(--cx-icon-xs)",
  iconSm: "var(--cx-icon-sm)",
  iconMd: "var(--cx-icon-md)",
  iconLg: "var(--cx-icon-lg)",
  iconXl: "var(--cx-icon-xl)",
} as const;

export const motionTokens = {
  fast: "var(--cx-duration-fast)",
  base: "var(--cx-duration-base)",
  normal: "var(--cx-duration-normal)",
  slow: "var(--cx-duration-slow)",
  ease: "var(--cx-ease)",
  easeLinear: "var(--cx-ease-linear)",
  easeOut: "var(--cx-ease-out)",
} as const;

export const zIndexTokens = {
  base: "var(--cx-z-base)",
  dropdown: "var(--cx-z-dropdown)",
  sticky: "var(--cx-z-sticky)",
  overlay: "var(--cx-z-overlay)",
  modal: "var(--cx-z-modal)",
  notification: "var(--cx-z-notification)",
  tooltip: "var(--cx-z-tooltip)",
} as const;

export const tokens = {
  color: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  size: sizeTokens,
  motion: motionTokens,
  zIndex: zIndexTokens,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof colorTokens;
