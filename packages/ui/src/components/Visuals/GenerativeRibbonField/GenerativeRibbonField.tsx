import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { RibbonFieldEngine } from "../_shared/RibbonFieldEngine";
import type { VisualQuality } from "../_shared/types";

export type GenerativeRibbonFieldProps = {
  children?: ReactNode;
  /** Number of ribbons, 3–40. Default 14. */
  ribbonCount?: number;
  /** Wave amplitude in CSS pixels, 0–120. Default 42. */
  waveAmplitude?: number;
  /** Forward scroll speed, 0–2. Default 0.6. */
  flowSpeed?: number;
  /** Stroke width in CSS pixels, 0.5–8. Default 1.6. */
  ribbonThickness?: number;
  /** How strongly ribbons bend toward the pointer, 0–1. Default 0.5. */
  pointerAttraction?: number;
  /** Draw ribbons as filled bands rather than lines. Default false. */
  filled?: boolean;
  /** Primary colour. Default Coloxo blue. */
  color?: string;
  /** Secondary colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

const FALLBACK_A = { r: 0.14, g: 0.28, b: 1 };
const FALLBACK_B = { r: 0.13, g: 0.83, b: 0.93 };

/**
 * Generative ribbon field. Each ribbon samples two out-of-phase waves, so the bands cross and
 * braid instead of running in parallel.
 */
export function GenerativeRibbonField({
  children,
  ribbonCount,
  waveAmplitude,
  flowSpeed,
  ribbonThickness,
  pointerAttraction,
  filled = false,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: GenerativeRibbonFieldProps) {
  const density = { low: 8, medium: 14, high: 22 }[quality];
  const config = {
    ribbonCount: Math.round(numeric(ribbonCount, density, 3, 40)),
    color: rgbToCss(parseColor(color) ?? FALLBACK_A, 0.85),
    accent: rgbToCss(parseColor(accentColor) ?? FALLBACK_B, 0.75),
    amplitude: numeric(waveAmplitude, 42, 0, 120),
    speed: numeric(flowSpeed, 0.6, 0, 2),
    thickness: numeric(ribbonThickness, 1.6, 0.5, 8),
    attraction: numeric(pointerAttraction, 0.5, 0, 1),
    filled,
  };

  return (
    <CanvasVisual<RibbonFieldEngine>
      dataAttribute="data-cx-ribbon-field"
      backdrop="linear-gradient(165deg, #050816 0%, #0a1230 55%, #04060f 100%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new RibbonFieldEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
