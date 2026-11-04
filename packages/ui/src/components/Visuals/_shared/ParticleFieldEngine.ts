import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import { createRandom, ease, lerp, sampleShape, type Point, type ShapeKind } from "../_shared/particles";

export type ParticleConfig = {
  count: number;
  from: ShapeKind;
  to: ShapeKind;
  /** 0..1 progress toward the target shape. */
  progress: number;
  size: number;
  color: string;
  accent: string;
  /** Trail persistence for the motion blur pass, 0..1. */
  trail: number;
  /** Radial spread multiplier. */
  spread: number;
  /** Pointer repulsion radius in CSS pixels. */
  repelRadius: number;
  repelForce: number;
  /** Continuous rotation in radians per second. */
  spin: number;
  seed: number;
};

export type ParticleState = Point & {
  vx: number;
  vy: number;
  home: Point;
  target: Point;
  size: number;
  phase: number;
};

/**
 * Particle field that interpolates between two sampled shapes. Each particle chases its target
 * through a spring, so changing `progress` morphs the arrangement instead of teleporting it.
 */
export class ParticleFieldEngine extends Canvas2DEngine {
  private config: ParticleConfig;
  private particles: ParticleState[] = [];
  private fromPoints: Point[] = [];
  private toPoints: Point[] = [];
  private builtFor = "";
  private angle = 0;
  private random = createRandom(1);

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: ParticleConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: ParticleConfig): void {
    this.config = config;
  }

  private rebuild(width: number, height: number): void {
    const { count, from, to, seed } = this.config;
    const key = `${count}|${from}|${to}|${seed}|${width}x${height}`;
    if (key === this.builtFor) return;
    this.builtFor = key;

    const random = createRandom(seed);
    this.random = random;
    const radius = Math.min(width, height) * 0.42;

    this.fromPoints = sampleShape(from, count, radius, random);
    this.toPoints = sampleShape(to, count, radius, random);

    this.particles = this.fromPoints.map((point, index) => {
      const target = this.toPoints[index] ?? point;
      return {
        x: point.x,
        y: point.y,
        vx: 0,
        vy: 0,
        home: point,
        target,
        size: 0.6 + random() * 1.8,
        phase: random() * Math.PI * 2,
      };
    });
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    this.rebuild(frame.width, frame.height);

    const { width, height } = frame;
    const config = this.config;
    const dt = frame.dt;
    this.angle += config.spin * dt;

    // Trails come from a translucent repaint rather than per-particle history buffers.
    ctx.globalCompositeOperation = "source-over";
    if (config.trail > 0.01) {
      ctx.fillStyle = `rgba(4, 6, 14, ${Math.min(0.55, 1 - config.trail * 0.92)})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    const cx = width / 2;
    const cy = height / 2;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    const pointerX = frame.pointer.px;
    const pointerY = frame.pointer.py;
    const pointerActive = frame.pointer.inside;

    ctx.globalCompositeOperation = "lighter";

    for (const particle of this.particles) {
      const t = Math.min(1, Math.max(0, config.progress));
      const baseX = lerp(particle.home.x, particle.target.x, t);
      const baseY = lerp(particle.home.y, particle.target.y, t);

      const wobble = Math.sin(frame.time * 1.4 + particle.phase) * 3;

      const rotatedX = (baseX * cos - baseY * sin) * config.spread + wobble;
      const rotatedY = (baseX * sin + baseY * cos) * config.spread;

      let targetX = cx + rotatedX;
      let targetY = cy + rotatedY;

      if (pointerActive) {
        const dx = targetX - pointerX;
        const dy = targetY - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < config.repelRadius && dist > 0.001) {
          const push = (1 - dist / config.repelRadius) * config.repelForce;
          targetX += (dx / dist) * push;
          targetY += (dy / dist) * push;
        }
      }

      // Spring integration: critically damped enough to settle without oscillating forever.
      particle.vx = ease(particle.vx, (targetX - particle.x) * 0.14, 0.35, dt);
      particle.vy = ease(particle.vy, (targetY - particle.y) * 0.14, 0.35, dt);
      particle.x += particle.vx;
      particle.y += particle.vy;

      const size = particle.size * config.size;
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        Math.max(size * 3.2, 1),
      );
      gradient.addColorStop(0, config.color);
      gradient.addColorStop(0.45, `${config.accent}`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(size * 3.2, 1), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  protected override release(): void {
    this.particles = [];
    this.fromPoints = [];
    this.toPoints = [];
    super.release();
  }
}
