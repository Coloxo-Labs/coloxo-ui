import { VisualEngine, type FrameInfo, type SurfaceOptions } from "./visualEngine";

/**
 * Canvas 2D surface. Particle and simulation effects draw here rather than in WebGL because they
 * need per-frame JavaScript state (springs, collisions, path traversal) that would otherwise have
 * to be re-uploaded to the GPU every frame.
 */
export abstract class Canvas2DEngine extends VisualEngine {
  private ctx: CanvasRenderingContext2D | null = null;
  private scaled = false;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, options: SurfaceOptions = {}) {
    super(container, canvas, options);
  }

  protected override init(): void {
    this.ctx = this.canvas.getContext("2d", { alpha: true });
  }

  protected get context(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  /** Scale so callers can work in CSS pixels while the backing store stays crisp. */
  protected prepare(frame: FrameInfo): CanvasRenderingContext2D | null {
    const ctx = this.ctx;
    if (!ctx) return null;
    if (!this.scaled) {
      ctx.setTransform(frame.dpr, 0, 0, frame.dpr, 0, 0);
      this.scaled = true;
    }
    return ctx;
  }

  protected override onResize(): void {
    this.scaled = false;
  }

  protected clear(ctx: CanvasRenderingContext2D, frame: FrameInfo, color?: string): void {
    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, frame.width, frame.height);
    } else {
      ctx.clearRect(0, 0, frame.width, frame.height);
    }
  }

  protected override release(): void {
    this.ctx = null;
  }
}
