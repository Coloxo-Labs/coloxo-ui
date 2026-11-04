import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { GLASS_CUBE_FRAGMENT } from "../_shared/shaders/materialShaders";
import type { VisualQuality } from "../_shared/types";

export type RefractiveGlassCubeProps = {
  children?: ReactNode;
  /** Index of refraction, 1–2.4. Default 1.5. */
  ior?: number;
  /** How much the background shows through the faces, 0–1. Default 0.8. */
  transmission?: number;
  /** Apparent wall thickness, 0–1. Default 0.5. */
  thickness?: number;
  /** Surface roughness, 0–1. Default 0.08. */
  roughness?: number;
  /** Pointer tilt response, 0–1. Default 0.6. */
  rotationSensitivity?: number;
  /** Interior gradient colour. Default Coloxo blue. */
  interiorColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * An axonometric glass cube. Each visible face is shaded with Fresnel-weighted transmission and a
 * refraction-bent environment lookup, which produces believable glass without a raytracer.
 */
export function RefractiveGlassCube({
  children,
  ior,
  transmission,
  thickness,
  roughness,
  rotationSensitivity,
  interiorColor = "#2348FF",
  paused = false,
  quality = "medium",
  className,
  style,
}: RefractiveGlassCubeProps) {
  return (
    <GlslVisual
      source={GLASS_CUBE_FRAGMENT}
      uniforms={{
        uIor: numeric(ior, 1.5, 1, 2.4),
        uTransmission: numeric(transmission, 0.8, 0, 1),
        uThickness: numeric(thickness, 0.5, 0, 1),
        uRoughness: numeric(roughness, 0.08, 0, 1),
        uRotationSensitivity: numeric(rotationSensitivity, 0.6, 0, 1),
        uInterior: rgbTriple(interiorColor, { r: 0.14, g: 0.28, b: 1 }),
        uRim: [0.6, 0.78, 1],
      }}
      dataAttribute="data-cx-glass-cube"
      backdrop="radial-gradient(circle at 50% 42%, #0d1428 0%, #05070f 72%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
