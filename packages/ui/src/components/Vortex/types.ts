import type { CSSProperties, ReactNode } from "react";

export type VortexQuality = "low" | "medium" | "high";

export type VortexProps = {
  children?: ReactNode;
  /** Base particle count before quality/area scaling. Clamped 40–900. Default 420. */
  particles?: number;
  /** Motion multiplier. Clamped 0.1–3. Default 1. */
  speed?: number;
  /** Spiral radius scale. Clamped 0.25–2. Default 1. */
  range?: number;
  /** Particle palette (CSS color strings). */
  colors?: string[];
  /** Brightness / size multiplier. Clamped 0–1. Default 0.65. */
  intensity?: number;
  /** Trail fade longevity. Clamped 0–1. Higher = slower fade. Default 0.7. */
  trailPersistence?: number;
  /** WebGL backing resolution / particle density scale. Default `medium`. */
  quality?: VortexQuality;
  /** Vortex center X as fraction of width (0–1). Default 0.5. */
  centerX?: number;
  /** Vortex center Y as fraction of height (0–1). Default 0.5. */
  centerY?: number;
  /** Stop continuous animation. Default false. */
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Honor `prefers-reduced-motion` (static frame, no loop). Default true. */
  respectReducedMotion?: boolean;
};
