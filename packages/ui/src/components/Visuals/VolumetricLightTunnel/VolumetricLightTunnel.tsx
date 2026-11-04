import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { LIGHT_TUNNEL_FRAGMENT } from "../_shared/shaders/materialShaders";
import type { VisualQuality } from "../_shared/types";

export type VolumetricLightTunnelProps = {
  children?: ReactNode;
  /** Number of radial beams, 3–16. Default 7. */
  beamCount?: number;
  /** Apparent tunnel depth, 0.2–3. Default 1.4. */
  depth?: number;
  /** Forward travel speed, 0–2. Default 0.8. */
  travelSpeed?: number;
  /** Bloom strength, 0–1. Default 0.5. */
  bloomStrength?: number;
  /** How far the camera sways with the pointer, 0–1. Default 0.5. */
  cameraMotion?: number;
  /** Near colour. Default Coloxo blue. */
  paletteA?: string;
  /** Far colour. Default cyan. */
  paletteB?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Beams receding into a tunnel. Depth is faked by layering scaled, rotated beam fields with
 * distance-based falloff, which gives parallax and fog without any post-processing pass.
 */
export function VolumetricLightTunnel({
  children,
  beamCount,
  depth,
  travelSpeed,
  bloomStrength,
  cameraMotion,
  paletteA = "#2348FF",
  paletteB = "#22D3EE",
  paused = false,
  quality = "medium",
  className,
  style,
}: VolumetricLightTunnelProps) {
  return (
    <GlslVisual
      source={LIGHT_TUNNEL_FRAGMENT}
      uniforms={{
        uBeamCount: numeric(beamCount, 7, 3, 16),
        uDepth: numeric(depth, 1.4, 0.2, 3),
        uTravel: numeric(travelSpeed, 0.8, 0, 2),
        uBloom: numeric(bloomStrength, 0.5, 0, 1),
        uCameraMotion: numeric(cameraMotion, 0.5, 0, 1),
        uPaletteA: rgbTriple(paletteA, { r: 0.14, g: 0.28, b: 1 }),
        uPaletteB: rgbTriple(paletteB, { r: 0.13, g: 0.83, b: 0.93 }),
      }}
      dataAttribute="data-cx-light-tunnel"
      backdrop="radial-gradient(circle at 50% 50%, #0a1230 0%, #02030a 75%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
