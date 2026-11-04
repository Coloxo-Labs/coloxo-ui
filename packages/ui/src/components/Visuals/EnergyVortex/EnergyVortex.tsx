import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { EnergyVortexEngine } from "../_shared/EnergyVortexEngine";
import type { VisualQuality } from "../_shared/types";

export type EnergyVortexProps = {
  children?: ReactNode;
  /** Particle count, 100–3000. Default 700. */
  particleCount?: number;
  /** Rotation speed, 0–2. Default 0.8. */
  rotationSpeed?: number;
  /** Inward pull, 0–1. Default 0.55. */
  vortexIntensity?: number;
  /** Trail persistence, 0–1. Default 0.75. */
  trailPersistence?: number;
  /** Particle radius in CSS pixels, 0.3–4. Default 1.3. */
  particleSize?: number;
  /** Primary colour. Default Coloxo blue. */
  color?: string;
  /** Secondary colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

const COUNTS = { low: 260, medium: 700, high: 1400 } as const;

/**
 * A spiral energy vortex with differential rotation: inner particles complete orbits faster than
 * outer ones, which is what reads as a whirlpool rather than a spinning disc.
 */
export function EnergyVortex({
  children,
  particleCount,
  rotationSpeed,
  vortexIntensity,
  trailPersistence,
  particleSize,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: EnergyVortexProps) {
  const config = {
    count: Math.round(numeric(particleCount, COUNTS[quality], 100, 3000)),
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 0.9),
    accent: rgbToCss(parseColor(accentColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 0.85),
    speed: numeric(rotationSpeed, 0.8, 0, 2),
    intensity: numeric(vortexIntensity, 0.55, 0, 1),
    trail: numeric(trailPersistence, 0.75, 0, 1),
    particleSize: numeric(particleSize, 1.3, 0.3, 4),
  };

  return (
    <CanvasVisual<EnergyVortexEngine>
      dataAttribute="data-cx-energy-vortex"
      backdrop="radial-gradient(circle at 50% 50%, #070c1e 0%, #02030a 72%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new EnergyVortexEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
