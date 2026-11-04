export type VisualQuality = "low" | "medium" | "high";

export type VisualPoint = { x: number; y: number };

/** The props every visual effect shares. */
export type VisualBaseProps = {
  /** Render a single static frame. Default false. */
  paused?: boolean;
  /** Honour `prefers-reduced-motion` by rendering a static frame. Default true. */
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: import("react").CSSProperties;
};

export const BRAND: [number, number, number] = [0.137, 0.282, 1];
export const CYAN: [number, number, number] = [0.133, 0.827, 0.933];
export const VIOLET: [number, number, number] = [0.545, 0.361, 0.965];
export const INK: [number, number, number] = [0.039, 0.047, 0.09];
