import type { CSSProperties, ReactNode } from "react";
import { numeric } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { FIELD_DISTORTION_FRAGMENT } from "../_shared/shaders/fieldShaders";
import { facetIndex } from "../_shared/facets";
import type { VisualQuality } from "../_shared/types";

export const DISTORTION_TYPES = ["liquid", "heat-haze", "wave", "lens"] as const;
export type DistortionType = (typeof DISTORTION_TYPES)[number];

export type InteractiveFieldDistortionProps = {
  children?: ReactNode;
  /** Preset shape of the displacement. Default `liquid`. */
  type?: DistortionType;
  /** Displacement magnitude, 0–1. Default 0.6. */
  strength?: number;
  /** Radius of influence in normalized units, 0.05–0.8. Default 0.28. */
  radius?: number;
  /** How fast the field settles after the pointer moves, 0–1. Default 0.4. */
  decay?: number;
  /** Blend between the undistorted and distorted scene, 0–1. Default 1. */
  blend?: number;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A distortion field that spreads across the whole surface rather than acting as a single lens.
 * Each preset changes the displacement vector function, so liquid, heat-haze, wave and lens modes
 * share one program instead of four.
 */
export function InteractiveFieldDistortion({
  children,
  type = "liquid",
  strength,
  radius,
  decay,
  blend,
  paused = false,
  quality = "medium",
  className,
  style,
}: InteractiveFieldDistortionProps) {
  return (
    <GlslVisual
      source={FIELD_DISTORTION_FRAGMENT}
      uniforms={{
        uType: facetIndex(DISTORTION_TYPES, type, 0),
        uStrength: numeric(strength, 0.6, 0, 1),
        uRadius: numeric(radius, 0.28, 0.05, 0.8),
        uDecay: numeric(decay, 0.4, 0, 1),
        uBlend: numeric(blend, 1, 0, 1),
      }}
      dataAttribute="data-cx-field-distortion"
      backdrop="linear-gradient(160deg, #070b18 0%, #101a38 60%, #070b18 100%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
