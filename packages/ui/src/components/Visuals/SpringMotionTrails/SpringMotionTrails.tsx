import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { SpringTrailEngine } from "../_shared/SpringTrailEngine";
import type { VisualQuality } from "../_shared/types";

export type SpringMotionTrailsProps = {
  children?: ReactNode;
  /** Number of trailing nodes, 4–80. Default 24. */
  trailLength?: number;
  /** Spring stiffness, 0.05–1. Higher snaps faster. Default 0.35. */
  stiffness?: number;
  /** Damping, 0–1. Lower overshoots and wobbles. Default 0.6. */
  damping?: number;
  /** Node radius in CSS pixels, 0.5–8. Default 2.4. */
  nodeSize?: number;
  /** Lead colour. Default Coloxo blue. */
  color?: string;
  /** Tail colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A pointer-following trail built from real spring physics. The head springs toward the cursor and
 * each following node springs toward the one ahead of it, producing natural whip and settle.
 */
export function SpringMotionTrails({
  children,
  trailLength,
  stiffness,
  damping,
  nodeSize,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: SpringMotionTrailsProps) {
  const length = { low: 14, medium: 24, high: 36 }[quality];
  const config = {
    trailLength: Math.round(numeric(trailLength, length, 4, 80)),
    stiffness: numeric(stiffness, 0.35, 0.05, 1),
    damping: numeric(damping, 0.6, 0, 1),
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 1),
    accent: rgbToCss(parseColor(accentColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 1),
    nodeSize: numeric(nodeSize, 2.4, 0.5, 8),
  };

  return (
    <CanvasVisual<SpringTrailEngine>
      dataAttribute="data-cx-spring-trails"
      backdrop="radial-gradient(circle at 50% 50%, #060a18 0%, #02030a 75%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new SpringTrailEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
