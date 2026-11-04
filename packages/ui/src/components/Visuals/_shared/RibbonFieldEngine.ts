import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import { createRandom } from "../_shared/particles";

export type RibbonConfig = {
  ribbonCount: number;
  color: string;
  accent: string;
  /** Noise amplitude of the ribbon spine, in CSS pixels. */
  amplitude: number;
  /** Forward scroll speed. */
  speed: number;
  /** Stroke width in CSS pixels. */
  thickness: number;
  /** Pointer attraction strength, 0–1. */
  attraction: number;
  /** Whether ribbons are drawn as filled bands or lines. */
  filled: boolean;
};

type Ribbon = {
  offset: number;
  phase: number;
  frequency: number;
  width: number;
  lane: number;
};

/**
 * Flowing ribbons. Each ribbon is a noise-driven polyline sampled per column, so the bands bend
 * independently and respond to the pointer without any per-vertex bookkeeping.
 */
export class RibbonFieldEngine extends Canvas2DEngine {
  private config: RibbonConfig;
  private ribbons: Ribbon[] = [];
  private builtFor = -1;
  private scroll = 0;
  private random = createRandom(101);

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: RibbonConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: RibbonConfig): void {
    this.config = config;
  }

  private ensure(count: number): void {
    if (this.ribbons.length === count || this.builtFor === count) return;
    this.builtFor = count;
    const random = this.random;
    this.ribbons = Array.from({ length: count }, (_, index) => ({
      offset: random() * Math.PI * 2,
      phase: (index / Math.max(count, 1)) * Math.PI * 2,
      frequency: 0.8 + random() * 1.6,
      width: 0.5 + random() * 1.2,
      lane: count === 1 ? 0.5 : index / (count - 1),
    }));
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;
    this.ensure(config.ribbonCount);

    const { width, height } = frame;
    this.scroll += frame.dt * config.speed;

    ctx.clearRect(0, 0, width, height);
    const pointerY = frame.pointer.inside ? frame.pointer.y : 0.5;
    const pointerX = frame.pointer.inside ? frame.pointer.x : 0.5;

    // Fewer, wider ribbons read as cloth; many thin ones read as a hair flow field.
    const samples = 64;
    for (let r = 0; r < this.ribbons.length; r += 1) {
      const ribbon = this.ribbons[r];
      if (!ribbon) continue;

      const baseY = height * (0.12 + ribbon.lane * 0.76);
      ctx.beginPath();

      for (let i = 0; i <= samples; i += 1) {
        const t = i / samples;
        const x = t * width;

        // Two overlapping sine terms plus a slow scroll give a non-repeating wave.
        const wave =
          Math.sin(t * Math.PI * 2 * ribbon.frequency + this.scroll + ribbon.offset) *
            config.amplitude +
          Math.sin(t * Math.PI * 4.4 - this.scroll * 0.7 + ribbon.offset * 0.5) *
            config.amplitude *
            0.35;

        // Pointer attraction pulls the ribbon toward the cursor's vertical position.
        const proximity = Math.exp(-Math.pow((t - pointerX) * 3.2, 2));
        const pull = (pointerY * height - baseY) * proximity * config.attraction * 0.55;

        const y = baseY + wave + pull;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const gradient = ctx.createLinearGradient(0, baseY - 60, width, baseY + 60);
      gradient.addColorStop(0, config.color);
      gradient.addColorStop(0.5, config.accent);
      gradient.addColorStop(1, config.color);

      if (config.filled) {
        // Close the band back along an offset path to produce a filled ribbon.
        for (let i = samples; i >= 0; i -= 1) {
          const t = i / samples;
          const x = t * width;
          const wave =
            Math.sin(t * Math.PI * 2 * ribbon.frequency + this.scroll + ribbon.offset) *
              config.amplitude +
            Math.sin(t * Math.PI * 4.4 - this.scroll * 0.7 + ribbon.offset * 0.5) *
              config.amplitude *
              0.35;
          const proximity = Math.exp(-Math.pow((t - pointerX) * 3.2, 2));
          const pull = (pointerY * height - baseY) * proximity * config.attraction * 0.55;
          ctx.lineTo(x, baseY + wave + pull + config.thickness * 6);
        }
        ctx.closePath();
        ctx.globalAlpha = 0.22 + ribbon.lane * 0.18;
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.globalAlpha = 0.55 + ribbon.width * 0.3;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = config.thickness * ribbon.width;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  protected override release(): void {
    this.ribbons = [];
    super.release();
  }
}
