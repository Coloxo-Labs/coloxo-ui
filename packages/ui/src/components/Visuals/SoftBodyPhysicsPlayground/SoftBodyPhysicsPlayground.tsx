import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { SoftBodyEngine } from "../_shared/SoftBodyEngine";
import type { VisualQuality } from "../_shared/types";

export type SoftBodyPhysicsPlaygroundProps = {
  children?: ReactNode;
  /** Grid points per side, 4–28. Default depends on `quality`. */
  meshResolution?: number;
  /** Spring stiffness, 0.1–1. Default 0.7. */
  stiffness?: number;
  /** Gravity multiplier, 0–3. Default 1. */
  gravity?: number;
  /** Pointer push radius in CSS pixels, 10–200. Default 70. */
  interactionRadius?: number;
  /** Velocity retention per step, 0.7–1. Default 0.98. */
  damping?: number;
  /** Draw the mesh wireframe. Default true. */
  wireframe?: boolean;
  /** Mesh colour. Default Coloxo blue. */
  color?: string;
  /** Node colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A verlet-integrated cloth membrane. Pressure, drag and release push the sheet around with real
 * constraint relaxation, so the deformation stays stable instead of exploding at high stiffness.
 */
export function SoftBodyPhysicsPlayground({
  children,
  meshResolution,
  stiffness,
  gravity,
  interactionRadius,
  damping,
  wireframe = true,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: SoftBodyPhysicsPlaygroundProps) {
  const res = { low: 8, medium: 14, high: 20 }[quality];
  const config = {
    resolution: Math.round(numeric(meshResolution, res, 4, 28)),
    stiffness: numeric(stiffness, 0.7, 0.1, 1),
    gravity: numeric(gravity, 1, 0, 3),
    pushRadius: numeric(interactionRadius, 70, 10, 200),
    damping: numeric(damping, 0.98, 0.7, 1),
    wireframe,
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 1),
    accent: rgbToCss(parseColor(accentColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 1),
  };

  return (
    <CanvasVisual<SoftBodyEngine>
      dataAttribute="data-cx-soft-body"
      backdrop="radial-gradient(circle at 50% 50%, #060b19 0%, #02030a 76%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new SoftBodyEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
