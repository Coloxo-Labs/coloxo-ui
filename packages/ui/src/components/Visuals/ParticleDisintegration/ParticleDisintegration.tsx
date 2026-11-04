import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { ParticleFieldEngine } from "../_shared/ParticleFieldEngine";
import type { VisualQuality } from "../_shared/types";

const BRAND_FALLBACK = { r: 0.14, g: 0.28, b: 1 };
const CYAN_FALLBACK = { r: 0.13, g: 0.83, b: 0.93 };

export type ParticleDisintegrationProps = {
  children?: ReactNode;
  /** Particle count, 50–4000. Default 900. */
  particleCount?: number;
  /** Scatter distance as a fraction of the container, 0–1. Default 0.7. */
  disintegrateAmount?: number;
  /** Continuous drift speed, 0–2. Default 0.5. */
  driftSpeed?: number;
  /** Particle radius in CSS pixels, 0.3–4. Default 1.1. */
  particleSize?: number;
  /** Opacity of the motion trail, 0–1. Default 0.6. */
  trailFade?: number;
  /** Particle colour. Default Coloxo blue. */
  color?: string;
  /** Outer glow colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

const COUNTS = { low: 320, medium: 900, high: 1800 } as const;

/**
 * A particle body that scatters apart and reforms. Particles chase displaced targets through a
 * spring, so the disintegration reads as physical rather than as random teleportation.
 */
export function ParticleDisintegration({
  children,
  particleCount,
  disintegrateAmount,
  driftSpeed,
  particleSize,
  trailFade,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: ParticleDisintegrationProps) {
  const config = {
    count: Math.round(numeric(particleCount, COUNTS[quality], 50, 4000)),
    from: "ring" as const,
    to: "scatter" as const,
    progress: numeric(disintegrateAmount, 0.7, 0, 1),
    size: numeric(particleSize, 1.1, 0.3, 4),
    color: rgbToCss(parseColor(color) ?? BRAND_FALLBACK, 0.9),
    accent: rgbToCss(parseColor(accentColor) ?? CYAN_FALLBACK, 0.5),
    trail: numeric(trailFade, 0.6, 0, 1),
    spread: 1,
    repelRadius: 90,
    repelForce: 26 * numeric(driftSpeed, 0.5, 0, 2),
    spin: numeric(driftSpeed, 0.5, 0, 2) * 0.2,
    seed: 1337,
  };

  return (
    <CanvasVisual<ParticleFieldEngine>
      dataAttribute="data-cx-particle-disintegration"
      backdrop="radial-gradient(circle at 50% 50%, #070d20 0%, #03040b 72%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new ParticleFieldEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
