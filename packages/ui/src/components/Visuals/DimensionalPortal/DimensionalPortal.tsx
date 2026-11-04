import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { PORTAL_FRAGMENT } from "../_shared/shaders/materialShaders";
import type { VisualQuality } from "../_shared/types";

export type DimensionalPortalProps = {
  children?: ReactNode;
  /** Number of concentric rings, 1–7. Default 5. */
  ringCount?: number;
  /** Depth scaling of the rings, 0–1. Default 0.6. */
  portalDepth?: number;
  /** Rotation speed, 0–2. Default 0.6. */
  rotationSpeed?: number;
  /** Density of spiral particles, 0–1. Default 0.7. */
  particleDensity?: number;
  /** Rim brightness, 0–1. Default 0.6. */
  glowIntensity?: number;
  /** Hover/click activation boost, 0–1. Default 0. */
  activationEffect?: number;
  /** Interior core colour. Default deep blue. */
  coreColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Layered concentric portal: rings rotate in alternating directions and particles spiral through
 * them, with a warped core suggesting depth behind the opening.
 */
export function DimensionalPortal({
  children,
  ringCount,
  portalDepth,
  rotationSpeed,
  particleDensity,
  glowIntensity,
  activationEffect = 0,
  coreColor = "#0A1550",
  paused = false,
  quality = "medium",
  className,
  style,
}: DimensionalPortalProps) {
  return (
    <GlslVisual
      source={PORTAL_FRAGMENT}
      uniforms={{
        uRingCount: numeric(ringCount, 5, 1, 7),
        uPortalDepth: numeric(portalDepth, 0.6, 0, 1),
        uRotation: numeric(rotationSpeed, 0.6, 0, 2),
        uParticleDensity: numeric(particleDensity, 0.7, 0, 1),
        uGlow: numeric(glowIntensity, 0.6, 0, 1),
        uActivation: numeric(activationEffect, 0, 0, 1),
        uCore: rgbTriple(coreColor, { r: 0.04, g: 0.08, b: 0.31 }),
        uAccent: [0.13, 0.42, 1],
      }}
      dataAttribute="data-cx-portal"
      backdrop="radial-gradient(circle at 50% 50%, #060b20 0%, #02030a 72%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
