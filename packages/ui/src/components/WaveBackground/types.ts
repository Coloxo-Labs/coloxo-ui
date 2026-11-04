import type { CSSProperties, ReactNode } from "react";

export type WaveBackgroundQuality = "low" | "medium" | "high";

export type WaveBackgroundFallback = "static" | "canvas";

export type WaveBackgroundProps = {
  children?: ReactNode;
  /** Wave palette (CSS color strings). */
  colors?: string[];
  /** Solid clear color when `transparent` is false. Default `#050816`. */
  backgroundColor?: string;
  /** Animation speed multiplier. Clamped 0.1–3. Default 1. */
  speed?: number;
  /** Wave height. Clamped 0–1. Default 0.45. */
  amplitude?: number;
  /** Spatial frequency scale. Clamped 0.25–2. Default 1. */
  frequency?: number;
  /** Extra wave-layer mix. Clamped 0–1. Default 0.55. */
  complexity?: number;
  /** Lighting / contrast. Clamped 0–1. Default 0.7. */
  intensity?: number;
  /** Enable pointer deformation. Default true. */
  interaction?: boolean;
  /** Pointer dent strength. Clamped 0–1. Default 0.65. */
  interactionStrength?: number;
  /** Pointer influence radius (fraction of min dimension). Clamped 0.05–0.6. Default 0.22. */
  interactionRadius?: number;
  /** How quickly interaction decays after leave. Clamped 0.1–1. Default 0.55. */
  interactionDecay?: number;
  /** Mesh density / DPR scale. Default `medium`. */
  quality?: WaveBackgroundQuality;
  /** Used when WebGL is unavailable. Default `static`. */
  fallback?: WaveBackgroundFallback;
  /** Stop continuous animation. Default false. */
  paused?: boolean;
  /** Honor `prefers-reduced-motion`. Default true. */
  respectReducedMotion?: boolean;
  /**
   * When `true` (default), the canvas stays alpha-cleared so the parent
   * controls background. `false` clears with `backgroundColor`.
   */
  transparent?: boolean;
  className?: string;
  style?: CSSProperties;
};
