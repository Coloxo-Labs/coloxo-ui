import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";

export type GeometryKind = "circle" | "triangle" | "hexagon" | "star" | "spiral";

export type GeometryConfig = {
  kind: GeometryKind;
  /** Draw progress 0..1 — the shape is revealed along its path. */
  progress: number;
  color: string;
  accent: string;
  /** Line width in CSS pixels. */
  lineWidth: number;
  /** Whether the path loops back and redraws. */
  loop: boolean;
  /** Side count / point count for polygonal shapes. */
  sides: number;
};

/** Point path for each shape, normalized to a unit radius around the origin. */
function pathFor(kind: GeometryKind, sides: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const n = Math.max(3, Math.min(24, Math.round(sides)));

  switch (kind) {
    case "triangle":
      for (let i = 0; i <= 3; i += 1) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        points.push({ x: Math.cos(a), y: Math.sin(a) });
      }
      break;
    case "hexagon":
      for (let i = 0; i <= n; i += 1) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        points.push({ x: Math.cos(a), y: Math.sin(a) });
      }
      break;
    case "star":
      for (let i = 0; i <= n * 2; i += 1) {
        const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 1 : 0.45;
        points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      break;
    case "spiral":
      for (let i = 0; i <= 240; i += 1) {
        const t = i / 240;
        const a = t * Math.PI * 6;
        points.push({ x: Math.cos(a) * t, y: Math.sin(a) * t });
      }
      break;
    default:
      for (let i = 0; i <= 128; i += 1) {
        const a = (i / 128) * Math.PI * 2;
        points.push({ x: Math.cos(a), y: Math.sin(a) });
      }
  }
  return points;
}

/** Total polyline length, used to reveal the path proportionally rather than per-segment. */
function pathLength(points: { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;
    total += Math.hypot(curr.x - prev.x, curr.y - prev.y);
  }
  return total;
}

/**
 * Geometry that draws itself along its own path. Reveal is measured in arc length, so lines grow at
 * a constant visual speed regardless of segment density.
 */
export class SelfDrawingGeometryEngine extends Canvas2DEngine {
  private config: GeometryConfig;
  private auto = 0;
  private lastKind = "";

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: GeometryConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: GeometryConfig): void {
    this.config = config;
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;

    if (config.progress > 0) {
      this.auto = config.progress;
    } else if (config.loop) {
      this.auto = (this.auto + frame.dt * 0.22) % 1.4;
    } else {
      this.auto = Math.min(1, this.auto + frame.dt * 0.22);
    }

    const key = `${config.kind}|${config.sides}`;
    if (key !== this.lastKind) {
      this.lastKind = key;
      this.auto = 0;
    }

    const { width, height } = frame;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.34;

    ctx.clearRect(0, 0, width, height);

    const points = pathFor(config.kind, config.sides);
    const total = pathLength(points);
    const reveal = Math.min(1, this.auto) * total;

    // Pointer acts as a subtle magnet, pulling the drawing toward it.
    const pullX = (frame.pointer.x - 0.5) * 14;
    const pullY = (frame.pointer.y - 0.5) * 14;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Glow underlay.
    ctx.strokeStyle = config.accent;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = config.lineWidth * 3;
    this.strokeRevealed(ctx, points, reveal, cx + pullX, cy + pullY, radius);

    ctx.strokeStyle = config.color;
    ctx.globalAlpha = 1;
    ctx.lineWidth = config.lineWidth;
    const head = this.strokeRevealed(ctx, points, reveal, cx + pullX, cy + pullY, radius);

    // Travelling head with a soft halo.
    if (head) {
      const halo = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 26);
      halo.addColorStop(0, "rgba(255,255,255,0.95)");
      halo.addColorStop(0.35, config.accent);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vertex dots mark the shape's joints once the path completes.
    if (this.auto >= 1) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = config.accent;
      for (const point of points) {
        if (Math.hypot(point.x, point.y) < 0.4) continue;
        ctx.beginPath();
        ctx.arc(cx + pullX + point.x * radius, cy + pullY + point.y * radius, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  /** Strokes the first `reveal` units of arc length; returns the current pen position. */
  private strokeRevealed(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    reveal: number,
    cx: number,
    cy: number,
    radius: number,
  ): { x: number; y: number } | null {
    if (reveal <= 0 || points.length === 0) return null;
    ctx.beginPath();
    const first = points[0];
    if (!first) return null;
    ctx.moveTo(cx + first.x * radius, cy + first.y * radius);

    let travelled = 0;
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      if (!prev || !curr) continue;
      const segment = Math.hypot(curr.x - prev.x, curr.y - prev.y) / 1;
      if (travelled + segment <= reveal) {
        ctx.lineTo(cx + curr.x * radius, cy + curr.y * radius);
        travelled += segment;
      } else {
        const remaining = reveal - travelled;
        const t = segment === 0 ? 0 : remaining / segment;
        const x = cx + (prev.x + (curr.x - prev.x) * t) * radius;
        const y = cy + (prev.y + (curr.y - prev.y) * t) * radius;
        ctx.lineTo(x, y);
        ctx.stroke();
        return { x, y };
      }
    }
    ctx.stroke();
    const last = points[points.length - 1];
    return last ? { x: cx + last.x * radius, y: cy + last.y * radius } : null;
  }
}
