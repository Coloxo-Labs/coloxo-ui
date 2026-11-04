import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import { createRandom, ease } from "../_shared/particles";

export type TypographyConfig = {
  text: string;
  count: number;
  color: string;
  /** 0..1 — how far particles fly away from their glyph target. */
  scatter: number;
  repelForce: number;
  font: string;
  seed: number;
};

type GlyphParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  size: number;
  delay: number;
};

/**
 * Particles assemble into live text. Glyph positions are sampled from an offscreen canvas so the
 * shape works for any string and font without shipping a per-letter point model.
 */
export class ParticleTypographyEngine extends Canvas2DEngine {
  private config: TypographyConfig;
  private particles: GlyphParticle[] = [];
  private builtFor = "";
  private sampling: HTMLCanvasElement | null = null;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: TypographyConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: TypographyConfig): void {
    this.config = config;
  }

  private sample(width: number, height: number): void {
    const { text, count, font, seed } = this.config;
    const key = `${text}|${count}|${font}|${seed}|${width}x${height}`;
    if (key === this.builtFor) return;
    this.builtFor = key;

    const sampling = this.sampling ?? document.createElement("canvas");
    this.sampling = sampling;
    // Sample at a reduced resolution: we only need approximate glyph coverage, not crisp pixels.
    sampling.width = Math.max(160, Math.round(width * 0.5));
    sampling.height = Math.max(90, Math.round(height * 0.5));
    const ctx = sampling.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, sampling.width, sampling.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Shrink the font until the text fits the sampling buffer with margins.
    let fontSize = sampling.height * 0.55;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      ctx.font = font.replace("{size}", String(Math.round(fontSize)));
      const metrics = ctx.measureText(text);
      if (metrics.width <= sampling.width * 0.86) break;
      fontSize *= 0.88;
    }
    ctx.font = font.replace("{size}", String(Math.round(fontSize)));
    ctx.fillText(text, sampling.width / 2, sampling.height / 2);

    const data = ctx.getImageData(0, 0, sampling.width, sampling.height).data;
    const candidates: { x: number; y: number }[] = [];
    const step = Math.max(
      1,
      Math.round(Math.sqrt((sampling.width * sampling.height) / (count * 4))),
    );

    for (let y = 0; y < sampling.height; y += step) {
      for (let x = 0; x < sampling.width; x += step) {
        const alpha = data[(y * sampling.width + x) * 4 + 3] ?? 0;
        if (alpha > 128) {
          candidates.push({
            x: (x / sampling.width) * width,
            y: (y / sampling.height) * height,
          });
        }
      }
    }

    const random = createRandom(seed);
    this.particles = candidates.slice(0, count).map((point) => ({
      x: random() * width,
      y: random() * height,
      vx: 0,
      vy: 0,
      tx: point.x,
      ty: point.y,
      size: 0.7 + random() * 1.5,
      delay: random() * 1.4,
    }));
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    this.sample(frame.width, frame.height);

    const { width, height } = frame;
    const config = this.config;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(4, 6, 14, ${Math.min(0.5, 0.24 + config.scatter * 0.2)})`;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";
    const promptX = frame.pointer.px;
    const promptY = frame.pointer.py;
    const active = frame.pointer.inside;

    for (const particle of this.particles) {
      const settled = frame.time > particle.delay ? 1 : 0;
      let targetX = particle.tx;
      let targetY = particle.ty;

      if (config.scatter > 0) {
        // Scatter pushes along the direction from the glyph centre, keeping the text readable as a
        // silhouette while it disperses.
        const dx = particle.tx - width / 2;
        const dy = particle.ty - height / 2;
        const dist = Math.hypot(dx, dy) || 1;
        targetX += (dx / dist) * config.scatter * width * 0.3;
        targetY += (dy / dist) * config.scatter * height * 0.3;
      }

      if (active) {
        const dx = targetX - promptX;
        const dy = targetY - promptY;
        const dist = Math.hypot(dx, dy);
        if (dist < 100 && dist > 0.001) {
          const push = (1 - dist / 100) * config.repelForce;
          targetX += (dx / dist) * push;
          targetY += (dy / dist) * push;
        }
      }

      particle.vx = ease(particle.vx, (targetX - particle.x) * 0.16, 0.4, frame.dt * settled);
      particle.vy = ease(particle.vy, (targetY - particle.y) * 0.16, 0.4, frame.dt * settled);
      particle.x += particle.vx;
      particle.y += particle.vy;

      const radius = particle.size * (config.scatter > 0.05 ? 0.9 : 1);
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(radius, 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  protected override release(): void {
    this.particles = [];
    this.sampling = null;
    super.release();
  }
}
