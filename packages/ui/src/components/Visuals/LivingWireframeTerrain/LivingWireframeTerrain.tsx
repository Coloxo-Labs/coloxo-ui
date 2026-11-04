import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { TERRAIN_FRAGMENT } from "../_shared/shaders/scienceShaders";
import type { VisualQuality } from "../_shared/types";

export type LivingWireframeTerrainProps = {
  children?: ReactNode;
  /** Terrain relief, 0–1. Default 0.45. */
  waveAmplitude?: number;
  /** Noise frequency. Lower values give broad hills, 0.3–3. Default 1. */
  noiseScale?: number;
  /** Radius of the pointer-driven hill, 0.05–0.6. Default 0.22. */
  interactionRadius?: number;
  /** Camera pitch, 0.5–1.4. Default 1. */
  cameraAngle?: number;
  /** Wire colour. Default Coloxo blue. */
  wireframeColor?: string;
  /** Grid resolution hint, 0.5–2. Higher draws a denser mesh. Default 1. */
  gridResolution?: number;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A perspective height field with a moving grid. Height is offset in screen space so peaks visibly
 * rise, and grid lines fade with distance to imply depth without a depth buffer.
 */
export function LivingWireframeTerrain({
  children,
  waveAmplitude,
  noiseScale,
  interactionRadius,
  cameraAngle,
  wireframeColor = "#3D6BFF",
  gridResolution,
  paused = false,
  quality = "medium",
  className,
  style,
}: LivingWireframeTerrainProps) {
  return (
    <GlslVisual
      source={TERRAIN_FRAGMENT}
      uniforms={{
        uAmplitude: numeric(waveAmplitude, 0.45, 0, 1) * 1.6,
        uNoiseScale: numeric(noiseScale, 1, 0.3, 3) * numeric(gridResolution, 1, 0.5, 2),
        uInteractionRadius: numeric(interactionRadius, 0.22, 0.05, 0.6),
        uCameraAngle: numeric(cameraAngle, 1, 0.5, 1.4),
        uWireColor: rgbTriple(wireframeColor, { r: 0.24, g: 0.42, b: 1 }),
        uFillColor: [0.03, 0.05, 0.12],
      }}
      dataAttribute="data-cx-terrain"
      backdrop="linear-gradient(180deg, #05080f 0%, #0a1226 55%, #05080f 100%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
