import type { CSSProperties, ReactNode } from "react";
import { numeric } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { RIPPLE_FIELD_FRAGMENT } from "../_shared/shaders/scienceShaders";
import { facetIndex } from "../_shared/facets";
import type { VisualQuality } from "../_shared/types";

export const RIPPLE_MODES = ["water", "glass", "energy"] as const;
export type RippleMode = (typeof RIPPLE_MODES)[number];

export type InteractiveRippleFieldProps = {
  children?: ReactNode;
  /** Crest height, 0–1. Default 0.5. */
  waveAmplitude?: number;
  /** Propagation speed, 0.1–3. Default 1. */
  waveSpeed?: number;
  /** Ring frequency, 1–10. Default 4. */
  rippleFrequency?: number;
  /** How fast ripples fade with distance, 0–1. Default 0.4. */
  decay?: number;
  /** Preset appearance. Default `water`. */
  mode?: RippleMode;
  /** Background distortion from passing waves, 0–1. Default 0.5. */
  distortion?: number;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * Concentric waves around the pointer. Crest normals are derived from the wave derivative, so
 * rings catch light instead of painting flat bands.
 */
export function InteractiveRippleField({
  children,
  waveAmplitude,
  waveSpeed,
  rippleFrequency,
  decay,
  mode = "water",
  distortion,
  paused = false,
  quality = "medium",
  className,
  style,
}: InteractiveRippleFieldProps) {
  return (
    <GlslVisual
      source={RIPPLE_FIELD_FRAGMENT}
      uniforms={{
        uAmplitude: numeric(waveAmplitude, 0.5, 0, 1),
        uWaveSpeed: numeric(waveSpeed, 1, 0.1, 3),
        uFrequency: numeric(rippleFrequency, 4, 1, 10),
        uDecay: numeric(decay, 0.4, 0, 1),
        uMode: facetIndex(RIPPLE_MODES, mode, 0),
        uDistortion: numeric(distortion, 0.5, 0, 1),
        uClickPulse: 0,
      }}
      dataAttribute="data-cx-ripple-field"
      backdrop="linear-gradient(180deg, #05101c 0%, #081a2e 60%, #040a12 100%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
