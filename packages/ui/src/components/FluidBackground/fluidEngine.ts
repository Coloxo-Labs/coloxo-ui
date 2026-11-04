export type FluidEngineOptions = {
  colors: string[];
  intensity: number;
  trailPersistence: number;
  quality: "low" | "medium" | "high";
  transparent: boolean;
  disabled: boolean;
  respectReducedMotion: boolean;
};

type Point = {
  x: number;
  y: number;
  t: number;
  speed: number;
};

type Rgb = { r: number; g: number; b: number };

const QUALITY_SCALE: Record<FluidEngineOptions["quality"], number> = {
  low: 0.5,
  medium: 0.75,
  high: 1,
};

/** Catmull-Rom subdivisions per segment — more = silkier curves. */
const QUALITY_SUBDIV: Record<FluidEngineOptions["quality"], number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/** Number of stacked ribbon layers that build the soft edge falloff. */
const FEATHER_LAYERS: Record<FluidEngineOptions["quality"], number> = {
  low: 6,
  medium: 8,
  high: 11,
};
const FEATHER_OUTER = 3.0; // widest layer (× body half-width)
const FEATHER_INNER = 0.55; // tightest layer
const CORE_LAYERS = 4;

const MAX_POINTS = 96;
const MAX_SUBDIV = 3;
const MAX_SAMPLES = MAX_POINTS * MAX_SUBDIV + 8;
const MAX_PIXELS = 1_800_000;
const POINT_SPACING = 5; // px between trail points
const HEAD_TAU = 34; // ms — pointer-follow smoothing (lower = snappier)
const SPEED_EMA = 0.22;
const MAX_SPEED = 48;
const SETTLE_EPS = 0.3;

/** Iridescent liquid-ink defaults (ice highlight is drawn sparsely, not cycled). */
const DEFAULT_COLORS = ["#2563FF", "#22D3EE", "#8B5CF6", "#EC4899"];
const HIGHLIGHT_RGB: Rgb = { r: 224, g: 247, b: 255 };

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function smoothstep(t: number): number {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
}

function sanitizeColors(colors: string[] | undefined): string[] {
  const list = (colors ?? [])
    .map((c) => (typeof c === "string" ? c.trim() : ""))
    .filter(Boolean);
  return list.length > 0 ? list : DEFAULT_COLORS;
}

function parseColor(input: string): Rgb | null {
  const s = input.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (hex) {
    let h = hex[1]!;
    if (h.length === 3) {
      h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(s);
  if (rgb) {
    return {
      r: Math.min(255, Math.max(0, Number(rgb[1]))),
      g: Math.min(255, Math.max(0, Number(rgb[2]))),
      b: Math.min(255, Math.max(0, Number(rgb[3]))),
    };
  }
  return null;
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const u = clamp01(t);
  return {
    r: a.r + (b.r - a.r) * u,
    g: a.g + (b.g - a.g) * u,
    b: a.b + (b.b - a.b) * u,
  };
}

function rgbCss(c: Rgb, alpha = 1): string {
  const a = clamp01(alpha);
  return `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${a.toFixed(3)})`;
}

function colorAtProgress(palette: Rgb[], progress: number): Rgb {
  if (palette.length === 0) return HIGHLIGHT_RGB;
  if (palette.length === 1) return palette[0]!;
  const scaled = clamp01(progress) * (palette.length - 1);
  const i = Math.floor(scaled);
  const t = scaled - i;
  const a = palette[i]!;
  const b = palette[Math.min(i + 1, palette.length - 1)]!;
  return lerpRgb(a, b, t);
}

function buildPalette(colors: string[]): Rgb[] {
  const parsed = colors.map(parseColor).filter((c): c is Rgb => c != null);
  if (parsed.length > 0) return parsed;
  return DEFAULT_COLORS.map((c) => parseColor(c)!);
}

/** Uniform Catmull-Rom interpolation of one coordinate. */
function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

export class FluidEngine {
  private root: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private opts: FluidEngineOptions;
  private palette: Rgb[] = [];

  private points: Point[] = [];
  private rafId = 0;
  private running = false;
  private lastFrame = 0;

  // Pointer target + spring-smoothed head that chases it.
  private tx = 0;
  private ty = 0;
  private hx = 0;
  private hy = 0;
  private speed = 0;
  private hasHead = false;

  private cssW = 0;
  private cssH = 0;
  private rectLeft = 0;
  private rectTop = 0;
  private scale = 1;
  private reducedMotion = false;
  private disposed = false;

  // Preallocated sample buffers — zero per-frame allocation.
  private readonly sx = new Float32Array(MAX_SAMPLES);
  private readonly sy = new Float32Array(MAX_SAMPLES);
  private readonly sLife = new Float32Array(MAX_SAMPLES);
  private readonly sSpeed = new Float32Array(MAX_SAMPLES);
  private readonly sW = new Float32Array(MAX_SAMPLES);
  private readonly sNx = new Float32Array(MAX_SAMPLES);
  private readonly sNy = new Float32Array(MAX_SAMPLES);

  private resizeObserver: ResizeObserver | null = null;
  private mediaQuery: MediaQueryList | null = null;

  private readonly onPointerEnter = (e: PointerEvent) => this.handleEnter(e);
  private readonly onPointerMove = (e: PointerEvent) => this.handleMove(e);
  private readonly onPointerLeave = () => this.handleLeave();
  private readonly onPointerCancel = () => this.handleLeave();
  private readonly onReducedMotion = () => this.syncReducedMotion();
  private readonly onVisibility = () => {
    if (typeof document !== "undefined" && document.hidden) {
      this.points = [];
      this.hasHead = false;
      this.stop();
      this.clearCanvas();
    }
  };

  constructor(root: HTMLElement, canvas: HTMLCanvasElement, opts: FluidEngineOptions) {
    this.root = root;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.opts = {
      ...opts,
      colors: sanitizeColors(opts.colors),
      intensity: clamp01(opts.intensity),
      trailPersistence: clamp01(opts.trailPersistence),
    };
    this.palette = buildPalette(this.opts.colors);

    this.syncReducedMotion();
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.mediaQuery.addEventListener?.("change", this.onReducedMotion);
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibility);
    }

    this.resize();
    this.bind();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.disposed) return;
        this.resize();
      });
      this.resizeObserver.observe(root);
    }
  }

  setOptions(partial: Partial<FluidEngineOptions>) {
    const next = { ...this.opts, ...partial };
    next.colors = sanitizeColors(next.colors);
    next.intensity = clamp01(next.intensity);
    next.trailPersistence = clamp01(next.trailPersistence);
    const qualityChanged = next.quality !== this.opts.quality;
    const colorsChanged =
      next.colors.length !== this.opts.colors.length ||
      next.colors.some((c, i) => c !== this.opts.colors[i]);
    this.opts = next;
    if (colorsChanged) this.palette = buildPalette(next.colors);
    this.syncReducedMotion();
    if (qualityChanged) this.resize();
    if (this.opts.disabled || this.reducedMotion) {
      this.points = [];
      this.hasHead = false;
      this.clearCanvas();
      this.stop();
    }
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.unbind();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.mediaQuery?.removeEventListener?.("change", this.onReducedMotion);
    this.mediaQuery = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    this.points = [];
    this.ctx = null;
  }

  /* ───────────────────────── input ───────────────────────── */

  private syncReducedMotion() {
    if (!this.opts.respectReducedMotion) {
      this.reducedMotion = false;
      return;
    }
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      this.reducedMotion = false;
      return;
    }
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private bind() {
    this.root.addEventListener("pointerenter", this.onPointerEnter, { passive: true });
    this.root.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.root.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    this.root.addEventListener("pointercancel", this.onPointerCancel, { passive: true });
  }

  private unbind() {
    this.root.removeEventListener("pointerenter", this.onPointerEnter);
    this.root.removeEventListener("pointermove", this.onPointerMove);
    this.root.removeEventListener("pointerleave", this.onPointerLeave);
    this.root.removeEventListener("pointercancel", this.onPointerCancel);
  }

  private canInject(): boolean {
    return Boolean(this.ctx) && !this.opts.disabled && !this.reducedMotion;
  }

  /** Cached rect — avoids a layout read on every pointermove. */
  private refreshRect() {
    const rect = this.root.getBoundingClientRect();
    this.rectLeft = rect.left;
    this.rectTop = rect.top;
  }

  private handleEnter(e: PointerEvent) {
    this.refreshRect();
    const x = e.clientX - this.rectLeft;
    const y = e.clientY - this.rectTop;
    this.tx = this.hx = x;
    this.ty = this.hy = y;
    this.speed = 0;
    this.hasHead = true;
  }

  private handleMove(e: PointerEvent) {
    if (!this.canInject()) return;
    if (!this.hasHead) this.handleEnter(e);

    // Use the most recent coalesced sample for the freshest target.
    const list = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : null;
    const last = list && list.length > 0 ? list[list.length - 1]! : e;

    // Rect can drift with scrolling; refresh cheaply when the page has moved.
    this.refreshRect();
    this.tx = last.clientX - this.rectLeft;
    this.ty = last.clientY - this.rectTop;
    this.ensureLoop();
  }

  private handleLeave() {
    // Head keeps gliding to the last position, then the trail dissolves.
  }

  /* ───────────────────────── sizing ───────────────────────── */

  private resize() {
    const rect = this.root.getBoundingClientRect();
    this.rectLeft = rect.left;
    this.rectTop = rect.top;
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    let scale = QUALITY_SCALE[this.opts.quality] * dpr;
    let bw = Math.max(1, Math.floor(cssW * scale));
    let bh = Math.max(1, Math.floor(cssH * scale));
    const pixels = bw * bh;
    if (pixels > MAX_PIXELS) {
      const factor = Math.sqrt(MAX_PIXELS / pixels);
      bw = Math.max(1, Math.floor(bw * factor));
      bh = Math.max(1, Math.floor(bh * factor));
      scale = bw / cssW;
    }

    const sizeChanged = cssW !== this.cssW || cssH !== this.cssH || scale !== this.scale;
    this.cssW = cssW;
    this.cssH = cssH;
    this.scale = scale;

    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
      if (sizeChanged) {
        this.points = [];
        this.clearCanvas();
      }
    }
  }

  private clearCanvas() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /* ───────────────────────── loop ───────────────────────── */

  private ensureLoop() {
    if (this.running || this.disposed || !this.ctx) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private readonly tick = (now: number) => {
    if (this.disposed) {
      this.running = false;
      return;
    }
    const dt = Math.min(50, Math.max(1, now - this.lastFrame));
    this.lastFrame = now;

    if (this.canInject()) this.advanceHead(now, dt);
    this.drawFrame(now);

    const settling =
      this.hasHead && Math.hypot(this.tx - this.hx, this.ty - this.hy) > SETTLE_EPS;

    if (this.points.length > 0 || settling) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.running = false;
      this.rafId = 0;
      this.speed = 0;
      this.clearCanvas();
    }
  };

  /**
   * Frame-rate independent exponential follow. The head glides toward the pointer,
   * and trail points are emitted at an even spacing along that glide — this is what
   * makes the curve feel like liquid instead of jittery polyline segments.
   */
  private advanceHead(now: number, dt: number) {
    if (!this.hasHead) return;
    const k = 1 - Math.exp(-dt / HEAD_TAU);
    const nx = this.hx + (this.tx - this.hx) * k;
    const ny = this.hy + (this.ty - this.hy) * k;
    const dx = nx - this.hx;
    const dy = ny - this.hy;
    const d = Math.hypot(dx, dy);

    if (d < 0.2) {
      this.speed *= 0.9;
      if (Math.hypot(this.tx - this.hx, this.ty - this.hy) < SETTLE_EPS) {
        this.hx = this.tx;
        this.hy = this.ty;
      }
      return;
    }

    const inst = Math.min(MAX_SPEED, (d / dt) * 16);
    this.speed += (inst - this.speed) * SPEED_EMA;

    const steps = Math.max(1, Math.min(12, Math.ceil(d / POINT_SPACING)));
    for (let i = 1; i <= steps; i++) {
      const u = i / steps;
      this.pushPoint({
        x: this.hx + dx * u,
        y: this.hy + dy * u,
        t: now - (1 - u) * dt, // sub-frame accurate timestamps
        speed: this.speed,
      });
    }
    this.hx = nx;
    this.hy = ny;
  }

  private pushPoint(p: Point) {
    this.points.push(p);
    if (this.points.length > MAX_POINTS) {
      this.points.splice(0, this.points.length - MAX_POINTS);
    }
  }

  /* ───────────────────────── render ───────────────────────── */

  private resetFrame(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    if (this.opts.transparent) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      ctx.fillStyle = "rgba(8,11,24,1)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /** Fill a variable-width ribbon around the sampled centerline. */
  private fillRibbon(ctx: CanvasRenderingContext2D, count: number, widthMul: number) {
    const { sx, sy, sNx, sNy, sW } = this;
    ctx.beginPath();
    ctx.moveTo(sx[0]! + sNx[0]! * sW[0]! * widthMul, sy[0]! + sNy[0]! * sW[0]! * widthMul);
    for (let i = 1; i < count; i++) {
      const w = sW[i]! * widthMul;
      ctx.lineTo(sx[i]! + sNx[i]! * w, sy[i]! + sNy[i]! * w);
    }
    for (let i = count - 1; i >= 0; i--) {
      const w = sW[i]! * widthMul;
      ctx.lineTo(sx[i]! - sNx[i]! * w, sy[i]! - sNy[i]! * w);
    }
    ctx.closePath();
    ctx.fill();
  }

  private drawFrame(now: number) {
    const ctx = this.ctx;
    if (!ctx) return;

    this.resetFrame(ctx);

    const ttl = 420 + this.opts.trailPersistence * 1600;
    this.points = this.points.filter((p) => now - p.t < ttl);
    const n = this.points.length;
    if (n < 2) return;

    const pts = this.points;
    const sub = QUALITY_SUBDIV[this.opts.quality];
    const intensity = this.opts.intensity;
    const qualityBoost = this.opts.quality === "low" ? 1.15 : 1;
    const { sx, sy, sLife, sSpeed, sW, sNx, sNy } = this;

    /* 1 — Catmull-Rom resample into preallocated buffers. */
    let count = 0;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]!;
      const p1 = pts[i]!;
      const p2 = pts[i + 1]!;
      const p3 = pts[Math.min(n - 1, i + 2)]!;
      for (let s = 0; s < sub; s++) {
        if (count >= MAX_SAMPLES - 1) break;
        const t = s / sub;
        sx[count] = catmull(p0.x, p1.x, p2.x, p3.x, t);
        sy[count] = catmull(p0.y, p1.y, p2.y, p3.y, t);
        const time = p1.t + (p2.t - p1.t) * t;
        sLife[count] = clamp01(1 - (now - time) / ttl);
        sSpeed[count] = p1.speed + (p2.speed - p1.speed) * t;
        count++;
      }
    }
    const last = pts[n - 1]!;
    sx[count] = last.x;
    sy[count] = last.y;
    sLife[count] = clamp01(1 - (now - last.t) / ttl);
    sSpeed[count] = last.speed;
    count++;
    if (count < 2) return;

    /* 2 — widths + normals. */
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1); // 0 tail → 1 head
      const life = sLife[i]!;
      const speedNorm = Math.min(MAX_SPEED, sSpeed[i]!) / MAX_SPEED;
      const base = 5 + intensity * 16 + speedNorm * 10;
      const lifeEase = 1 - (1 - life) * (1 - life);
      const tailTaper = 0.08 + 0.92 * smoothstep(u * 2.2); // pointed, ink-like tail
      sW[i] = base * 0.5 * (0.1 + 0.9 * lifeEase) * tailTaper * qualityBoost;

      const a = Math.max(0, i - 1);
      const b = Math.min(count - 1, i + 1);
      let tx = sx[b]! - sx[a]!;
      let ty = sy[b]! - sy[a]!;
      const len = Math.hypot(tx, ty);
      if (len < 1e-4) {
        tx = 1;
        ty = 0;
      } else {
        tx /= len;
        ty /= len;
      }
      sNx[i] = -ty;
      sNy[i] = tx;
    }

    /* 3 — gradient along the trail with per-stop fade + slow hue drift. */
    const s = this.scale;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    const tailX = sx[0]!;
    const tailY = sy[0]!;
    const headX = sx[count - 1]!;
    const headY = sy[count - 1]!;
    const chord = Math.hypot(headX - tailX, headY - tailY);
    const drift = 0.5 + 0.5 * Math.sin(now / 1400);
    const baseAlpha = 0.3 + intensity * 0.6;

    let body: CanvasGradient | string;
    let core: CanvasGradient | string;
    const STOPS = 6;
    if (chord > 2) {
      const g = ctx.createLinearGradient(tailX, tailY, headX, headY);
      const h = ctx.createLinearGradient(tailX, tailY, headX, headY);
      for (let k = 0; k < STOPS; k++) {
        const u = k / (STOPS - 1);
        const idx = Math.min(count - 1, Math.round(u * (count - 1)));
        const fade = smoothstep(sLife[idx]!);
        const c = colorAtProgress(this.palette, u * 0.72 + drift * 0.28);
        g.addColorStop(u, rgbCss(c, fade * baseAlpha));
        const tipSpeed = smoothstep((sSpeed[idx]! / MAX_SPEED - 0.15) / 0.6);
        h.addColorStop(
          u,
          rgbCss(lerpRgb(c, HIGHLIGHT_RGB, 0.7), fade * tipSpeed * 0.6 * u),
        );
      }
      body = g;
      core = h;
    } else {
      const c = colorAtProgress(this.palette, 0.7 + drift * 0.3);
      body = rgbCss(c, baseAlpha * smoothstep(sLife[count - 1]!));
      core = "rgba(0,0,0,0)";
    }

    /* 4 — layered passes: soft halo → glow → body → bright core. */
    // Feathered stack: many near-identical layers with gently shrinking widths and
    // gently rising alpha. Each step is too small to see, so the edges read as one
    // continuous soft falloff instead of distinct halo / glow / body / core bands.
    const layers = FEATHER_LAYERS[this.opts.quality];
    ctx.fillStyle = body;
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1); // 0 = outermost, 1 = innermost
      const widthMul = FEATHER_OUTER + (FEATHER_INNER - FEATHER_OUTER) * Math.pow(t, 0.85);
      ctx.globalAlpha = 0.03 + 0.17 * t * t;
      this.fillRibbon(ctx, count, widthMul);
    }

    // Highlight is blended in the same way: a few faint, tightly spaced layers.
    ctx.fillStyle = core;
    for (let i = 0; i < CORE_LAYERS; i++) {
      const t = i / (CORE_LAYERS - 1);
      ctx.globalAlpha = 0.1 + 0.1 * t;
      this.fillRibbon(ctx, count, 0.62 - 0.4 * t);
    }

    /* 5 — soft ink-drop bloom at the head. */
    const headLife = sLife[count - 1]!;
    if (headLife > 0.05) {
      const r = Math.max(6, sW[count - 1]! * 2.6);
      const hc = colorAtProgress(this.palette, 1);
      const rg = ctx.createRadialGradient(headX, headY, 0, headX, headY, r);
      rg.addColorStop(0, rgbCss(lerpRgb(hc, HIGHLIGHT_RGB, 0.45), baseAlpha * 0.55 * headLife));
      rg.addColorStop(0.45, rgbCss(hc, baseAlpha * 0.22 * headLife));
      rg.addColorStop(1, rgbCss(hc, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(headX, headY, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}

export { DEFAULT_COLORS, sanitizeColors, clamp01 };