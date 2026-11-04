"use client";

import { useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import { VisualSurface } from "../../_internal/visuals/VisualSurface";
import { useVisualEngine } from "../../_internal/visuals/useVisualEngine";
import type { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";

export type CanvasVisualProps<E extends Canvas2DEngine> = {
  children?: ReactNode;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
  dataAttribute: string;
  backdrop?: string;
  interactive?: boolean;
  minHeight?: number;
  create: (container: HTMLElement, canvas: HTMLCanvasElement) => E;
  update?: (engine: E) => void;
};

/** Dom shell + lifecycle wiring for Canvas 2D effects. */
export function CanvasVisual<E extends Canvas2DEngine>({
  children,
  paused = false,
  className,
  style,
  dataAttribute,
  backdrop,
  interactive = true,
  minHeight = 280,
  create,
  update,
}: CanvasVisualProps<E>) {
  const factory = useCallback(
    (container: HTMLElement, canvas: HTMLCanvasElement) => create(container, canvas),
    // Mount-only: engines must not be recreated when props change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { containerRef, canvasRef } = useVisualEngine<E>(factory, (engine) => {
    engine.setPaused(paused);
    update?.(engine);
  });

  return (
    <VisualSurface
      containerRef={containerRef}
      canvasRef={canvasRef}
      className={className}
      style={{ minHeight, background: backdrop, ...style }}
      interactive={interactive}
      dataAttribute={dataAttribute}
    >
      {children}
    </VisualSurface>
  );
}
