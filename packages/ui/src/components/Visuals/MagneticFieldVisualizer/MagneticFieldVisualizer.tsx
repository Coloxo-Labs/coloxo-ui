import type { CSSProperties, ReactNode } from "react";
import { numeric } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { MAGNETIC_FIELD_FRAGMENT } from "../_shared/shaders/scienceShaders";
import type { VisualQuality } from "../_shared/types";

export type MagneticPolarity = "attract" | "repel";
export type MagneticColorMode = "duotone" | "brand" | "mono";

export type MagneticFieldVisualizerProps = {
  children?: ReactNode;
  /** Number of poles, 2–3. Default 2. */
  poleCount?: 2 | 3;
  /** Field line curvature strength, 0–1. Default 0.6. */
  fieldStrength?: number;
  /** Contour density, 1–8. Default 4. */
  lineDensity?: number;
  /** How fast the field advects, 0–1. Default 0.5. */
  particleSpeed?: number;
  /** Pole orientation. Default `attract`. */
  polarity?: MagneticPolarity;
  /** Colour mapping for the field. Default `brand`. */
  colorMode?: MagneticColorMode;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

const COLOR_MODES: Record<MagneticColorMode, { a: [number, number, number]; b: [number, number, number] }> = {
  duotone: { a: [0.14, 0.28, 1], b: [0.13, 0.83, 0.93] },
  brand: { a: [0.09, 0.2, 0.85], b: [0.35, 0.55, 1] },
  mono: { a: [0.55, 0.6, 0.7], b: [0.92, 0.95, 1] },
};

/**
 * Magnetic field lines traced from dipole sources. Contours are drawn where an accumulating
 * potential crosses a band, so lines stay continuous and evenly spaced as the poles move.
 */
export function MagneticFieldVisualizer({
  children,
  poleCount = 2,
  fieldStrength,
  lineDensity,
  particleSpeed,
  polarity = "attract",
  colorMode = "brand",
  paused = false,
  quality = "medium",
  className,
  style,
}: MagneticFieldVisualizerProps) {
  const palette = COLOR_MODES[colorMode] ?? COLOR_MODES.brand;
  return (
    <GlslVisual
      source={MAGNETIC_FIELD_FRAGMENT}
      uniforms={{
        uPoleCount: poleCount,
        uFieldStrength: numeric(fieldStrength, 0.6, 0, 1) * 2.4,
        uLineDensity: numeric(lineDensity, 4, 1, 8),
        uParticleSpeed: numeric(particleSpeed, 0.5, 0, 1),
        uPolarity: polarity === "repel" ? -1 : 1,
        uColorA: palette.a,
        uColorB: palette.b,
      }}
      dataAttribute="data-cx-magnetic-field"
      backdrop="radial-gradient(circle at 50% 50%, #0a1128 0%, #04060f 75%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
