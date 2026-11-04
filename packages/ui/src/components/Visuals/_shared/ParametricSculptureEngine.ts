import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import { project, rotate, vec3, type Vec3 } from "../_shared/projection";

export type SculptureConfig = {
  /** Grid resolution of the parametric surface. */
  resolution: number;
  color: string;
  accent: string;
  /** Deformation amount 0..1. */
  amplitude: number;
  speed: number;
  lineWidth: number;
  /** Which parametric form to sample. */
  variant: number;
  /** Whether to draw the wireframe quads or only the horizontal rings. */
  wireframe: boolean;
};

/** Parametric surface points for the chosen variant, in unit space. */
function sampleSurface(variant: number, u: number, v: number, time: number, amplitude: number): Vec3 {
  const tau = Math.PI * 2;
  const uu = u * tau;
  const vv = v * Math.PI;

  if (variant < 0.5) {
    // Torus knot tube: a knot path with a circular cross-section.
    const p = 3;
    const q = 2;
    const r = 0.7 + 0.3 * Math.cos(q * uu);
    const wobble = 1 + Math.sin(vv * 2 + time) * 0.06 * amplitude;
    return vec3(
      r * Math.cos(p * uu) * wobble,
      (0.7 + 0.3 * Math.cos(q * uu)) * Math.sin(p * uu) * wobble,
      0.35 * Math.sin(q * uu) + Math.cos(vv) * 0.22,
    );
  }
  if (variant < 1.5) {
    // Klein-style bottle approximation.
    const cu = Math.cos(uu);
    const su = Math.sin(uu);
    const cv = Math.cos(vv);
    const sv = Math.sin(vv);
    const r = 0.6 + 0.4 * cu;
    return vec3(
      r * Math.cos(vv * 2) * (1 + 0.1 * Math.sin(time + vv) * amplitude),
      r * Math.sin(vv * 2) * (1 + 0.1 * Math.cos(time + uu) * amplitude),
      0.5 * su * sv + 0.3 * (1 - cv),
    );
  }
  // Superformula blob.
  const m = 6;
  const r = Math.pow(
    Math.pow(Math.abs(Math.cos((m * uu) / 4)), 2.2) + Math.pow(Math.abs(Math.sin((m * uu) / 4)), 2.2),
    -1 / 2.2,
  );
  const shape = r * (0.6 + 0.35 * Math.sin(vv)) * (1 + Math.sin(time * 1.3 + vv * 3) * 0.08 * amplitude);
  return vec3(
    shape * Math.cos(uu) * Math.sin(vv),
    shape * Math.cos(vv),
    shape * Math.sin(uu) * Math.sin(vv),
  );
}

/**
 * Parametric sculpture. A surface is sampled on a UV grid and rendered as a depth-sorted
 * wireframe, which reads as a solid form while staying cheap enough for a landing page.
 */
export class ParametricSculptureEngine extends Canvas2DEngine {
  private config: SculptureConfig;
  private time = 0;
  private spin = 0;
  private cache: Vec3[][] = [];
  private cacheKey = "";

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: SculptureConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: SculptureConfig): void {
    this.config = config;
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;
    this.time += frame.dt * config.speed;
    this.spin += frame.dt * 0.28;

    const { width, height } = frame;
    const res = Math.max(8, Math.min(48, config.resolution));

    // Recompute only when the shape changes; rotation is applied at projection time.
    const key = `${res}|${config.variant.toFixed(2)}|${this.time.toFixed(1)}|${config.amplitude}`;
    if (key !== this.cacheKey) {
      this.cacheKey = key;
      this.cache = Array.from({ length: res }, (_, i) =>
        Array.from({ length: res }, (_, j) =>
          sampleSurface(config.variant, i / res, j / res, this.time, config.amplitude),
        ),
      );
    }

    ctx.clearRect(0, 0, width, height);

    // Pointer controls the viewing rotation.
    const tiltX = (frame.pointer.y - 0.5) * 1.1 + 0.35;
    const tiltY = this.spin + (frame.pointer.x - 0.5) * 1.3;

    type Seg = { x1: number; y1: number; x2: number; y2: number; depth: number; shade: number };
    const segments: Seg[] = [];

    const rows = config.wireframe ? this.cache : this.cache.filter((_, i) => i % 3 === 0);

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row) continue;
      for (let j = 0; j < row.length; j += 1) {
        const current = row[j];
        const next = row[(j + 1) % row.length];
        if (!current || !next) continue;

        const ra = project(rotate(current, tiltX, tiltY, 0), width, height, 3.1, 1.1);
        const rb = project(rotate(next, tiltX, tiltY, 0), width, height, 3.1, 1.1);

        segments.push({
          x1: ra.x,
          y1: ra.y,
          x2: rb.x,
          y2: rb.y,
          depth: (ra.depth + rb.depth) / 2,
          shade: ra.scale,
        });

        // Vertical connectors knit the surface together.
        if (config.wireframe && i < rows.length - 1) {
          const below = rows[i + 1]?.[j];
          if (below) {
            const rc = project(rotate(below, tiltX, tiltY, 0), width, height, 3.1, 1.1);
            segments.push({
              x1: ra.x,
              y1: ra.y,
              x2: rc.x,
              y2: rc.y,
              depth: (ra.depth + rc.depth) / 2,
              shade: ra.scale,
            });
          }
        }
      }
    }

    segments.sort((a, b) => b.depth - a.depth);

    ctx.lineCap = "round";
    for (const seg of segments) {
      const t = Math.max(0, Math.min(1, (seg.depth + 1.3) / 2.6));
      ctx.strokeStyle = t < 0.5 ? config.color : config.accent;
      // Near segments are brighter and thicker.
      ctx.globalAlpha = 0.14 + Math.pow(1 - t, 2) * 0.8;
      ctx.lineWidth = config.lineWidth * (0.45 + (1 - t) * 1.5);
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  protected override release(): void {
    this.cache = [];
    super.release();
  }
}
