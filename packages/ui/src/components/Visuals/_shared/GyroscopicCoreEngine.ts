import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import { polygon, project, rotate, vec3, type Vec3 } from "../_shared/projection";

export type GyroscopeConfig = {
  ringCount: number;
  color: string;
  accent: string;
  speed: number;
  lineWidth: number;
  /** Whether each ring's axis also precesses. */
  precession: boolean;
  segments: number;
};

type Ring = {
  axisX: number;
  axisY: number;
  radius: number;
  phase: number;
  speed: number;
};

/**
 * Nested gyroscope rings. Each ring spins on its own axis and precesses, and rings are depth-sorted
 * before drawing so back arcs render behind front arcs.
 */
export class GyroscopicCoreEngine extends Canvas2DEngine {
  private config: GyroscopeConfig;
  private rings: Ring[] = [];
  private builtFor = -1;
  private t = 0;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: GyroscopeConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: GyroscopeConfig): void {
    this.config = config;
  }

  private ensure(count: number): void {
    if (this.builtFor === count) return;
    this.builtFor = count;
    this.rings = Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0 : i / (count - 1);
      return {
        axisX: (i % 2 === 0 ? 1 : -1) * (0.5 + t * 0.8),
        axisY: (i % 3 === 0 ? 1 : -1) * (0.4 + t * 0.6),
        radius: 0.55 + t * 0.55,
        phase: i * 0.9,
        speed: 0.7 + t * 1.1,
      };
    });
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;
    this.ensure(config.ringCount);
    this.t += frame.dt * config.speed;

    const { width, height } = frame;
    ctx.clearRect(0, 0, width, height);

    const pointerTiltX = (frame.pointer.y - 0.5) * 0.9;
    const pointerTiltY = (frame.pointer.x - 0.5) * 0.9;

    type Segment = { x1: number; y1: number; x2: number; y2: number; depth: number; ring: number };
    const segments: Segment[] = [];

    this.rings.forEach((ring, ringIndex) => {
      const spin = this.t * ring.speed + ring.phase;
      const precess = config.precession ? this.t * 0.35 + ring.phase * 0.4 : 0;

      const points = polygon(config.segments, ring.radius);
      const rotated = points.map((p) => {
        const spun = rotate(p, ring.axisX * spin * 0.5, ring.axisY * spin * 0.5, precess);
        return rotate(spun, pointerTiltX, pointerTiltY, 0);
      });

      for (let i = 0; i < rotated.length; i += 1) {
        const a = rotated[i];
        const b = rotated[(i + 1) % rotated.length];
        if (!a || !b) continue;
        const pa = project(a, width, height);
        const pb = project(b, width, height);
        segments.push({
          x1: pa.x,
          y1: pa.y,
          x2: pb.x,
          y2: pb.y,
          depth: (a.z + b.z) / 2,
          ring: ringIndex,
        });
      }
    });

    // Painter's algorithm: far segments first.
    segments.sort((a, b) => b.depth - a.depth);

    ctx.lineCap = "round";
    for (const seg of segments) {
      // Depth drives alpha so the far side of each ring recedes.
      const t = (seg.depth + 1.4) / 2.8;
      const alpha = 0.18 + Math.max(0, Math.min(1, 1 - t)) * 0.85;
      ctx.strokeStyle = seg.ring % 2 === 0 ? config.color : config.accent;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = config.lineWidth * (0.4 + (1 - t) * 1.2);
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }

    // Glowing nucleus.
    const core = project(vec3(0, 0, 0), width, height);
    const glow = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, 42);
    glow.addColorStop(0, "rgba(255,255,255,0.95)");
    glow.addColorStop(0.3, config.accent);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(core.x, core.y, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  protected override release(): void {
    this.rings = [];
    super.release();
  }
}
