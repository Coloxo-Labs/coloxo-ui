export type FallbackRgb = { r: number; g: number; b: number };

export function staticGradientCss(
  colors: FallbackRgb[],
  background: FallbackRgb,
  transparent: boolean,
): string {
  const c0 = colors[0] ?? { r: 37, g: 99, b: 255 };
  const c1 = colors[1] ?? { r: 34, g: 211, b: 238 };
  const c2 = colors[2] ?? { r: 139, g: 92, b: 246 };
  const bg = `rgb(${background.r},${background.g},${background.b})`;
  const base = transparent ? "transparent" : bg;
  return [
    `radial-gradient(120% 80% at 20% 30%, rgba(${c0.r},${c0.g},${c0.b},0.55), transparent 55%)`,
    `radial-gradient(100% 70% at 80% 60%, rgba(${c1.r},${c1.g},${c1.b},0.4), transparent 50%)`,
    `radial-gradient(90% 60% at 50% 90%, rgba(${c2.r},${c2.g},${c2.b},0.35), transparent 45%)`,
    `linear-gradient(180deg, ${base}, ${bg})`,
  ].join(", ");
}

/** Lightweight Canvas 2D undulation — not a WebGL clone. Driven by WaveEngine's rAF. */
export class CanvasWaveFallback {
  private ctx: CanvasRenderingContext2D | null;
  private disposed = false;
  private cssW = 0;
  private cssH = 0;
  private colors: FallbackRgb[];
  private bg: FallbackRgb;
  private transparent: boolean;
  private speed: number;
  private amplitude: number;

  constructor(
    private canvas: HTMLCanvasElement,
    opts: {
      colors: FallbackRgb[];
      background: FallbackRgb;
      transparent: boolean;
      speed: number;
      amplitude: number;
    },
  ) {
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.colors = opts.colors;
    this.bg = opts.background;
    this.transparent = opts.transparent;
    this.speed = opts.speed;
    this.amplitude = opts.amplitude;
  }

  setOptions(opts: {
    colors: FallbackRgb[];
    background: FallbackRgb;
    transparent: boolean;
    speed: number;
    amplitude: number;
  }) {
    this.colors = opts.colors;
    this.bg = opts.background;
    this.transparent = opts.transparent;
    this.speed = opts.speed;
    this.amplitude = opts.amplitude;
  }

  resize(cssW: number, cssH: number, dpr: number) {
    this.cssW = Math.max(1, cssW);
    this.cssH = Math.max(1, cssH);
    const bw = Math.max(1, Math.floor(this.cssW * dpr));
    const bh = Math.max(1, Math.floor(this.cssH * dpr));
    this.canvas.style.width = `${this.cssW}px`;
    this.canvas.style.height = `${this.cssH}px`;
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  paintStatic() {
    this.draw(0);
  }

  frame(t: number) {
    if (this.disposed) return;
    this.draw(t);
  }

  dispose() {
    this.disposed = true;
    this.ctx = null;
  }

  private draw(t: number) {
    const ctx = this.ctx;
    if (!ctx || this.cssW < 1) return;
    const w = this.cssW;
    const h = this.cssH;
    if (this.transparent) ctx.clearRect(0, 0, w, h);
    else {
      ctx.fillStyle = `rgb(${this.bg.r},${this.bg.g},${this.bg.b})`;
      ctx.fillRect(0, 0, w, h);
    }

    const amp = this.amplitude * h * 0.12;
    const bands = Math.min(this.colors.length, 3);
    for (let i = 0; i < bands; i++) {
      const c = this.colors[i]!;
      ctx.beginPath();
      const y0 = h * (0.35 + i * 0.18);
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 6) {
        const y =
          y0 +
          Math.sin(x * 0.012 * (1 + i * 0.3) + t * this.speed * (1.2 + i * 0.25) + i) * amp +
          Math.sin(x * 0.021 + t * this.speed * 0.7 + i * 2) * amp * 0.45;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${0.22 + i * 0.08})`;
      ctx.fill();
    }
  }
}
