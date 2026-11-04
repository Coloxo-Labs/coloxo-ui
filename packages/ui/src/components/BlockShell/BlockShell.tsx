"use client";

import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./BlockShell.module.css";

export type BlockTone = "default" | "brand" | "neutral" | "vibrant" | "dark";

export type BlockShellProps = {
  /** Colour treatment for the block and everything inside it. */
  tone?: BlockTone;
  /** Drop the outer padding — for blocks that own their own canvas. */
  bare?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Brand ramps, so a tone recolours every brand-derived token at once. */
const RAMP = {
  brand: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#4462ff",
    600: "#2348ff",
    700: "#1d3be0",
    800: "#152dc2",
    900: "#1b2f91",
    950: "#131d57",
  },
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
  vibrant: {
    50: "#f5f3ff",
    100: "#ede9fe",
    200: "#ddd6fe",
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    800: "#5b21b6",
    900: "#4c1d95",
    950: "#2e1065",
  },
} as const;

function rampVars(ramp: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [step, value] of Object.entries(ramp)) {
    out[`--cx-brand-${step}`] = value;
  }
  return out;
}

/** Extra surface variables a tone needs beyond the theme layer. */
const SURFACE: Record<BlockTone, Record<string, string>> = {
  default: {},
  brand: {},
  neutral: {},
  vibrant: {},
  dark: {},
};

/**
 * Canvas and token contract shared by every block.
 *
 * A tone works by handing the library its own theme layer: `data-cx-theme`
 * re-points every semantic token (text, surface, border, brand) for the
 * subtree, so components inside a `dark` block style themselves correctly
 * without each block overriding their colours by hand.
 *
 * Blocks additionally receive `--blk-*` variables — a short, stable surface
 * they can use for bespoke markup such as dividers and custom cards.
 */
export function BlockShell({
  tone = "default",
  bare = false,
  className,
  style,
  children,
}: BlockShellProps) {
  const isDark = tone === "dark";
  const ramp =
    tone === "neutral" ? rampVars(RAMP.neutral) : tone === "vibrant" ? rampVars(RAMP.vibrant) : {};

  return (
    <div
      className={cx(styles.shell, bare && styles.bare, className)}
      data-tone={tone}
      data-cx-theme={isDark ? "dark" : "light"}
      style={
        {
          colorScheme: isDark ? "dark" : "light",
          ...ramp,
          ...SURFACE[tone],
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
