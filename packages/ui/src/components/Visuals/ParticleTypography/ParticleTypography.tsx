import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { ParticleTypographyEngine } from "../_shared/ParticleTypographyEngine";
import type { VisualQuality } from "../_shared/types";

export type ParticleTypographyProps = {
  children?: ReactNode;
  /** Text the particles assemble into. Default `Coloxo`. */
  text?: string;
  /** Particle count, 200–8000. Default 2200. */
  particleCount?: number;
  /** Dispersion from the glyph silhouette, 0–1. Default 0. */
  scatter?: number;
  /** Pointer repulsion strength in pixels, 0–60. Default 20. */
  repelForce?: number;
  /** Font stack used to rasterise the glyphs. */
  fontFamily?: string;
  /** Particle colour. Default white. */
  color?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

const COUNTS = { low: 900, medium: 2200, high: 4200 } as const;

/**
 * Particles that assemble into live text. Glyph coverage is sampled from a canvas at runtime, so
 * any string or font works without a bundled per-letter point model.
 */
export function ParticleTypography({
  children,
  text = "Coloxo",
  particleCount,
  scatter,
  repelForce,
  fontFamily = "system-ui, sans-serif",
  color = "#EAF0FF",
  paused = false,
  quality = "medium",
  className,
  style,
}: ParticleTypographyProps) {
  const config = {
    text,
    count: Math.round(numeric(particleCount, COUNTS[quality], 200, 8000)),
    color: rgbToCss(parseColor(color) ?? { r: 0.92, g: 0.94, b: 1 }, 0.95),
    scatter: numeric(scatter, 0, 0, 1),
    repelForce: numeric(repelForce, 20, 0, 60),
    font: `600 {size}px ${fontFamily}`,
    seed: 909,
  };

  return (
    <CanvasVisual<ParticleTypographyEngine>
      dataAttribute="data-cx-particle-typography"
      backdrop="radial-gradient(circle at 50% 50%, #060a17 0%, #020308 75%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new ParticleTypographyEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
