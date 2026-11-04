import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { REFRACTION_LENS_FRAGMENT } from "../_shared/shaders/fieldShaders";
import type { VisualQuality } from "../_shared/types";

export type RefractionLensProps = {
  children?: ReactNode;
  /** Content magnification inside the lens, 0.5–4. Default 1.8. */
  magnification?: number;
  /** Lens diameter as a fraction of the container's shorter side, 0.1–1. Default 0.6. */
  lensRadius?: number;
  /** How strongly the lookup is bent, 0–1. Default 0.7. */
  refractionStrength?: number;
  /** Colour separation at the rim, 0–1. Default 0.35. */
  chromaticAberration?: number;
  /** Brightness of the lit rim, 0–1. Default 0.6. */
  edgeGlow?: number;
  /** Tint multiplied over the refracted content. Default near-white. */
  tint?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A draggable glass lens that magnifies and bends whatever sits behind it. The lens centre follows
 * the pointer, and the spherical height function produces real magnification falloff toward the
 * rim instead of a uniform zoom.
 */
export function RefractionLens({
  children,
  magnification,
  lensRadius,
  refractionStrength,
  chromaticAberration,
  edgeGlow,
  tint = "#F2F6FF",
  paused = false,
  quality = "medium",
  className,
  style,
}: RefractionLensProps) {
  return (
    <GlslVisual
      source={REFRACTION_LENS_FRAGMENT}
      uniforms={{
        uMagnification: numeric(magnification, 1.8, 0.5, 4),
        uLensRadius: numeric(lensRadius, 0.6, 0.1, 1),
        uRefraction: numeric(refractionStrength, 0.7, 0, 1),
        uChromatic: numeric(chromaticAberration, 0.35, 0, 1),
        uEdgeGlow: numeric(edgeGlow, 0.6, 0, 1),
        uTint: rgbTriple(tint, { r: 0.95, g: 0.97, b: 1 }),
      }}
      dataAttribute="data-cx-refraction-lens"
      backdrop="linear-gradient(135deg, #0a0f20 0%, #111a33 55%, #0a0f20 100%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
