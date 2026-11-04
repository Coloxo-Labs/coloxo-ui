import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { FORCE_FIELD_FRAGMENT } from "../_shared/shaders/scienceShaders";
import type { VisualQuality } from "../_shared/types";

export type ForceFieldMembraneProps = {
  children?: ReactNode;
  /** Membrane sphere radius, 0.15–0.95. Default 0.8. */
  membraneRadius?: number;
  /** Wave travel speed, 0.1–3. Default 1. */
  waveSpeed?: number;
  /** Peak opacity of the membrane, 0–1. Default 0.75. */
  opacity?: number;
  /** Deformation depth, 0–1. Default 0.55. */
  distortionStrength?: number;
  /** How quickly disturbances settle, 0–1. Default 0.5. */
  decay?: number;
  /** Membrane colour. Default cyan. */
  surfaceColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A translucent shell that deforms toward the pointer. Shading uses the displaced normal, so
 * brightness and opacity track the actual deformation rather than a flat overlay.
 */
export function ForceFieldMembrane({
  children,
  membraneRadius,
  waveSpeed,
  opacity,
  distortionStrength,
  decay,
  surfaceColor = "#4CD8F0",
  paused = false,
  quality = "medium",
  className,
  style,
}: ForceFieldMembraneProps) {
  return (
    <GlslVisual
      source={FORCE_FIELD_FRAGMENT}
      uniforms={{
        uRadius: numeric(membraneRadius, 0.8, 0.15, 0.95),
        uWaveSpeed: numeric(waveSpeed, 1, 0.1, 3),
        uOpacity: numeric(opacity, 0.75, 0, 1),
        uDistortion: numeric(distortionStrength, 0.55, 0, 1),
        uDecay: numeric(decay, 0.5, 0, 1),
        uSurface: rgbTriple(surfaceColor, { r: 0.3, g: 0.85, b: 0.94 }),
      }}
      dataAttribute="data-cx-force-field"
      backdrop="radial-gradient(circle at 50% 50%, #071320 0%, #03070d 75%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
