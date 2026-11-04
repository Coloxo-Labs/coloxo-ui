import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { GyroscopicCoreEngine } from "../_shared/GyroscopicCoreEngine";
import type { VisualQuality } from "../_shared/types";

export type GyroscopicCoreProps = {
  children?: ReactNode;
  /** Number of rings, 2–10. Default 4. */
  ringCount?: number;
  /** Rotation speed, 0–2. Default 0.7. */
  rotationSpeed?: number;
  /** Line width in CSS pixels, 0.5–4. Default 1.2. */
  lineWidth?: number;
  /** Whether rings precess on a second axis. Default true. */
  precession?: boolean;
  /** Segments per ring, 24–160. Default 72. */
  segments?: number;
  /** Primary ring colour. Default Coloxo blue. */
  color?: string;
  /** Alternate ring colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Nested gyroscope rings projected from 3D. Segments are depth-sorted before drawing so back arcs
 * correctly render behind front arcs, and depth drives opacity for atmospheric falloff.
 */
export function GyroscopicCore({
  children,
  ringCount,
  rotationSpeed,
  lineWidth,
  precession = true,
  segments,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: GyroscopicCoreProps) {
  const segmentCount = { low: 40, medium: 72, high: 110 }[quality];
  const config = {
    ringCount: Math.round(numeric(ringCount, 4, 2, 10)),
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 1),
    accent: rgbToCss(parseColor(accentColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 1),
    speed: numeric(rotationSpeed, 0.7, 0, 2),
    lineWidth: numeric(lineWidth, 1.2, 0.5, 4),
    precession,
    segments: Math.round(numeric(segments, segmentCount, 24, 160)),
  };

  return (
    <CanvasVisual<GyroscopicCoreEngine>
      dataAttribute="data-cx-gyroscopic-core"
      backdrop="radial-gradient(circle at 50% 50%, #070c1d 0%, #02030a 75%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new GyroscopicCoreEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
