import { staticOrbitCss, type FallbackRgb } from "./orbitingPlanetsFallback";
import type { OrbitingPlanetConfig } from "./types";

export type OrbitEngineOptions = {
  centralColor: string;
  centralSize: number;
  planets: OrbitingPlanetConfig[];
  showOrbitPaths: boolean;
  orbitColor: string;
  orbitOpacity: number;
  backgroundColor: string;
  transparent: boolean;
  speed: number;
  lightingIntensity: number;
  glowIntensity: number;
  interaction: boolean;
  interactionStrength: number;
  quality: "low" | "medium" | "high";
  paused: boolean;
  respectReducedMotion: boolean;
  fallback: "static";
};

type Rgb = FallbackRgb;
type Geo = {
  cx: number;
  cy: number;
  unit: number;
  aspect: number;
  tilt: number;
  cos: number;
  sin: number;
};
type Pt = { x: number; y: number; s: number };
type Ring = { radius: number; bright: boolean; gold: boolean };
type Half = "back" | "front";
type FlareSeed = { radius: number; phase: number; speed: number; gold: boolean; size: number };
type SparkleSeed = { radius: number; phase: number; seed: number; kind: number };

const TAU = Math.PI * 2;
const DEFAULT_BG = "#171445";
const DEFAULT_CENTRAL = "#5FD3FF";
const DEFAULT_ORBIT = "#2FB8FF";
const GOLD: Rgb = { r: 255, g: 229, b: 138 };
const SPARKLE_COLORS: Rgb[] = [
  { r: 255, g: 233, b: 160 }, // warm yellow
  { r: 120, g: 225, b: 255 }, // cyan
  { r: 255, g: 105, b: 215 }, // pink
  { r: 90, g: 170, b: 255 }, // blue
];
const MAX_PLANETS = 16;
const MAX_PIXELS = 3_000_000;
const ASPECT = 0.4; // ellipse flattening
const TILT = -0.12; // radians, right side higher (as in the reference)
const EXTRA_RINGS = [0.6, 0.78]; // decorative inner rings
const BASE_INC = 0.64;

const QUALITY_DPR: Record<OrbitEngineOptions["quality"], number> = { low: 1, medium: 1.5, high: 2 };
const SPARKLE_COUNT: Record<OrbitEngineOptions["quality"], number> = {
  low: 18,
  medium: 32,
  high: 48,
};

/** Palette matched to the reference: magenta, amber, glassy blues and violets.
 *  Phases are evenly spaced around the ring so the composition isn’t one-sided. */
export const DEFAULT_PLANETS: OrbitingPlanetConfig[] = [
  {
    id: "p1",
    size: 0.07,
    color: "#B8489F",
    orbitRadius: 1.05,
    orbitSpeed: 0.34,
    inclination: BASE_INC,
    phase: 0,
    glow: 0.3,
  },
  {
    id: "p2",
    size: 0.055,
    color: "#7FB6EE",
    orbitRadius: 1.35,
    orbitSpeed: 0.28,
    inclination: BASE_INC,
    phase: Math.PI / 3,
    glow: 0.25,
  },
  {
    id: "p3",
    size: 0.08,
    color: "#D98B6F",
    orbitRadius: 1.58,
    orbitSpeed: 0.22,
    inclination: BASE_INC,
    phase: (2 * Math.PI) / 3,
    glow: 0.3,
  },
  {
    id: "p4",
    size: 0.065,
    color: "#8FC2F2",
    orbitRadius: 1.82,
    orbitSpeed: 0.18,
    inclination: BASE_INC,
    phase: Math.PI,
    glow: 0.28,
  },
  {
    id: "p5",
    size: 0.075,
    color: "#C0479A",
    orbitRadius: 2.0,
    orbitSpeed: 0.14,
    inclination: BASE_INC,
    phase: (4 * Math.PI) / 3,
    glow: 0.32,
  },
  {
    id: "p6",
    size: 0.05,
    color: "#E49A6A",
    orbitRadius: 2.15,
    orbitSpeed: 0.11,
    inclination: BASE_INC,
    phase: (5 * Math.PI) / 3,
    glow: 0.28,
  },
];

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function clampSpeed(n: number): number {
  return clamp(n, 0.1, 3);
}

export function clampCentralSize(n: number): number {
  return clamp(n, 0.35, 1.2);
}

export function parseColor(input: string | undefined, fallback: string): Rgb {
  const s = (input ?? "").trim() || fallback;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (hex) {
    let h = hex[1]!;
    if (h.length === 3) h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
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
  return parseColor(fallback, DEFAULT_CENTRAL);
}

export function normalizePlanets(
  planets: OrbitingPlanetConfig[] | undefined,
): OrbitingPlanetConfig[] {
  const src = planets && planets.length > 0 ? planets.slice(0, MAX_PLANETS) : DEFAULT_PLANETS;
  return src.map((p, i) => ({
    id: typeof p.id === "string" && p.id.trim() ? p.id.trim() : `planet-${i}`,
    size: clamp(p.size, 0.04, 0.45),
    color: typeof p.color === "string" && p.color.trim() ? p.color.trim() : "#7FB6EE",
    orbitRadius: clamp(p.orbitRadius, 0.35, 2.2),
    orbitSpeed: clamp(p.orbitSpeed, 0.05, 2),
    inclination: clamp(p.inclination, -Math.PI / 2, Math.PI / 2),
    phase: Number.isFinite(p.phase) ? p.phase : 0,
    direction: p.direction === "counterclockwise" ? "counterclockwise" : "clockwise",
    glow: clamp01(p.glow ?? 0.35),
  }));
}

function rgba(c: Rgb, a: number): string {
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${clamp01(a).toFixed(3)})`;
}

function lighten(c: Rgb, t: number): Rgb {
  return { r: c.r + (255 - c.r) * t, g: c.g + (255 - c.g) * t, b: c.b + (255 - c.b) * t };
}
const GLOW_BOOST = 1.7;

/** Differential rotation: inner rings spin faster, outer rings slower (vortex feel). */
function vortex(radius: number): number {
  return Math.pow(1.4 / Math.max(0.3, radius), 1.15);
}

/** Single source of truth for angular position, so everything stays on its ring. */
function orbitTheta(
  phase: number,
  sign: number,
  baseSpeed: number,
  radius: number,
  speed: number,
  time: number,
): number {
  return phase + sign * baseSpeed * vortex(radius) * speed * time;
}
function project(g: Geo, radius: number, theta: number, out: Pt) {
  const lx = radius * g.unit * Math.cos(theta);
  const ly = radius * g.unit * g.aspect * Math.sin(theta);
  out.x = g.cx + lx * g.cos - ly * g.sin;
  out.y = g.cy + lx * g.sin + ly * g.cos;
  out.s = Math.sin(theta); // > 0 → in front of the central body
}

export { DEFAULT_BG, DEFAULT_CENTRAL, DEFAULT_ORBIT, MAX_PLANETS };

export class OrbitingPlanetsEngine {
  private root: HTMLElement;
  private canvas: HTMLCanvasElement;
  private fallbackEl: HTMLElement | null;
  private opts: OrbitEngineOptions;

  private ctx: CanvasRenderingContext2D | null = null;
  private mode: "canvas" | "static" = "canvas";
  private dpr = 1;

  private rings: Ring[] = [];
  private planetRgb: Rgb[] = [];
  private flareSeeds: FlareSeed[] = [];
  private sparkleSeeds: SparkleSeed[] = [];

  private geo: Geo = { cx: 0, cy: 0, unit: 1, aspect: ASPECT, tilt: TILT, cos: 1, sin: 0 };
  private pt: Pt = { x: 0, y: 0, s: 0 };

  private rafId = 0;
  private running = false;
  private disposed = false;
  private hidden = false;
  private offscreen = false;
  private reducedMotion = false;
  private time = 0;
  private lastTs = 0;
  private cssW = 0;
  private cssH = 0;

  private pointerTarget = { x: 0, y: 0 };
  private pointerSmooth = { x: 0, y: 0 };
  private pointerInside = false;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private mediaQuery: MediaQueryList | null = null;

  private readonly onReducedMotion = () => {
    this.syncReducedMotion();
    this.syncLoop();
  };
  private readonly onVisibility = () => {
    this.hidden = typeof document !== "undefined" && document.hidden;
    this.syncLoop();
  };

  constructor(
    root: HTMLElement,
    canvas: HTMLCanvasElement,
    opts: OrbitEngineOptions,
    fallbackEl: HTMLElement | null = null,
  ) {
    this.root = root;
    this.canvas = canvas;
    this.fallbackEl = fallbackEl;
    this.opts = this.normalize(opts);

    this.syncReducedMotion();
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.mediaQuery.addEventListener?.("change", this.onReducedMotion);
    }
    if (typeof document !== "undefined") {
      this.hidden = document.hidden;
      document.addEventListener("visibilitychange", this.onVisibility);
    }
    this.bindPointer();

    this.ctx = this.canvas.getContext("2d", { alpha: true });
    if (!this.ctx) this.enterFallback();
    this.rebuildScene();
    this.resize();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.disposed) return;
        this.resize();
        if (!this.running) this.drawFrame(this.time);
      });
      this.resizeObserver.observe(root);
    }
    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          this.offscreen = !(entries[0]?.isIntersecting ?? true);
          this.syncLoop();
        },
        { root: null, rootMargin: "32px", threshold: 0 },
      );
      this.intersectionObserver.observe(root);
    }
    this.syncLoop();
  }

  setOptions(partial: Partial<OrbitEngineOptions>) {
    const prev = this.opts;
    const next = this.normalize({ ...this.opts, ...partial });
    const rebuild =
      next.quality !== prev.quality ||
      JSON.stringify(next.planets) !== JSON.stringify(prev.planets);
    this.opts = next;
    this.syncReducedMotion();
    if (rebuild) this.rebuildScene();
    if (next.quality !== prev.quality) this.resize();
    if (this.mode === "static") this.applyFallbackCss();
    this.syncLoop();
    if (!this.running) this.drawFrame(this.time);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.unbindPointer();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.mediaQuery?.removeEventListener?.("change", this.onReducedMotion);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    this.ctx = null;
  }

  /* ───────────── setup ───────────── */

  private normalize(opts: OrbitEngineOptions): OrbitEngineOptions {
    return {
      centralColor: opts.centralColor?.trim() || DEFAULT_CENTRAL,
      centralSize: clampCentralSize(opts.centralSize),
      planets: normalizePlanets(opts.planets),
      showOrbitPaths: opts.showOrbitPaths !== false,
      orbitColor: opts.orbitColor?.trim() || DEFAULT_ORBIT,
      orbitOpacity: clamp01(opts.orbitOpacity),
      backgroundColor: opts.backgroundColor?.trim() || DEFAULT_BG,
      transparent: opts.transparent !== false,
      speed: clampSpeed(opts.speed),
      lightingIntensity: clamp01(opts.lightingIntensity),
      glowIntensity: clamp01(opts.glowIntensity),
      interaction: !!opts.interaction,
      interactionStrength: clamp01(opts.interactionStrength),
      quality: opts.quality === "low" || opts.quality === "high" ? opts.quality : "medium",
      paused: !!opts.paused,
      respectReducedMotion: opts.respectReducedMotion !== false,
      fallback: "static",
    };
  }

  private rebuildScene() {
    // Rings: decorative inner rings + one per unique planet radius
    const radii = new Set<number>(EXTRA_RINGS);
    for (const p of this.opts.planets) radii.add(Math.round(p.orbitRadius * 100) / 100);
    this.rings = Array.from(radii)
      .sort((a, b) => a - b)
      .map((radius, i) => ({ radius, bright: i % 3 === 1, gold: i % 4 === 2 }));

    this.planetRgb = this.opts.planets.map((p) => parseColor(p.color, "#7FB6EE"));

    // Deterministic flares (cyan + gold blobs riding the rings)
    const n = this.rings.length || 1;
    this.flareSeeds = [
      {
        radius: this.rings[Math.min(2, n - 1)]?.radius ?? 1,
        phase: 0.4,
        speed: 0.16,
        gold: true,
        size: 0.2,
      },
      {
        radius: this.rings[Math.min(4, n - 1)]?.radius ?? 1,
        phase: 2.2,
        speed: 0.13,
        gold: false,
        size: 0.22,
      },
      {
        radius: this.rings[Math.min(5, n - 1)]?.radius ?? 1,
        phase: 3.6,
        speed: 0.11,
        gold: false,
        size: 0.16,
      },
      {
        radius: this.rings[Math.min(7, n - 1)]?.radius ?? 1,
        phase: 5.0,
        speed: 0.09,
        gold: true,
        size: 0.24,
      },
      {
        radius: this.rings[Math.min(1, n - 1)]?.radius ?? 1,
        phase: 1.1,
        speed: 0.19,
        gold: false,
        size: 0.12,
      },
      {
        radius: this.rings[Math.min(3, n - 1)]?.radius ?? 1,
        phase: 4.3,
        speed: 0.15,
        gold: true,
        size: 0.14,
      },
    ];

    // Sparkles ride exactly on ring lines
    const count = SPARKLE_COUNT[this.opts.quality];
    this.sparkleSeeds = [];
    for (let i = 0; i < count; i++) {
      const ring = this.rings[(i * 3) % this.rings.length]!;
      this.sparkleSeeds.push({
        radius: ring.radius,
        phase: (i * 2.399) % TAU,
        seed: ((i * 53) % 100) / 100,
        kind: i % 5 === 0 ? 2 : i % 3 === 0 ? 0 : i % 2 === 0 ? 1 : 3,
      });
    }
  }

  private syncReducedMotion() {
    const prefers =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.reducedMotion = this.opts.respectReducedMotion && !!prefers;
  }

  private canAnimate() {
    return (
      this.mode === "canvas" &&
      !this.disposed &&
      !this.opts.paused &&
      !this.reducedMotion &&
      !this.hidden &&
      !this.offscreen
    );
  }
  private get glowAmt() {
    return Math.min(1.6, this.opts.glowIntensity * GLOW_BOOST);
  }

  private syncLoop() {
    if (this.canAnimate()) this.ensureLoop();
    else {
      this.stop();
      if (this.mode === "canvas") this.drawFrame(this.time);
    }
  }

  private enterFallback() {
    this.mode = "static";
    this.stop();
    this.canvas.style.display = "none";
    this.applyFallbackCss();
    if (this.fallbackEl) this.fallbackEl.style.display = "block";
  }

  private applyFallbackCss() {
    if (!this.fallbackEl) return;
    const central = parseColor(this.opts.centralColor, DEFAULT_CENTRAL);
    const orbit = parseColor(this.opts.orbitColor, DEFAULT_ORBIT);
    const bg = parseColor(this.opts.backgroundColor, DEFAULT_BG);
    const planets = this.opts.planets.map((p) => parseColor(p.color, "#7FB6EE"));
    this.fallbackEl.style.backgroundImage = staticOrbitCss(
      central,
      planets,
      orbit,
      bg,
      this.opts.transparent,
    );
  }

  private resize() {
    if (this.mode !== "canvas") return;
    const rect = this.root.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));
    const deviceDpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    let dpr = Math.min(deviceDpr, QUALITY_DPR[this.opts.quality]);
    if (cssW * cssH * dpr * dpr > MAX_PIXELS) dpr = Math.sqrt(MAX_PIXELS / (cssW * cssH));
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = dpr;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    const bw = Math.max(1, Math.floor(cssW * dpr));
    const bh = Math.max(1, Math.floor(cssH * dpr));
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }
  }

  /* ───────────── pointer ───────────── */

  private bindPointer() {
    this.root.addEventListener("pointerenter", this.onPointerEnter);
    this.root.addEventListener("pointermove", this.onPointerMove);
    this.root.addEventListener("pointerleave", this.onPointerLeave);
    this.root.addEventListener("pointercancel", this.onPointerLeave);
  }

  private unbindPointer() {
    this.root.removeEventListener("pointerenter", this.onPointerEnter);
    this.root.removeEventListener("pointermove", this.onPointerMove);
    this.root.removeEventListener("pointerleave", this.onPointerLeave);
    this.root.removeEventListener("pointercancel", this.onPointerLeave);
  }

  private readonly onPointerEnter = (e: PointerEvent) => {
    this.pointerInside = true;
    this.updatePointer(e);
  };
  private readonly onPointerMove = (e: PointerEvent) => {
    this.pointerInside = true;
    this.updatePointer(e);
    if (!this.running && this.canAnimate()) this.ensureLoop();
  };
  private readonly onPointerLeave = () => {
    this.pointerInside = false;
    this.pointerTarget.x = 0;
    this.pointerTarget.y = 0;
  };

  private updatePointer(e: PointerEvent) {
    if (!this.opts.interaction || this.reducedMotion) return;
    const rect = this.root.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    this.pointerTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  /* ───────────── loop ───────────── */

  private ensureLoop() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTs = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private readonly tick = (now: number) => {
    if (this.disposed || !this.running) return;
    const dt = this.lastTs ? Math.min(0.05, (now - this.lastTs) / 1000) : 0.016;
    this.lastTs = now;
    if (!this.opts.paused && !this.reducedMotion) this.time += dt;

    const lerp = 1 - Math.exp(-dt * 8);
    const active = this.opts.interaction && this.pointerInside && !this.reducedMotion;
    this.pointerSmooth.x += ((active ? this.pointerTarget.x : 0) - this.pointerSmooth.x) * lerp;
    this.pointerSmooth.y += ((active ? this.pointerTarget.y : 0) - this.pointerSmooth.y) * lerp;

    this.drawFrame(this.time);

    if (!this.canAnimate()) {
      this.running = false;
      this.rafId = 0;
      return;
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  /* ───────────── drawing ───────────── */

  /** Rotating spiral arms that give the whole disc a swirling vortex look. */
  private drawVortex(time: number) {
    const ctx = this.ctx!;
    const g = this.geo;
    const glow = this.glowAmt;
    const orbit = lighten(parseColor(this.opts.orbitColor, DEFAULT_ORBIT), 0.3);
    const central = parseColor(this.opts.centralColor, DEFAULT_CENTRAL);
    const rot = time * 0.32 * this.opts.speed;
    const arms = 4;
    const steps = 48;

    ctx.save();
    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.tilt);
    ctx.scale(1, g.aspect);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    for (let a = 0; a < arms; a++) {
      const base = (a / arms) * TAU + rot;
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        const r0 = (0.45 + t0 * 1.9) * g.unit;
        const r1 = (0.45 + t1 * 1.9) * g.unit;
        const a0 = base - t0 * 3.4; // trailing spiral
        const a1 = base - t1 * 3.4;
        const fade = Math.sin(t0 * Math.PI);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
        ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
        ctx.lineWidth = 26;
        ctx.strokeStyle = rgba(central, 0.045 * fade * glow);
        ctx.stroke();
        ctx.lineWidth = 7;
        ctx.strokeStyle = rgba(orbit, 0.09 * fade * glow);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  private drawFrame(time: number) {
    const ctx = this.ctx;
    if (this.mode !== "canvas" || !ctx) return;
    const W = this.cssW;
    const H = this.cssH;

    const k = this.opts.interactionStrength;
    const px = this.pointerSmooth.x;
    const py = this.pointerSmooth.y;
    const tilt = TILT + px * k * 0.1;
    this.geo = {
      cx: W / 2 + px * k * W * 0.02,
      cy: H / 2 - py * k * H * 0.02,
      unit: Math.min(W * 0.195, H * 0.5),
      aspect: ASPECT + py * k * 0.06,
      tilt,
      cos: Math.cos(tilt),
      sin: Math.sin(tilt),
    };

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    if (!this.opts.transparent) {
      ctx.fillStyle = rgba(parseColor(this.opts.backgroundColor, DEFAULT_BG), 1);
      ctx.fillRect(0, 0, W, H);
    }

    this.drawNebula();
    this.drawVortex(time);
    if (this.opts.showOrbitPaths) this.drawRings("back", time);
    this.drawPlanets("back", time);
    this.drawFlares("back", time);
    this.drawCentral();
    if (this.opts.showOrbitPaths) this.drawRings("front", time);
    this.drawPlanets("front", time);
    this.drawFlares("front", time);
    this.drawSparkles(time);
  }

  /** Big soft elliptical disc behind everything. */
  private drawNebula() {
    const ctx = this.ctx!;
    const g = this.geo;
    const glow = this.glowAmt;
    const c = parseColor(this.opts.centralColor, DEFAULT_CENTRAL);
    const R = g.unit * 2.45;
    ctx.save();
    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.tilt);
    ctx.scale(1, g.aspect);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    grad.addColorStop(0, rgba(c, 0.55 * glow));
    grad.addColorStop(0.35, rgba({ r: 30, g: 130, b: 220 }, 0.38 * glow));
    grad.addColorStop(0.75, rgba({ r: 25, g: 70, b: 170 }, 0.3 * glow));
    grad.addColorStop(1, rgba({ r: 25, g: 60, b: 150 }, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  /** Thin concentric ellipses; `back` is the far half, `front` the near half. */
  private drawRings(half: Half, time: number) {
    const ctx = this.ctx!;
    const g = this.geo;
    const orbit = parseColor(this.opts.orbitColor, DEFAULT_ORBIT);
    const op = this.opts.orbitOpacity;
    const glow = this.glowAmt;
    const big = g.unit * 6;

    ctx.save();
    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.tilt);
    ctx.beginPath();
    if (half === "back") ctx.rect(-big, -big, big * 2, big);
    else ctx.rect(-big, 0, big * 2, big);
    ctx.clip();

    for (const ring of this.rings) {
      const rx = ring.radius * g.unit;
      const ry = rx * g.aspect;

      if (ring.bright) {
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
        ctx.lineWidth = 8;
        ctx.strokeStyle = rgba(orbit, 0.12 * glow * op * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
      ctx.lineWidth = ring.bright ? 1.8 : 1;
      ctx.strokeStyle = rgba(
        lighten(orbit, ring.bright ? 0.25 : 0),
        op * (ring.bright ? 1.1 : 0.55),
      );
      ctx.stroke();

      if (ring.gold) {
        const start = orbitTheta(ring.radius * 3, 1, 0.3, ring.radius, this.opts.speed, time);
        const len = 1.7;
        const seg = 16;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        for (let i = 0; i < seg; i++) {
          const a0 = start + (i / seg) * len;
          const a1 = start + ((i + 1) / seg) * len + 0.01;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, a0, a1);
          ctx.strokeStyle = rgba(GOLD, 0.9 * Math.sin((i / seg) * Math.PI) * Math.min(1, op * 1.8));
          ctx.stroke();
        }
      }
    }

    // Planet trails: a fading streak along the ring, behind each planet
    this.opts.planets.forEach((p, i) => {
      const sign = p.direction === "counterclockwise" ? -1 : 1;
      const theta = orbitTheta(p.phase, sign, p.orbitSpeed, p.orbitRadius, this.opts.speed, time);
      const rx = p.orbitRadius * g.unit;
      const ry = rx * g.aspect;
      const c = lighten(this.planetRgb[i]!, 0.25);
      const len = 1.1;
      const seg = 14;
      ctx.lineCap = "round";
      ctx.lineWidth = 2.2;
      for (let k = 0; k < seg; k++) {
        const t0 = k / seg;
        const t1 = (k + 1) / seg;
        // t = 1 is at the planet, 0 is the tail end
        const a0 = theta - sign * len * (1 - t0);
        const a1 = theta - sign * len * (1 - t1);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, Math.min(a0, a1), Math.max(a0, a1));
        ctx.strokeStyle = rgba(c, 0.55 * t0 * t0 * Math.min(1, glow));
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  /** Half-dome glass planets: bright top, translucent bottom. */
  private drawPlanets(half: Half, time: number) {
    const ctx = this.ctx!;
    const g = this.geo;
    const pt = this.pt;
    const glowI = this.glowAmt;
    const light = this.opts.lightingIntensity;

    this.opts.planets.forEach((p, i) => {
      const sign = p.direction === "counterclockwise" ? -1 : 1;
      const theta = orbitTheta(p.phase, sign, p.orbitSpeed, p.orbitRadius, this.opts.speed, time);
      project(g, p.orbitRadius, theta, pt);
      const front = pt.s > 0;
      if ((half === "front") !== front) return;

      const c = this.planetRgb[i]!;
      const r = p.size * g.unit * 0.78 * (1 + 0.18 * pt.s);

      // soft halo
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(pt.x, pt.y, r * 0.4, pt.x, pt.y, r * 3.6);
      halo.addColorStop(0, rgba(c, 0.7 * (p.glow ?? 0.35) * glowI));
      halo.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r * 3.6, 0, TAU);
      ctx.fill();
      ctx.restore();

      // dome body
      ctx.save();
      ctx.globalAlpha = front ? 1 : 0.8;
      const body = ctx.createLinearGradient(pt.x, pt.y - r, pt.x, pt.y + r);
      body.addColorStop(0, rgba(lighten(c, 0.35 * light + 0.1), 0.98));
      body.addColorStop(0.5, rgba(c, 0.85));
      body.addColorStop(1, rgba(c, 0.12));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, TAU);
      ctx.fill();

      // rim highlight on the dome
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.5, r - 0.6), Math.PI * 1.08, Math.PI * 1.92);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba({ r: 255, g: 255, b: 255 }, 0.35 * light + 0.1);
      ctx.stroke();
      ctx.restore();
    });
  }

  /** Large glassy dome with a bright cyan base and warm top highlight. */
  private drawCentral() {
    const ctx = this.ctx!;
    const g = this.geo;
    const c = parseColor(this.opts.centralColor, DEFAULT_CENTRAL);
    const light = this.opts.lightingIntensity;
    const glow = this.glowAmt;
    const R = g.unit * 0.4 * this.opts.centralSize;
    const x = g.cx;
    const y = g.cy - R * 0.22;

    // under-glow
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(x, y + R * 0.4);
    ctx.scale(1.7, 0.85);
    const under = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.5);
    under.addColorStop(0, rgba(c, 0.6 * glow));
    under.addColorStop(0.5, rgba(c, 0.2 * glow));
    under.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = under;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.5, 0, TAU);
    ctx.fill();
    ctx.restore();

    // outer glass shell
    ctx.beginPath();
    ctx.arc(x, y, R * 1.05, 0, TAU);
    ctx.fillStyle = rgba({ r: 255, g: 255, b: 255 }, 0.07);
    ctx.fill();

    // body
    const body = ctx.createLinearGradient(x, y - R, x, y + R);
    body.addColorStop(0, rgba(lighten(c, 0.8), 0.55 + 0.35 * light));
    body.addColorStop(0.45, rgba(lighten(c, 0.35), 0.6));
    body.addColorStop(1, rgba(c, 0.95));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.fill();

    // inner lighting, clipped to the dome
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.clip();
    const hi = ctx.createRadialGradient(
      x - R * 0.15,
      y - R * 0.55,
      0,
      x - R * 0.15,
      y - R * 0.55,
      R * 0.65,
    );
    hi.addColorStop(0, rgba({ r: 255, g: 240, b: 170 }, 0.6 * light));
    hi.addColorStop(1, rgba({ r: 255, g: 240, b: 170 }, 0));
    ctx.fillStyle = hi;
    ctx.fillRect(x - R, y - R, R * 2, R * 2);

    ctx.globalCompositeOperation = "lighter";
    const base = ctx.createRadialGradient(x, y + R * 0.6, 0, x, y + R * 0.6, R * 0.95);
    base.addColorStop(0, rgba(c, 0.85 * glow));
    base.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = base;
    ctx.fillRect(x - R, y - R, R * 2, R * 2);
    ctx.restore();

    // top rim
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, R - 0.6), Math.PI * 1.05, Math.PI * 1.95);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = rgba({ r: 255, g: 255, b: 255 }, 0.3);
    ctx.stroke();
  }

  /** Elongated cyan / gold light blobs riding along the rings. */
  private drawFlares(half: Half, time: number) {
    const ctx = this.ctx!;
    const g = this.geo;
    const pt = this.pt;
    const glow = this.glowAmt;
    const cyan = lighten(parseColor(this.opts.orbitColor, DEFAULT_ORBIT), 0.35);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const f of this.flareSeeds) {
      const theta = orbitTheta(f.phase, 1, f.speed, f.radius, this.opts.speed, time);
      project(g, f.radius, theta, pt);
      if ((half === "front") !== pt.s > 0) continue;

      const col = f.gold ? GOLD : cyan;
      const angle = Math.atan2(g.aspect * Math.cos(theta), -Math.sin(theta)) + g.tilt;
      const s = f.size * g.unit * (0.8 + glow * 0.4);

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(angle);
      ctx.scale(1, 0.38);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      grad.addColorStop(0, rgba(lighten(col, 0.5), 0.95 * glow));
      grad.addColorStop(0.3, rgba(col, 0.55 * glow));
      grad.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  /** Tiny twinkling dots scattered around the rings. */
  private drawSparkles(time: number) {
    const ctx = this.ctx!;
    const g = this.geo;
    const pt = this.pt;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const s of this.sparkleSeeds) {
      const theta = orbitTheta(s.phase, 1, 0.25, s.radius, this.opts.speed, time);
      project(g, s.radius, theta, pt);
      const tw = 0.55 + 0.45 * Math.sin(time * 2.2 + s.seed * 40);
      const col = SPARKLE_COLORS[s.kind]!;
      const r = 1 + s.seed * 1.4;

      ctx.fillStyle = rgba(col, 0.35 * tw * Math.min(1.3, this.glowAmt));
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r * 4.5, 0, TAU);
      ctx.fill();

      ctx.fillStyle = rgba(lighten(col, 0.4), 0.95 * tw);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}
