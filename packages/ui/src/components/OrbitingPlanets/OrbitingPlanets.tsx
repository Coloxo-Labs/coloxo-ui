"use client";

import { useEffect, useRef } from "react";
import { cx } from "../../utils/cx";
import {
  OrbitingPlanetsEngine,
  clamp01,
  clampSpeed,
  clampCentralSize,
  normalizePlanets,
  DEFAULT_BG,
  DEFAULT_CENTRAL,
  DEFAULT_ORBIT,
} from "./orbitingPlanetsEngine";
import type { OrbitingPlanetsProps } from "./types";
import styles from "./OrbitingPlanets.module.css";

export function OrbitingPlanets({
  children,
  centralColor = DEFAULT_CENTRAL,
  centralSize = 0.92,
  planets,
  showOrbitPaths = true,
  orbitColor = DEFAULT_ORBIT,
  orbitOpacity = 0.55,
  backgroundColor = DEFAULT_BG,
  transparent = true,
  speed = 1,
  lightingIntensity = 0.78,
  glowIntensity = 0.85,
  interaction = false,
  interactionStrength = 0.35,
  quality = "medium",
  paused = false,
  respectReducedMotion = true,
  fallback = "static",
  className,
  style,
}: OrbitingPlanetsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<OrbitingPlanetsEngine | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const engine = new OrbitingPlanetsEngine(
      root,
      canvas,
      {
        centralColor,
        centralSize: clampCentralSize(centralSize),
        planets: normalizePlanets(planets),
        showOrbitPaths,
        orbitColor,
        orbitOpacity: clamp01(orbitOpacity),
        backgroundColor,
        transparent,
        speed: clampSpeed(speed),
        lightingIntensity: clamp01(lightingIntensity),
        glowIntensity: clamp01(glowIntensity),
        interaction,
        interactionStrength: clamp01(interactionStrength),
        quality,
        paused,
        respectReducedMotion,
        fallback,
      },
      fallbackRef.current,
    );
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setOptions({
      centralColor,
      centralSize: clampCentralSize(centralSize),
      planets: normalizePlanets(planets),
      showOrbitPaths,
      orbitColor,
      orbitOpacity: clamp01(orbitOpacity),
      backgroundColor,
      transparent,
      speed: clampSpeed(speed),
      lightingIntensity: clamp01(lightingIntensity),
      glowIntensity: clamp01(glowIntensity),
      interaction,
      interactionStrength: clamp01(interactionStrength),
      quality,
      paused,
      respectReducedMotion,
      fallback,
    });
  }, [
    centralColor,
    centralSize,
    planets,
    showOrbitPaths,
    orbitColor,
    orbitOpacity,
    backgroundColor,
    transparent,
    speed,
    lightingIntensity,
    glowIntensity,
    interaction,
    interactionStrength,
    quality,
    paused,
    respectReducedMotion,
    fallback,
  ]);

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, className)}
      style={style}
      data-cx-orbiting-planets=""
      data-paused={paused ? "true" : undefined}
      data-interaction={interaction ? "true" : undefined}
    >
      <div ref={fallbackRef} className={styles.fallback} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
