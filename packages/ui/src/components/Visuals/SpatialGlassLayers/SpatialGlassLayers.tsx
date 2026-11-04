import type { CSSProperties, ReactNode } from "react";
import { numeric, parseColor, rgbToCss } from "../../_internal/visuals/color";
import { CanvasVisual } from "../_shared/CanvasVisual";
import { SpatialGlassLayersEngine } from "../_shared/SpatialGlassLayersEngine";
import type { VisualQuality } from "../_shared/types";

export type SpatialGlassLayersProps = {
  children?: ReactNode;
  /** Number of stacked panes, 2–12. Default 5. */
  layerCount?: number;
  /** Parallax response to the pointer, 0–1. Default 0.6. */
  parallaxStrength?: number;
  /** Pane corner radius as a fraction of pane size, 0–0.5. Default 0.12. */
  cornerRadius?: number;
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
 * Translucent panes stacked in depth. Each pane is offset by depth × parallax, so pointer movement
 * separates the layers and communicates spatial position rather than just sliding an image.
 */
export function SpatialGlassLayers({
  children,
  layerCount,
  parallaxStrength,
  cornerRadius,
  color = "#2348FF",
  accentColor = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: SpatialGlassLayersProps) {
  const config = {
    layerCount: Math.round(numeric(layerCount, { low: 3, medium: 5, high: 8 }[quality], 2, 12)),
    parallax: numeric(parallaxStrength, 0.6, 0, 1),
    radius: numeric(cornerRadius, 0.12, 0, 0.5),
    color: rgbToCss(parseColor(color) ?? { r: 0.14, g: 0.28, b: 1 }, 1),
    accent: rgbToCss(parseColor(accentColor) ?? { r: 0.13, g: 0.83, b: 0.93 }, 1),
  };

  return (
    <CanvasVisual<SpatialGlassLayersEngine>
      dataAttribute="data-cx-spatial-glass"
      backdrop="linear-gradient(160deg, #070b1a 0%, #0c1530 55%, #05070f 100%)"
      paused={paused}
      className={className}
      style={style}
      create={(container, canvas) => new SpatialGlassLayersEngine(container, canvas, config)}
      update={(engine) => engine.setConfig(config)}
    >
      {children}
    </CanvasVisual>
  );
}
