import type { CSSProperties, ReactNode } from "react";
import { numeric } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { GLITCH_FRAGMENT } from "../_shared/shaders/materialShaders";
import type { VisualQuality } from "../_shared/types";

export type GlitchTrigger = "hover" | "always" | "click";

export type SpatialGlitchDistortionProps = {
  children?: ReactNode;
  /** Base glitch energy, 0–1. Default 0.4. */
  glitchIntensity?: number;
  /** Number of horizontal slices, 4–64. Default 20. */
  sliceCount?: number;
  /** RGB channel separation, 0–1. Default 0.5. */
  rgbShift?: number;
  /** When the effect fires. Default `hover`. */
  trigger?: GlitchTrigger;
  /** Slice direction. Default `horizontal`. */
  orientation?: "horizontal" | "vertical";
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A sliced, RGB-separated glitch field. Slices are anonymous per-frame bands rather than DOM
 * elements, so the effect costs one draw call regardless of slice count.
 */
export function SpatialGlitchDistortion({
  children,
  glitchIntensity,
  sliceCount,
  rgbShift,
  trigger = "hover",
  orientation = "horizontal",
  paused = false,
  quality = "medium",
  className,
  style,
}: SpatialGlitchDistortionProps) {
  const burst = trigger === "always" ? 1 : 0;
  return (
    <GlslVisual
      source={GLITCH_FRAGMENT}
      uniforms={{
        uIntensity: numeric(glitchIntensity, 0.4, 0, 1),
        uSlices: numeric(sliceCount, 20, 4, 64),
        uRgbShift: numeric(rgbShift, 0.5, 0, 1),
        uBurst: burst,
        uDuration: 1,
        uVertical: orientation === "vertical" ? 1 : 0,
        uAmount: 0,
      }}
      dataAttribute="data-cx-glitch"
      backdrop="linear-gradient(150deg, #070a16 0%, #0f1730 60%, #070a16 100%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
