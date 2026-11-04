import type { CSSProperties, ReactNode } from "react";

export type OrbitingPlanetsQuality = "low" | "medium" | "high";

export type OrbitingPlanetConfig = {
  id: string;
  /** Relative sphere scale. Clamped 0.05–0.45. */
  size: number;
  color: string;
  /** Orbit radius in scene units. Clamped 0.35–2.2. */
  orbitRadius: number;
  /** Base orbital speed (rad/s). Clamped 0.05–2. */
  orbitSpeed: number;
  /** Orbit plane inclination (radians). Clamped ±π/2. */
  inclination: number;
  /** Initial orbital phase (radians). */
  phase: number;
  direction?: "clockwise" | "counterclockwise";
  /** Emissive / halo boost. Clamped 0–1. */
  glow?: number;
};

export type OrbitingPlanetsProps = {
  children?: ReactNode;
  /** Central planet color. Default ice cyan. */
  centralColor?: string;
  /** Central planet size. Clamped 0.35–1.2. Default 0.92. */
  centralSize?: number;
  /** Orbiting bodies. Defaults to a curated pastel set of 6. Max 16. */
  planets?: OrbitingPlanetConfig[];
  /** Draw luminous elliptical orbit paths. Default true. */
  showOrbitPaths?: boolean;
  /** Orbit path color. */
  orbitColor?: string;
  /** Orbit path opacity 0–1. Default 0.55. */
  orbitOpacity?: number;
  /** Clear color when `transparent` is false. Default `#050816`. */
  backgroundColor?: string;
  /** Alpha-cleared canvas so the parent owns the background. Default true. */
  transparent?: boolean;
  /** Global orbital speed multiplier. Clamped 0.1–3. Default 1. */
  speed?: number;
  /** Lighting strength 0–1. Default 0.78. */
  lightingIntensity?: number;
  /** Global halo / bloom strength 0–1. Default 0.85. */
  glowIntensity?: number;
  /** Subtle camera parallax. Default false. */
  interaction?: boolean;
  /** Parallax strength 0–1. Default 0.35. */
  interactionStrength?: number;
  quality?: OrbitingPlanetsQuality;
  paused?: boolean;
  respectReducedMotion?: boolean;
  /** Used when WebGL is unavailable. Default `static`. */
  fallback?: "static";
  className?: string;
  style?: CSSProperties;
};
