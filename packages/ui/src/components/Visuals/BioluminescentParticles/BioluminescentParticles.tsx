import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { BIOLUMINESCENCE_FRAGMENT } from "../_shared/shaders/atmosphereShaders";
import type { VisualQuality } from "../_shared/types";

export type BioluminescentParticlesProps = {
  children?: ReactNode;
  /** Grid density multiplier, 4 to 40. Default 12. */
  density?: number;
  /** Glow radius, 0.05 to 1. Default 0.35. */
  glowRadius?: number;
  /** Drift speed, 0 to 1.5. Default 0.4. */
  driftSpeed?: number;
  /** Hue rotation across the palette, 0 to 1. Default 0. */
  hueShift?: number;
  /** Overall glow gain, 0 to 3. Default 1.4. */
  bloom?: number;
  /** Primary organism colour. Default cyan. */
  colorA?: string;
  /** Secondary organism colour. Default Coloxo blue. */
  colorB?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Bioluminescent organisms drifting in dark water. Each glowing point is computed from a jittered
 * grid with a per-cell seed, so density scales without any particle buffer or CPU loop.
 */
export function BioluminescentParticles({
  children,
  density,
  glowRadius,
  driftSpeed,
  hueShift,
  bloom,
  colorA = "#22D3EE",
  colorB = "#2348FF",
  paused = false,
  quality = "medium",
  className,
  style,
}: BioluminescentParticlesProps) {
  return (
    <GlslVisual
      source={BIOLUMINESCENCE_FRAGMENT}
      uniforms={{
        uDensity: numeric(density, 12, 4, 40),
        uGlowRadius: numeric(glowRadius, 0.35, 0.05, 1),
        uDriftSpeed: numeric(driftSpeed, 0.4, 0, 1.5),
        uHueShift: numeric(hueShift, 0, 0, 1),
        uBloom: numeric(bloom, 1.4, 0, 3),
        uColorA: rgbTriple(colorA, { r: 0.13, g: 0.83, b: 0.93 }),
        uColorB: rgbTriple(colorB, { r: 0.14, g: 0.28, b: 1 }),
      }}
      dataAttribute="data-cx-bioluminescence"
      backdrop="radial-gradient(circle at 50% 55%, #04101c 0%, #01040a 78%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
