import type { CSSProperties, ReactNode } from "react";

export type FluidBackgroundQuality = "low" | "medium" | "high";

export type FluidBackgroundTrigger = "hover" | "always";

export type FluidBackgroundProps = {
  children?: ReactNode;
  /** Trail palette (CSS color strings). */
  colors?: string[];
  /**
   * `hover` — inject trails while the pointer moves inside the container.
   * `always` — same injection rules; ready without requiring a press.
   * Neither mode invents trails without pointer movement.
   */
  trigger?: FluidBackgroundTrigger;
  /** Stroke strength / width multiplier. Clamped 0–1. Default 0.7. */
  intensity?: number;
  /** How long trails linger. Clamped 0–1. Higher = slower fade. Default 0.65. */
  trailPersistence?: number;
  /** Internal canvas resolution scale. Default `medium`. */
  quality?: FluidBackgroundQuality;
  /** Disable trail injection and animation. */
  disabled?: boolean;
  /**
   * When `true` (default), the canvas stays alpha-cleared so the **parent**
   * controls background color/gradient/image. Trails fade via destination-out
   * and never paint a solid backdrop.
   * When `false`, the engine fills a solid midnight tint each frame before
   * drawing trails (canvas paints its own backdrop — usually unnecessary).
   */
  transparent?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Honor `prefers-reduced-motion` (disables effect). Default true. */
  respectReducedMotion?: boolean;
};
