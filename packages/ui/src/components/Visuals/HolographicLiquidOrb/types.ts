import type { CSSProperties, ReactNode } from "react";

export type OrbColorScheme =
  | "iridescent"
  | "aurora"
  | "sunset"
  | "ocean"
  | "monochrome";

export type HolographicLiquidOrbProps = {
  children?: ReactNode;
  /** Base palette family. Defaults to `iridescent`. */
  colorScheme?: OrbColorScheme;
  /** Strength of the oil-film colour shift, 0–1. Default 0.85. */
  iridescence?: number;
  /** Surface wobble from the liquid simulation, 0–1. Default 0.4. */
  distortion?: number;
  /** Idle spin in radians per second, 0–3. Default 0.35. */
  rotationSpeed?: number;
  /** How strongly the cursor displaces the surface, 0–1. Default 0.6. */
  interactionStrength?: number;
  /** Orb radius as a fraction of the container's shorter side, 0.2–0.95. Default 0.78. */
  scale?: number;
  /** Render one static frame. Default false. */
  paused?: boolean;
  /** Honour `prefers-reduced-motion`. Default true. */
  respectReducedMotion?: boolean;
  /** Renderer resolution cap. Default `medium`. */
  quality?: OrbQuality;
  className?: string;
  style?: CSSProperties;
};

export type OrbQuality = "low" | "medium" | "high";
