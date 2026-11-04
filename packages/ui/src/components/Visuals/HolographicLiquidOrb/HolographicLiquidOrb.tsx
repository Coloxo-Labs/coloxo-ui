"use client";

import { useCallback, useMemo } from "react";
import { cx } from "../../../utils/cx";
import { VisualSurface } from "../../_internal/visuals/VisualSurface";
import { useVisualEngine } from "../../_internal/visuals/useVisualEngine";
import { OrbEngine, orbOptions } from "./orbEngine";
import type { HolographicLiquidOrbProps } from "./types";
import styles from "./HolographicLiquidOrb.module.css";

/**
 * A floating sphere with shifting oil-film reflections. The iridescence is generated in the
 * fragment shader from two interfering flow fields, so the colour banding stays continuous at any
 * size instead of tiling like a texture would.
 */
export function HolographicLiquidOrb({
  children,
  colorScheme = "iridescent",
  iridescence,
  distortion,
  rotationSpeed,
  interactionStrength,
  scale,
  paused = false,
  respectReducedMotion = true,
  quality = "medium",
  className,
  style,
}: HolographicLiquidOrbProps) {
  const options = useMemo(
    () => orbOptions({ iridescence, distortion, rotationSpeed, interactionStrength, scale, quality, paused }),
    [iridescence, distortion, rotationSpeed, interactionStrength, scale, quality, paused],
  );

  const create = useCallback(
    (container: HTMLElement, canvas: HTMLCanvasElement) =>
      new OrbEngine(container, canvas, options, colorScheme),
    // Mount-only: options are pushed through `update` below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { containerRef, canvasRef } = useVisualEngine<OrbEngine>(create, (engine) =>
    engine.setOptions(options, colorScheme),
  );

  return (
    <VisualSurface
      containerRef={containerRef}
      canvasRef={canvasRef}
      className={cx(styles.root, className)}
      style={style}
      interactive
      dataAttribute="data-cx-holographic-orb"
      label={undefined}
    >
      {children}
    </VisualSurface>
  );
}
