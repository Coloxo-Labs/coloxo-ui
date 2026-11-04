"use client";

import { useEffect, useRef } from "react";
import { cx } from "../../utils/cx";
import {
  WaveEngine,
  sanitizeColors,
  clamp01,
  clampSpeed,
  clampFrequency,
  clampRadius,
  clampDecay,
  DEFAULT_BG,
} from "./waveEngine";
import type { WaveBackgroundProps } from "./types";
import styles from "./WaveBackground.module.css";

export function WaveBackground({
  children,
  colors,
  backgroundColor = DEFAULT_BG,
  speed = 1,
  amplitude = 0.45,
  frequency = 1,
  complexity = 0.55,
  intensity = 0.7,
  interaction = true,
  interactionStrength = 0.65,
  interactionRadius = 0.22,
  interactionDecay = 0.55,
  quality = "medium",
  fallback = "static",
  paused = false,
  respectReducedMotion = true,
  transparent = true,
  className,
  style,
}: WaveBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<WaveEngine | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const engine = new WaveEngine(
      root,
      canvas,
      {
        colors: sanitizeColors(colors),
        backgroundColor,
        speed: clampSpeed(speed),
        amplitude: clamp01(amplitude),
        frequency: clampFrequency(frequency),
        complexity: clamp01(complexity),
        intensity: clamp01(intensity),
        interaction,
        interactionStrength: clamp01(interactionStrength),
        interactionRadius: clampRadius(interactionRadius),
        interactionDecay: clampDecay(interactionDecay),
        quality,
        fallback,
        paused,
        respectReducedMotion,
        transparent,
      },
      fallbackRef.current,
    );
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mount once; options sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setOptions({
      colors: sanitizeColors(colors),
      backgroundColor,
      speed: clampSpeed(speed),
      amplitude: clamp01(amplitude),
      frequency: clampFrequency(frequency),
      complexity: clamp01(complexity),
      intensity: clamp01(intensity),
      interaction,
      interactionStrength: clamp01(interactionStrength),
      interactionRadius: clampRadius(interactionRadius),
      interactionDecay: clampDecay(interactionDecay),
      quality,
      fallback,
      paused,
      respectReducedMotion,
      transparent,
    });
  }, [
    colors,
    backgroundColor,
    speed,
    amplitude,
    frequency,
    complexity,
    intensity,
    interaction,
    interactionStrength,
    interactionRadius,
    interactionDecay,
    quality,
    fallback,
    paused,
    respectReducedMotion,
    transparent,
  ]);

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, className)}
      style={style}
      data-cx-wave-background=""
      data-paused={paused ? "true" : undefined}
      data-interaction={interaction ? undefined : "false"}
    >
      <div ref={fallbackRef} className={styles.fallback} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
