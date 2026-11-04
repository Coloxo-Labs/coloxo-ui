import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { KINETIC_GRID_FRAGMENT } from "../_shared/shaders/atmosphereShaders";
import type { VisualQuality } from "../_shared/types";

export type KineticGridWarpProps = {
  children?: ReactNode;
  /** Grid cell count across the frame, 4 to 40. Default 14. */
  gridSize?: number;
  /** Wave distortion strength, 0 to 3. Default 1. */
  warpStrength?: number;
  /** Scroll speed, 0 to 2. Default 0.5. */
  speed?: number;
  /** Line thickness, 0.005 to 0.2. Default 0.04. */
  lineWidth?: number;
  /** Perspective squeeze toward the horizon, 0.2 to 2. Default 1. */
  perspective?: number;
  /** Line colour. Default Coloxo blue. */
  lineColor?: string;
  /** Accent and pointer glow colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A perspective grid that warps under travelling waves and dips into a gravity well at the
 * pointer. A second offset grid drifts against the first to create moire depth.
 */
export function KineticGridWarp({
  children,
  gridSize,
  warpStrength,
  speed,
  lineWidth,
  perspective,
  lineColor = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: KineticGridWarpProps) {
  return (
    <GlslVisual
      source={KINETIC_GRID_FRAGMENT}
      uniforms={{
        uGridSize: numeric(gridSize, 14, 4, 40),
        uWarpStrength: numeric(warpStrength, 1, 0, 3),
        uSpeed: numeric(speed, 0.5, 0, 2),
        uLineWidth: numeric(lineWidth, 0.04, 0.005, 0.2),
        uPerspective: numeric(perspective, 1, 0.2, 2),
        uLineColor: rgbTriple(lineColor, { r: 0.14, g: 0.28, b: 1 }),
        uAccentColor: rgbTriple(accentColor, { r: 0.13, g: 0.83, b: 0.93 }),
      }}
      dataAttribute="data-cx-kinetic-grid"
      backdrop="radial-gradient(circle at 50% 45%, #070c1e 0%, #02030a 76%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
