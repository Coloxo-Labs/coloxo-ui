import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { AURORA_MESH_FRAGMENT } from "../_shared/shaders/atmosphereShaders";
import type { VisualQuality } from "../_shared/types";

export type AuroraMeshGradientProps = {
  children?: ReactNode;
  /** Spread of each colour blob, 0.4 to 2. Default 1. */
  blobScale?: number;
  /** Drift speed, 0 to 1.5. Default 0.35. */
  speed?: number;
  /** Softness of each blob edge, 0 to 1. Default 0.65. */
  softness?: number;
  /** Film grain, 0 to 0.2. Default 0.035. */
  grain?: number;
  /** First colour. Default Coloxo blue. */
  colorA?: string;
  /** Second colour. Default violet. */
  colorB?: string;
  /** Third colour. Default cyan. */
  colorC?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Multi-blob mesh gradient. Three colour fields drift on independent orbits and are normalised
 * against their combined weight, which avoids the muddy grey overlap that plain additive blending
 * produces. One blob follows the pointer so the surface feels alive.
 */
export function AuroraMeshGradient({
  children,
  blobScale,
  speed,
  softness,
  grain,
  colorA = "#2348FF",
  colorB = "#7C3AED",
  colorC = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: AuroraMeshGradientProps) {
  return (
    <GlslVisual
      source={AURORA_MESH_FRAGMENT}
      uniforms={{
        uColorA: rgbTriple(colorA, { r: 0.14, g: 0.28, b: 1 }),
        uColorB: rgbTriple(colorB, { r: 0.49, g: 0.23, b: 0.93 }),
        uColorC: rgbTriple(colorC, { r: 0.13, g: 0.83, b: 0.93 }),
        uBlobScale: numeric(blobScale, 1, 0.4, 2),
        uSpeed: numeric(speed, 0.35, 0, 1.5),
        uSoftness: numeric(softness, 0.65, 0, 1),
        uGrain: numeric(grain, 0.035, 0, 0.2),
      }}
      dataAttribute="data-cx-aurora-mesh"
      backdrop="linear-gradient(160deg, #060a18 0%, #0a1028 60%, #04060f 100%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
