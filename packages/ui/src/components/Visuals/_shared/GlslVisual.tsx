"use client";

import { useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import { VisualSurface } from "../../_internal/visuals/VisualSurface";
import { useVisualEngine } from "../../_internal/visuals/useVisualEngine";
import { GlslSurface, type GlslUniformValue } from "../../_internal/visuals/GlslSurface";

export type GlslVisualProps = {
  children?: ReactNode;
  paused?: boolean;
  quality?: "low" | "medium" | "high";
  className?: string;
  style?: CSSProperties;
  /** Fragment source for the active variant; changing it re-links the program. */
  source: string;
  uniforms: Record<string, GlslUniformValue>;
  dataAttribute: string;
  /** CSS backdrop painted under the canvas so a missing WebGL context is not a black box. */
  backdrop?: string;
  interactive?: boolean;
  minHeight?: number;
};

const DPR: Record<NonNullable<GlslVisualProps["quality"]>, number> = {
  low: 1,
  medium: 1.5,
  high: 2,
};

/**
 * Shared implementation for every fragment-shader effect: shader source plus a uniform map in,
 * canvas out. Components stay declarative and only own their prop-to-uniform mapping.
 */
export function GlslVisual({
  children,
  paused = false,
  quality = "medium",
  className,
  style,
  source,
  uniforms,
  dataAttribute,
  backdrop,
  interactive = true,
  minHeight = 280,
}: GlslVisualProps) {
  const create = useCallback(
    (container: HTMLElement, canvas: HTMLCanvasElement) =>
      new GlslSurface(container, canvas, source, uniforms, DPR[quality]),
    // Mount-only; source and uniforms are pushed by the update callback below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { containerRef, canvasRef } = useVisualEngine<GlslSurface>(create, (engine) => {
    engine.setSource(source);
    engine.setValues(uniforms);
    engine.setPaused(paused);
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
