import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { SelfDrawingGeometryEngine, type GeometryKind } from "../_shared/SelfDrawingGeometryEngine";
import { facetIndex } from "../_shared/facets";
import type { VisualQuality } from "../_shared/types";

export const GEOMETRY_SHAPES = ["circle", "triangle", "hexagon", "star", "spiral"] as const;
export type GeometryShape = (typeof GEOMETRY_SHAPES)[number];

const KINDS: readonly GeometryKind[] = ["circle", "triangle", "hexagon", "star", "spiral"];

export type SelfDrawingGeometryProps = {
  children?: ReactNode;
  /** Shape to draw. Default `hexagon`. */
  shape?: GeometryShape;
  /** Fixed draw progress, 0–1. `0` lets the shape draw itself on a loop. Default 0. */
  progress?: number;
  /** Line width in CSS pixels, 0.5–6. Default 1.6. */
  strokeWidth?: number;
  /** Vertex count for polygonal shapes, 3–24. Default 6. */
  sides?: number;
  /** Whether the path continuously redraws. Default true. */
  loop?: boolean;
  /** Stroke colour. Default Coloxo blue. */
  color?: string;
  /** Glow colour. Default cyan. */
  glowColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Geometry that draws itself along its own path, measured in arc length so the pen moves at a
 * constant visual speed. Pointer movement adds a slight magnetic offset.
 */
export function SelfDrawingGeometry({
  children,
  shape = "hexagon",
  progress,
  strokeWidth,
  sides,
  loop = true,
  color = "#2348FF",
  glowColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: SelfDrawingGeometryProps) {
  const config = {
    kind: KINDS[facetIndex(GEOMETRY_SHAPES, shape, 2)] ?? "hexagon",
    progress: numeric(progress, 0, 0, 1),
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 1),
    accent: rgbToCss(parseColor(glowColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 0.6),
    lineWidth: numeric(strokeWidth, 1.6, 0.5, 6),
    loop,
    sides: Math.round(numeric(sides, 6, 3, 24)),
  };

  return (
    <CanvasVisual<SelfDrawingGeometryEngine>
      dataAttribute="data-cx-self-drawing"
      backdrop="radial-gradient(circle at 50% 50%, #060b19 0%, #02030a 75%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new SelfDrawingGeometryEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
