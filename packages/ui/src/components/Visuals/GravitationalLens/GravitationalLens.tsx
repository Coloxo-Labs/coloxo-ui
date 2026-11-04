import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { GRAVITATIONAL_LENS_FRAGMENT } from "../_shared/shaders/fieldShaders";
import { BRAND, type VisualPoint, type VisualQuality } from "../_shared/types";

export type GravitationalLensProps = {
  children?: ReactNode;
  /** Pull of each mass, 0–1. Default 0.6. */
  gravityStrength?: number;
  /** Edge length of the brightest core, in normalized units. Default 0.12. */
  lensRadius?: number;
  /** Gravitational centre as normalized coordinates. Default `{ x: 0.5, y: 0.5 }`. */
  centerPosition?: VisualPoint;
  /** Persistence of the light streaks, 0–1. Default 0.7. */
  trailLength?: number;
  /** Streak colour, any CSS colour. Default Coloxo blue. */
  color?: string;
  /** Number of masses: `1` for a single well, `2` for an orbiting pair. Default 2. */
  massCount?: 1 | 2;
  /** Whether the paired mass attracts or pushes. Ignored when `massCount` is 1. Default true. */
  attract?: boolean;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Light streaks bent around invisible masses. The deflection is evaluated per pixel against the
 * mass centres, so moving the pointer genuinely changes the field rather than panning an image.
 */
export function GravitationalLens({
  children,
  gravityStrength,
  lensRadius,
  centerPosition,
  trailLength,
  color = "#2348FF",
  massCount = 2,
  attract = true,
  paused = false,
  quality = "medium",
  className,
  style,
}: GravitationalLensProps) {
  const rgb = rgbTriple(color, { r: BRAND[0], g: BRAND[1], b: BRAND[2] });
  return (
    <GlslVisual
      source={GRAVITATIONAL_LENS_FRAGMENT}
      uniforms={{
        uGravity: numeric(gravityStrength, 0.6, 0, 1) * 2.2,
        uLensRadius: numeric(lensRadius, 0.12, 0.01, 0.6),
        uCenter: [
          numeric(centerPosition?.x, 0.5, 0, 1),
          numeric(centerPosition?.y, 0.5, 0, 1),
        ],
        uTrail: numeric(trailLength, 0.7, 0, 1),
        uColor: rgb,
        uPoles: massCount === 1 ? 1 : 2,
        uRepel: attract ? 1 : -1,
      }}
      dataAttribute="data-cx-gravitational-lens"
      backdrop="radial-gradient(circle at 50% 50%, #0b1226 0%, #05070f 70%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
