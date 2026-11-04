import type { CSSProperties, ReactNode } from "react";
import { numeric } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { LIQUID_METAL_FRAGMENT } from "../_shared/shaders/materialShaders";
import { facetIndex } from "../_shared/facets";
import type { VisualQuality } from "../_shared/types";

export const METAL_SHAPES = ["sphere", "capsule", "torus"] as const;
export type MetalShape = (typeof METAL_SHAPES)[number];

export type LiquidMetalMorphProps = {
  children?: ReactNode;
  /** Target form. Default `torus`. */
  shape?: MetalShape;
  /** How far the morph has progressed toward `shape`, 0–1. Default 0.6. */
  morphSpeed?: number;
  /** Specular reflectivity, 0–1. Default 0.9. */
  metalness?: number;
  /** Scatter of the reflection, 0–1. Default 0.15. */
  roughness?: number;
  /** Pointer pull on the silhouette, 0–1. Default 0.5. */
  cursorInfluence?: number;
  /** Brightness of the environment reflection, 0–1.5. Default 1. */
  reflectionIntensity?: number;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A reflective metal blob that morphs between a sphere, capsule and torus. The silhouette comes
 * from a signed distance field evaluated per pixel, so the pointer can stretch it without any
 * geometry buffers; shading uses a normal derived from the SDF gradient.
 */
export function LiquidMetalMorph({
  children,
  shape = "torus",
  morphSpeed,
  metalness,
  roughness,
  cursorInfluence,
  reflectionIntensity,
  paused = false,
  quality = "medium",
  className,
  style,
}: LiquidMetalMorphProps) {
  return (
    <GlslVisual
      source={LIQUID_METAL_FRAGMENT}
      uniforms={{
        uShape: facetIndex(METAL_SHAPES, shape, 2),
        uMorph: numeric(morphSpeed, 0.6, 0, 1),
        uMetalness: numeric(metalness, 0.9, 0, 1),
        uRoughness: numeric(roughness, 0.15, 0, 1),
        uCursorInfluence: numeric(cursorInfluence, 0.5, 0, 1),
        uReflection: numeric(reflectionIntensity, 1, 0, 1.5),
      }}
      dataAttribute="data-cx-liquid-metal"
      backdrop="radial-gradient(circle at 50% 45%, #161a22 0%, #08090d 70%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
