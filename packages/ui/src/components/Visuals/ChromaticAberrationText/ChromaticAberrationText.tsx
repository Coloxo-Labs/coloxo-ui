import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { CHROMATIC_TEXT_FRAGMENT } from "../_shared/shaders/atmosphereShaders";
import type { VisualQuality } from "../_shared/types";

export type ChromaticAberrationTextProps = {
  children?: ReactNode;
  /** Channel separation strength, 0 to 3. Default 1. */
  offset?: number;
  /** Animation speed, 0 to 2. Default 0.7. */
  speed?: number;
  /** Glyph width as a fraction of the frame, 0.05 to 0.5. Default 0.28. */
  fill?: number;
  /** Edge softness, 0 to 1. Default 0.2. */
  blur?: number;
  /** Scanline opacity, 0 to 1. Default 0.3. */
  scanlines?: number;
  /** Red channel tint. Default Coloxo blue. */
  colorA?: string;
  /** Green channel tint. Default white. */
  colorB?: string;
  /** Blue channel tint. Default cyan. */
  colorC?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Chromatic aberration on a bold block glyph. Each colour channel samples the mask at a different
 * horizontal offset driven by a travelling wave, so the fringing breathes instead of sitting static.
 */
export function ChromaticAberrationText({
  children,
  offset,
  speed,
  fill,
  blur,
  scanlines,
  colorA = "#2348FF",
  colorB = "#FFFFFF",
  colorC = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: ChromaticAberrationTextProps) {
  return (
    <GlslVisual
      source={CHROMATIC_TEXT_FRAGMENT}
      uniforms={{
        uOffset: numeric(offset, 1, 0, 3),
        uSpeed: numeric(speed, 0.7, 0, 2),
        uFill: numeric(fill, 0.28, 0.05, 0.5),
        uBlur: numeric(blur, 0.2, 0, 1),
        uScanlines: numeric(scanlines, 0.3, 0, 1),
        uColorA: rgbTriple(colorA, { r: 0.14, g: 0.28, b: 1 }),
        uColorB: rgbTriple(colorB, { r: 1, g: 1, b: 1 }),
        uColorC: rgbTriple(colorC, { r: 0.13, g: 0.83, b: 0.93 }),
      }}
      dataAttribute="data-cx-chromatic-text"
      backdrop="radial-gradient(circle at 50% 50%, #080d1e 0%, #02030a 76%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
