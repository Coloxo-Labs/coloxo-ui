/** Coloxo brand ramp (matches --cx-brand-*). */
export const BRAND_SWATCHES = [
  "#eef2ff",
  "#e0e7ff",
  "#c7d2fe",
  "#a5b4fc",
  "#818cf8",
  "#4462ff",
  "#2348ff",
  "#1d3be0",
  "#152dc2",
  "#1b2f91",
] as const;

/** Neutral / gray ramp (matches --cx-neutral-*). */
export const GRAY_SWATCHES = [
  "#fafafa",
  "#f5f5f5",
  "#e5e5e5",
  "#d4d4d4",
  "#a1a1a1",
  "#737373",
  "#525252",
  "#404040",
  "#262626",
  "#171717",
] as const;

/** Default saved-swatch set (Untitled-style mixed accents). */
export const DEFAULT_SWATCHES = [
  "#2348ff",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#4b5563",
  "#ffffff",
  "#0a0a0a",
] as const;

/** Tailwind-style palette rows for the palette picker. */
export const COLOR_PALETTE: Record<string, readonly string[]> = {
  brand: BRAND_SWATCHES,
  gray: GRAY_SWATCHES,
  red: ["#fef2f2", "#fecaca", "#f87171", "#ef4444", "#b91c1c", "#7f1d1d"],
  orange: ["#fff7ed", "#fed7aa", "#fb923c", "#f97316", "#c2410c", "#7c2d12"],
  amber: ["#fffbeb", "#fde68a", "#fbbf24", "#f59e0b", "#b45309", "#78350f"],
  yellow: ["#fefce8", "#fde047", "#eab308", "#ca8a04", "#a16207", "#713f12"],
  lime: ["#f7fee7", "#bef264", "#84cc16", "#65a30d", "#4d7c0f", "#365314"],
  green: ["#f0fdf4", "#86efac", "#22c55e", "#16a34a", "#15803d", "#14532d"],
  teal: ["#f0fdfa", "#5eead4", "#14b8a6", "#0d9488", "#0f766e", "#134e4a"],
  cyan: ["#ecfeff", "#67e8f9", "#06b6d4", "#0891b2", "#0e7490", "#164e63"],
  blue: ["#eff6ff", "#93c5fd", "#3b82f6", "#2563eb", "#1d4ed8", "#1e3a8a"],
  indigo: ["#eef2ff", "#a5b4fc", "#6366f1", "#4f46e5", "#4338ca", "#312e81"],
  violet: ["#f5f3ff", "#c4b5fd", "#8b5cf6", "#7c3aed", "#6d28d9", "#4c1d95"],
  purple: ["#faf5ff", "#d8b4fe", "#a855f7", "#9333ea", "#7e22ce", "#581c87"],
  fuchsia: ["#fdf4ff", "#f0abfc", "#d946ef", "#c026d3", "#a21caf", "#701a75"],
  pink: ["#fdf2f8", "#f9a8d4", "#ec4899", "#db2777", "#be185d", "#831843"],
  rose: ["#fff1f2", "#fda4af", "#f43f5e", "#e11d48", "#be123c", "#881337"],
};
