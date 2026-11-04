"use client";

import { useEffect, useRef } from "react";
import { cx } from "../../utils/cx";
import {
  VortexEngine,
  sanitizeColors,
  clamp01,
  clampParticles,
  clampSpeed,
  clampRange,
  DEFAULT_PARTICLES,
} from "./vortexEngine";
import type { VortexProps } from "./types";
import styles from "./Vortex.module.css";

const DEFAULT_INTENSITY = 0.65;
const DEFAULT_PERSISTENCE = 0.7;

export function Vortex({
  children,
  particles = DEFAULT_PARTICLES,
  speed = 1,
  range = 1,
  colors,
  intensity = DEFAULT_INTENSITY,
  trailPersistence = DEFAULT_PERSISTENCE,
  quality = "medium",
  centerX = 0.5,
  centerY = 0.5,
  paused = false,
  className,
  style,
  respectReducedMotion = true,
}: VortexProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VortexEngine | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const engine = new VortexEngine(root, canvas, {
      particles: clampParticles(particles),
      speed: clampSpeed(speed),
      range: clampRange(range),
      colors: sanitizeColors(colors),
      intensity: clamp01(intensity),
      trailPersistence: clamp01(trailPersistence),
      quality,
      centerX: clamp01(centerX),
      centerY: clamp01(centerY),
      paused,
      respectReducedMotion,
    });
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
      particles: clampParticles(particles),
      speed: clampSpeed(speed),
      range: clampRange(range),
      colors: sanitizeColors(colors),
      intensity: clamp01(intensity),
      trailPersistence: clamp01(trailPersistence),
      quality,
      centerX: clamp01(centerX),
      centerY: clamp01(centerY),
      paused,
      respectReducedMotion,
    });
  }, [
    particles,
    speed,
    range,
    colors,
    intensity,
    trailPersistence,
    quality,
    centerX,
    centerY,
    paused,
    respectReducedMotion,
  ]);

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, className)}
      style={style}
      data-cx-vortex=""
      data-paused={paused ? "true" : undefined}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
