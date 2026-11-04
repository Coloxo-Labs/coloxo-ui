"use client";

import { useEffect, useRef } from "react";
import { cx } from "../../utils/cx";
import { FluidEngine, sanitizeColors, clamp01 } from "./fluidEngine";
import type { FluidBackgroundProps } from "./types";
import styles from "./FluidBackground.module.css";

const DEFAULT_INTENSITY = 0.7;
const DEFAULT_PERSISTENCE = 0.65;

export function FluidBackground({
  children,
  colors,
  trigger = "hover",
  intensity = DEFAULT_INTENSITY,
  trailPersistence = DEFAULT_PERSISTENCE,
  quality = "medium",
  disabled = false,
  transparent = true,
  className,
  style,
  respectReducedMotion = true,
}: FluidBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FluidEngine | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const engine = new FluidEngine(root, canvas, {
      colors: sanitizeColors(colors),
      intensity: clamp01(intensity),
      trailPersistence: clamp01(trailPersistence),
      quality,
      transparent,
      disabled,
      respectReducedMotion,
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mount once; options sync in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setOptions({
      colors: sanitizeColors(colors),
      intensity: clamp01(intensity),
      trailPersistence: clamp01(trailPersistence),
      quality,
      transparent,
      disabled,
      respectReducedMotion,
    });
  }, [
    colors,
    intensity,
    trailPersistence,
    quality,
    transparent,
    disabled,
    respectReducedMotion,
    trigger,
  ]);

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, className)}
      style={style}
      data-cx-fluid-background=""
      data-trigger={trigger}
      data-disabled={disabled ? "true" : undefined}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
