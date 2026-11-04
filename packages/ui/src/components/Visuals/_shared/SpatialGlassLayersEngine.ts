import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";


export type GlassLayersConfig = {
  layerCount: number;
  color: string;
  accent: string;
  /** Parallax response to the pointer, 0 to 1. */
  parallax: number;
  /** Corner radius as a fraction of pane size. */
  radius: number;
};

type Pane = { depth: number; width: number; height: number; seed: number };

/**
 * Stacked translucent panes in parallax depth. Each pane is drawn as a rounded rect with a
 * Fresnel-like edge highlight, and offset by depth Ã— parallax so the stack reads as 3D.
 */
export class SpatialGlassLayersEngine extends Canvas2DEngine {
  private config: GlassLayersConfig;
  private panes: Pane[] = [];
  private builtFor = -1;
  private drift = 0;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: GlassLayersConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: GlassLayersConfig): void {
    this.config = config;
  }

  private ensure(count: number): void {
    if (this.builtFor === count) return;
    this.builtFor = count;
    this.panes = Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      return {
        depth: t,
        width: 1.35 - t * 0.5,
        height: 0.9 - t * 0.28,
        seed: i * 0.7,
      };
    });
  }

  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;
    this.ensure(config.layerCount);
    this.drift += frame.dt * 0.25;

    const { width, height } = frame;
    ctx.clearRect(0, 0, width, height);

    const px = (frame.pointer.x - 0.5) * config.parallax;
    const py = (frame.pointer.y - 0.5) * config.parallax;
    const scale = Math.min(width, height);

    // Far panes first so nearer ones occlude them.
    for (const pane of this.panes) {
      const depth = pane.depth;
      const bob = Math.sin(this.drift + pane.seed) * 4;
      const offsetX = px * (0.4 + depth * 1.4) * scale * 0.5;
      const offsetY = py * (0.4 + depth * 1.4) * scale * 0.5 + bob;

      const w = pane.width * scale * 0.5;
      const h = pane.height * scale * 0.5;
      const x = width / 2 - w / 2 + offsetX;
      const y = height / 2 - h / 2 + offsetY;
      const radius = config.radius * Math.min(w, h);

      this.roundedRect(ctx, x, y, w, h, radius);
      const fill = ctx.createLinearGradient(x, y, x + w, y + h);
      fill.addColorStop(0, "rgba(255,255,255,0.14)");
      fill.addColorStop(0.5, "rgba(255,255,255,0.04)");
      fill.addColorStop(1, "rgba(255,255,255,0.1)");
      ctx.fillStyle = fill;
      ctx.globalAlpha = 0.5 + (1 - depth) * 0.4;
      ctx.fill();

      // Edge highlight: brighter on the top and left, like a lit glass bevel.
      ctx.strokeStyle = depth < 0.5 ? config.accent : config.color;
      ctx.globalAlpha = 0.35 + (1 - depth) * 0.6;
      ctx.lineWidth = 1 + (1 - depth) * 1.2;
      ctx.stroke();

      // Specular sweep across the pane.
      const sweep = ((this.drift * 0.6 + pane.seed) % 1) * 1.4 - 0.2;
      const sx = x + sweep * w;
      const gloss = ctx.createLinearGradient(sx - w * 0.12, y, sx + w * 0.12, y + h);
      gloss.addColorStop(0, "rgba(255,255,255,0)");
      gloss.addColorStop(0.5, "rgba(255,255,255,0.22)");
      gloss.addColorStop(1, "rgba(255,255,255,0)");
      this.roundedRect(ctx, x, y, w, h, radius);
      ctx.fillStyle = gloss;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  protected override release(): void {
    this.panes = [];
    super.release();
  }
}
