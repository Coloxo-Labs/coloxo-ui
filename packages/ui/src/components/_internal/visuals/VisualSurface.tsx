"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { cx } from "../../../utils/cx";
import styles from "./visualSurface.module.css";

export type VisualSurfaceProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Exposes an interaction affordance (crosshair) and enables pointer events on the canvas. */
  interactive?: boolean;
  /** `data-*` attribute prefix used by tests and CSS to identify the effect. */
  dataAttribute?: string;
  label?: string;
  fallback?: ReactNode;
};

/**
 * The DOM shell every visual effect shares: a positioned, clipped container with the canvas
 * behind and children above. Keeping this in one place is what makes each effect component a thin
 * prop-clamping wrapper rather than another copy of the same markup.
 */
export function VisualSurface({
  containerRef,
  canvasRef,
  children,
  className,
  style,
  interactive = false,
  dataAttribute,
  label,
  fallback,
}: VisualSurfaceProps) {
  const dataProps = dataAttribute ? { [dataAttribute]: "" } : {};
  return (
    <div
      ref={containerRef}
      className={cx(styles.surface, className)}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      {...dataProps}
    >
      <canvas
        ref={canvasRef}
        className={cx(styles.canvas, interactive ? styles.canvasInteractive : styles.canvasPassive)}
        aria-hidden="true"
      />
      {fallback}
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
