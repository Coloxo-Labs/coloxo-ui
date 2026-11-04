"use client";

import { useEffect, useRef } from "react";
import type { VisualEngine } from "./visualEngine";

type EngineFactory<E extends VisualEngine> = (
  container: HTMLElement,
  canvas: HTMLCanvasElement,
) => E;

/**
 * Creates an engine once per mount, keeps it in sync with `paused`, and disposes on unmount.
 *
 * `update` runs on every render after mount so prop changes reach the live engine without
 * rebuilding it. Engines are intentionally not recreated when props change: recreating a WebGL
 * context on every slider tick would exhaust the browser's context budget.
 */
export function useVisualEngine<E extends VisualEngine>(
  create: EngineFactory<E>,
  update?: (engine: E) => void,
): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<E | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const engine = create(container, canvas);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Mount-only: `create` is a fresh closure each render by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (engine) update?.(engine);
  });

  return { containerRef, canvasRef };
}
