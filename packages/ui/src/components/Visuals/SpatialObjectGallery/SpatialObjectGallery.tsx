import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { ObjectGalleryEngine, type ObjectKind } from "../_shared/ObjectGalleryEngine";
import type { VisualQuality } from "../_shared/types";

export type SpatialObjectGalleryProps = {
  children?: ReactNode;
  /** Objects to place in the ring, in order. Default cube, sphere, torus. */
  objects?: ObjectKind[];
  /** Orbit speed, 0–1.5. Default 0.4. */
  orbitSpeed?: number;
  /** Pointer parallax strength, 0–2. Default 0.8. */
  pointerParallax?: number;
  /** Edge width, 0.3–3. Default 1. */
  lineWidth?: number;
  /** Index of the object to keep highlighted, or -1 for none. Default -1. */
  highlightedIndex?: number;
  /** Edge colour. Default Coloxo blue. */
  color?: string;
  /** Highlight colour. Default cyan. */
  accentColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A rotating gallery of 3D primitives. Objects are depth-sorted as whole units so nearer ones
 * overlap farther ones correctly, and hovering an object lifts its opacity and stroke weight.
 */
export function SpatialObjectGallery({
  children,
  objects = ["cube", "sphere", "torus"],
  orbitSpeed,
  pointerParallax,
  lineWidth,
  highlightedIndex = -1,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: SpatialObjectGalleryProps) {
  const config = {
    kinds: objects.length > 0 ? objects : (["cube", "sphere", "torus"] as ObjectKind[]),
    speed: numeric(orbitSpeed, 0.4, 0, 1.5),
    parallax: numeric(pointerParallax, 0.8, 0, 2),
    lineWidth: numeric(lineWidth, 1, 0.3, 3),
    focus: Number.isFinite(highlightedIndex) ? highlightedIndex : -1,
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 1),
    accent: rgbToCss(parseColor(accentColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 1),
  };

  return (
    <CanvasVisual<ObjectGalleryEngine>
      dataAttribute="data-cx-object-gallery"
      backdrop="radial-gradient(circle at 50% 50%, #070c1c 0%, #02030a 76%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new ObjectGalleryEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
