import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import { createRandom } from "../_shared/particles";

export type VortexConfig = {
  count: number;
  color: string;
  accent: string;
  /** Rotational speed multiplier, 0–2. */
  speed: number;
  /** 0..1 — how tightly particles are pulled inward. */
  intensity: number;
  /** Trail persistence 0..1. */
  trail: number;
  particleSize: number;
};

type VortexParticle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  hue: number;
  wobble: number;
};

/**
 * Spiral vortex. Particles orbit with radius-dependent angular speed, which is what produces the
 * characteristic differential rotation (inner rings visibly leading outer ones).
 */
export class EnergyVortexEngine extends Canvas2DEngine {
  private config: VortexConfig;
  private particles: VortexParticle[] = [];
  private random = createRandom(7);

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: VortexConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: VortexConfig): void {
    if (config.count !== this.config.count) this.particles = [];
    this.config = config;
  }

  private ensure(count: number): void {
    if (this.particles.length === count) return;
    const random = this.random;
    this.particles = Array.from({ length: count }, () => {
      // sqrt distribution spreads particles evenly by area rather than clustering at the centre.
      const radius = Math.sqrt(random()) * 0.46 + 0.04;
      return {
        angle: random() * Math.PI * 2,
        radius,
        speed: 0.4 + random() * 0.8,
        size: 0.5 + random() * 2,
        hue: random(),
        wobble: random() * Math.PI * 2,
      };
    });
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;
    this.ensure(config.count);

    const { width, height } = frame;
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(3, 5, 12, ${Math.min(0.6, 1 - config.trail * 0.9)})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const pointerX = frame.pointer.px;
    const pointerY = frame.pointer.py;
    const inward = config.intensity;

    for (const particle of this.particles) {
      // Angular velocity rises toward the centre: v ~ 1/r.
      const angular = (particle.speed * config.speed) / Math.max(particle.radius, 0.05);
      particle.angle += angular * frame.dt * 0.55;
      particle.radius -= (0.02 + inward * 0.06) * frame.dt * (0.4 + particle.radius);

      // Recycle particles that reach the core.
      if (particle.radius < 0.02) {
        particle.radius = 0.5;
        particle.angle = this.random() * Math.PI * 2;
      }

      const wobble = Math.sin(frame.time * 1.6 + particle.wobble) * 0.012;
      const radius = (particle.radius + wobble) * scale;

      let x = cx + Math.cos(particle.angle) * radius;
      let y = cy + Math.sin(particle.angle) * radius * 0.86;

      if (frame.pointer.inside) {
        const dx = x - pointerX;
        const dy = y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < 110 && dist > 0.001) {
          const push = (1 - dist / 110) * 22;
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
      }

      const depth = 1 - particle.radius;
      const alpha = Math.min(1, depth * 1.35);
      ctx.fillStyle = particle.hue > 0.5 ? config.accent : config.color;
      ctx.globalAlpha = alpha * 0.9;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(particle.size * config.particleSize, 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    // Bright core.
    ctx.globalAlpha = 1;
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.13);
    core.addColorStop(0, "rgba(190, 220, 255, 0.9)");
    core.addColorStop(0.4, "rgba(60, 120, 255, 0.35)");
    core.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 0.13, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
  }

  protected override release(): void {
    this.particles = [];
    super.release();
  }
}
