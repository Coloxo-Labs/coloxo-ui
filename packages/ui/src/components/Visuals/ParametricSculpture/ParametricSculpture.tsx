import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { ParametricSculptureEngine } from "../_shared/ParametricSculptureEngine";
import type { VisualQuality } from "../_shared/types";

export const SCULPTURE_VARIANTS = ["knot", "bottle", "blob"] as const;
export type SculptureVariant = (typeof SCULPTURE_VARIANTS)[number];

export type ParametricSculptureProps = {
  children?: ReactNode;
  /** Surface form. Default `knot`. */
  variant?: SculptureVariant;
  /** Grid resolution, 8–48. Default depends on `quality`. */
  resolution?: number;
  /** Deformation amount, 0–1. Default 0.5. */
  deformation?: number;
  /** Animation speed, 0–2. Default 0.6. */
  speed?: number;
  /** Wireframe line width, 0.3–3. Default 0.8. */
  lineWidth?: number;
  /** Draw full wireframe instead of horizontal rings only. Default true. */
  wireframe?: boolean;
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

const VARIANT_INDEX: Record<SculptureVariant, number> = { knot: 0, bottle: 1, blob: 2 };

/**
 * A parametric surface rendered as a depth-sorted wireframe. Sampling on a UV grid and sorting
 * segments gives correct occlusion without a depth buffer or a 3D library.
 */
export function ParametricSculpture({
  children,
  variant = "knot",
  resolution,
  deformation,
  speed,
  lineWidth,
  wireframe = true,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: ParametricSculptureProps) {
  const res = { low: 12, medium: 20, high: 30 }[quality];
  const config = {
    resolution: Math.round(numeric(resolution, res, 8, 48)),
    variant: VARIANT_INDEX[variant] ?? 0,
    amplitude: numeric(deformation, 0.5, 0, 1),
    speed: numeric(speed, 0.6, 0, 2),
    lineWidth: numeric(lineWidth, 0.8, 0.3, 3),
    wireframe,
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 1),
    accent: rgbToCss(parseColor(accentColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 1),
  };

  return (
    <CanvasVisual<ParametricSculptureEngine>
      dataAttribute="data-cx-parametric-sculpture"
      backdrop="radial-gradient(circle at 50% 45%, #070c1d 0%, #02030a 75%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new ParametricSculptureEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
