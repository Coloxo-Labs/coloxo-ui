import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { ParticleFieldEngine } from "../_shared/ParticleFieldEngine";
import { facetIndex } from "../_shared/facets";
import type { VisualQuality } from "../_shared/types";

export const PARTICLE_SHAPES = ["ring", "grid", "spiral", "wave", "scatter"] as const;
export type ParticleShape = (typeof PARTICLE_SHAPES)[number];
type ShapeKind = ParticleShape;

const SHAPE_KINDS: readonly ShapeKind[] = ["ring", "grid", "spiral", "wave", "scatter"];

export type ParticleShapeTransitionProps = {
  children?: ReactNode;
  /** Starting arrangement. Default `ring`. */
  fromShape?: ParticleShape;
  /** Target arrangement. Default `spiral`. */
  toShape?: ParticleShape;
  /** Transition progress toward `toShape`, 0–1. Default 0.6. */
  progress?: number;
  /** Particle count, 50–4000. Default 800. */
  particleCount?: number;
  /** Particle radius in CSS pixels, 0.3–4. Default 1.2. */
  particleSize?: number;
  /** How strongly the pointer pushes particles away, 0–60. Default 24. */
  repelForce?: number;
  /** Particle colour. Default Coloxo blue. */
  color?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

const COUNTS = { low: 300, medium: 800, high: 1600 } as const;
const FALLBACK = { r: 0.14, g: 0.28, b: 1 };

/**
 * Particles morph between sampled arrangements. Both shapes are sampled once at build time, and
 * each particle springs between its two targets, so transitions stay coherent under pointer
 * interaction instead of restarting.
 */
export function ParticleShapeTransition({
  children,
  fromShape = "ring",
  toShape = "spiral",
  progress,
  particleCount,
  particleSize,
  repelForce,
  color = "#2348FF",
  paused = false,
  quality = "medium",
  className,
  style,
}: ParticleShapeTransitionProps) {
  const rgb = rgbToCss(parseColor(color) ?? FALLBACK, 0.9);
  const config = {
    count: Math.round(numeric(particleCount, COUNTS[quality], 50, 4000)),
    from: SHAPE_KINDS[facetIndex(PARTICLE_SHAPES, fromShape, 0)] ?? "ring",
    to: SHAPE_KINDS[facetIndex(PARTICLE_SHAPES, toShape, 2)] ?? "spiral",
    progress: numeric(progress, 0.6, 0, 1),
    size: numeric(particleSize, 1.2, 0.3, 4),
    color: rgb,
    accent: "rgba(34, 211, 238, 0.55)",
    trail: 0.45,
    spread: 1,
    repelRadius: 110,
    repelForce: numeric(repelForce, 24, 0, 60),
    spin: 0.12,
    seed: 4242,
  };

  return (
    <CanvasVisual<ParticleFieldEngine>
      dataAttribute="data-cx-particle-shape"
      backdrop="radial-gradient(circle at 50% 45%, #060b1c 0%, #03040a 72%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new ParticleFieldEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
