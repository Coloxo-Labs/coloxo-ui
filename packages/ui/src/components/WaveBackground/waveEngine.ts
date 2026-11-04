import { WAVE_VERT_WEBGL1, WAVE_VERT_WEBGL2 } from "./shaders/waveVert";
import { WAVE_FRAG_WEBGL1, WAVE_FRAG_WEBGL2 } from "./shaders/waveFrag";
import { CanvasWaveFallback, staticGradientCss, type FallbackRgb } from "./waveFallback";

export type WaveEngineOptions = {
  colors: string[];
  backgroundColor: string;
  speed: number;
  amplitude: number;
  frequency: number;
  complexity: number;
  intensity: number;
  interaction: boolean;
  interactionStrength: number;
  interactionRadius: number;
  interactionDecay: number;
  quality: "low" | "medium" | "high";
  fallback: "static" | "canvas";
  paused: boolean;
  respectReducedMotion: boolean;
  transparent: boolean;
};

type Rgb = FallbackRgb;

type UniformLocs = {
  uTime: WebGLUniformLocation | null;
  uAmplitude: WebGLUniformLocation | null;
  uFrequency: WebGLUniformLocation | null;
  uSpeed: WebGLUniformLocation | null;
  uComplexity: WebGLUniformLocation | null;
  uPointer: WebGLUniformLocation | null;
  uInteractionRadius: WebGLUniformLocation | null;
  uInteractionStrength: WebGLUniformLocation | null;
  uAspect: WebGLUniformLocation | null;
  uColor0: WebGLUniformLocation | null;
  uColor1: WebGLUniformLocation | null;
  uColor2: WebGLUniformLocation | null;
  uHighlight: WebGLUniformLocation | null;
  uIntensity: WebGLUniformLocation | null;
  uBg: WebGLUniformLocation | null;
  uTransparent: WebGLUniformLocation | null;
};

const DEFAULT_COLORS = ["#2563FF", "#22D3EE", "#8B5CF6"];
const DEFAULT_BG = "#050816";
const HIGHLIGHT = { r: 200, g: 230, b: 255 };
const MAX_PIXELS = 1_800_000;

const QUALITY_DPR: Record<WaveEngineOptions["quality"], number> = {
  low: 1,
  medium: 1.35,
  high: 1.5,
};

const QUALITY_MESH: Record<WaveEngineOptions["quality"], [number, number]> = {
  low: [48, 28],
  medium: [80, 48],
  high: [112, 64],
};

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

export function clampFrequency(n: number): number {
  return clamp(n, 0.25, 2);
}

export function clampRadius(n: number): number {
  return clamp(n, 0.05, 0.6);
}

export function clampDecay(n: number): number {
  return clamp(n, 0.1, 1);
}

export function sanitizeColors(colors: string[] | undefined): string[] {
  const list = (colors ?? []).map((c) => (typeof c === "string" ? c.trim() : "")).filter(Boolean);
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

function buildPalette(colors: string[]): Rgb[] {
  const parsed = colors.map(parseColor).filter((c): c is Rgb => c != null);
  if (parsed.length > 0) return parsed;
  return DEFAULT_COLORS.map((c) => parseColor(c)!);
}

function rgbNorm(c: Rgb): [number, number, number] {
  return [c.r / 255, c.g / 255, c.b / 255];
}

export { DEFAULT_COLORS, DEFAULT_BG };

export class WaveEngine {
  private root: HTMLElement;
  private canvas: HTMLCanvasElement;
  private fallbackEl: HTMLElement | null;
  private opts: WaveEngineOptions;
  private palette: Rgb[] = [];
  private bg: Rgb = { r: 5, g: 8, b: 22 };

  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private isWebGL2 = false;
  private program: WebGLProgram | null = null;
  private vbo: WebGLBuffer | null = null;
  private ibo: WebGLBuffer | null = null;
  private indexCount = 0;
  private aPos = 0;
  private uniforms: UniformLocs | null = null;
  private meshQuality: WaveEngineOptions["quality"] | null = null;

  private mode: "webgl" | "canvas" | "static" = "webgl";
  private canvasFallback: CanvasWaveFallback | null = null;
  private fallbackEntered = false;

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
  private dpr = 1;

  private pointerTarget = { x: 0, y: 0 };
  private pointerSmooth = { x: 0, y: 0 };
  private strengthTarget = 0;
  private strengthSmooth = 0;
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
  private readonly onContextLost = (e: Event) => {
    e.preventDefault();
    this.stop();
    this.releaseGpu(false);
  };
  private readonly onContextRestored = () => {
    if (this.disposed) return;
    if (!this.initWebGL()) {
      this.enterFallback();
      return;
    }
    this.resize();
    this.syncLoop();
  };

  constructor(
    root: HTMLElement,
    canvas: HTMLCanvasElement,
    opts: WaveEngineOptions,
    fallbackEl: HTMLElement | null = null,
  ) {
    this.root = root;
    this.canvas = canvas;
    this.fallbackEl = fallbackEl;
    this.opts = this.normalize(opts);
    this.applyPalette();

    this.syncReducedMotion();
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.mediaQuery.addEventListener?.("change", this.onReducedMotion);
    }
    if (typeof document !== "undefined") {
      this.hidden = document.hidden;
      document.addEventListener("visibilitychange", this.onVisibility);
    }

    this.canvas.addEventListener("webglcontextlost", this.onContextLost, false);
    this.canvas.addEventListener("webglcontextrestored", this.onContextRestored, false);

    this.bindPointer();

    if (!this.initWebGL()) {
      this.enterFallback();
    }

    this.resize();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.disposed) return;
        this.resize();
        // Paint a frame whenever the loop is stopped so lazy/card mounts
        // recover after a zero-size first layout or offscreen IO false-negative.
        if (!this.running) this.drawStatic();
      });
      this.resizeObserver.observe(root);
    }

    if (typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const intersecting = entries[0]?.isIntersecting ?? true;
          this.offscreen = !intersecting;
          if (intersecting) this.resize();
          this.syncLoop();
        },
        { root: null, rootMargin: "32px", threshold: 0 },
      );
      this.intersectionObserver.observe(root);
    }

    this.syncLoop();
  }

  /** Whether the engine is using WebGL (vs fallback). */
  get usingWebGL(): boolean {
    return this.mode === "webgl" && this.gl != null;
  }

  /** Current interaction strength (for tests). */
  get interactionStrengthSmooth(): number {
    return this.strengthSmooth;
  }

  setOptions(partial: Partial<WaveEngineOptions>) {
    const prev = this.opts;
    const next = this.normalize({ ...this.opts, ...partial });
    const qualityChanged = next.quality !== prev.quality;
    const colorsChanged =
      next.colors.length !== prev.colors.length ||
      next.colors.some((c, i) => c !== prev.colors[i]) ||
      next.backgroundColor !== prev.backgroundColor;

    this.opts = next;
    if (colorsChanged) this.applyPalette();
    this.syncReducedMotion();

    if (this.mode === "webgl") {
      if (qualityChanged) {
        this.resize();
        this.buildMesh(next.quality);
      }
    } else if (this.mode === "canvas" && this.canvasFallback) {
      this.canvasFallback.setOptions({
        colors: this.palette,
        background: this.bg,
        transparent: next.transparent,
        speed: next.speed,
        amplitude: next.amplitude,
      });
    } else if (this.mode === "static") {
      this.paintStaticFallback();
    }

    this.syncLoop();
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.unbindPointer();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.mediaQuery?.removeEventListener?.("change", this.onReducedMotion);
    this.mediaQuery = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost, false);
    this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored, false);
    this.canvasFallback?.dispose();
    this.canvasFallback = null;
    // Do not loseContext on unmount — a lost canvas can never get a new WebGL
    // context, which breaks React Strict Mode remounts on the same node.
    this.releaseGpu(false);
  }

  private normalize(opts: WaveEngineOptions): WaveEngineOptions {
    return {
      ...opts,
      colors: sanitizeColors(opts.colors),
      backgroundColor:
        typeof opts.backgroundColor === "string" && opts.backgroundColor.trim()
          ? opts.backgroundColor.trim()
          : DEFAULT_BG,
      speed: clampSpeed(opts.speed ?? 1),
      amplitude: clamp01(opts.amplitude ?? 0.45),
      frequency: clampFrequency(opts.frequency ?? 1),
      complexity: clamp01(opts.complexity ?? 0.55),
      intensity: clamp01(opts.intensity ?? 0.7),
      interaction: opts.interaction !== false,
      interactionStrength: clamp01(opts.interactionStrength ?? 0.65),
      interactionRadius: clampRadius(opts.interactionRadius ?? 0.22),
      interactionDecay: clampDecay(opts.interactionDecay ?? 0.55),
      quality: opts.quality === "low" || opts.quality === "high" ? opts.quality : "medium",
      fallback: opts.fallback === "canvas" ? "canvas" : "static",
      paused: Boolean(opts.paused),
      respectReducedMotion: opts.respectReducedMotion !== false,
      transparent: opts.transparent !== false,
    };
  }

  private applyPalette() {
    this.palette = buildPalette(this.opts.colors);
    this.bg = parseColor(this.opts.backgroundColor) ?? parseColor(DEFAULT_BG)!;
  }

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

  private canAnimate(): boolean {
    if (this.disposed || this.opts.paused || this.reducedMotion || this.hidden || this.offscreen) {
      return false;
    }
    if (this.mode === "webgl") return Boolean(this.gl && this.program);
    if (this.mode === "canvas") return Boolean(this.canvasFallback);
    return false;
  }

  private syncLoop() {
    if (this.mode === "static") {
      this.stop();
      this.paintStaticFallback();
      return;
    }
    if (this.reducedMotion || this.opts.paused) {
      this.stop();
      this.drawStatic();
      return;
    }
    if (this.canAnimate()) this.ensureLoop();
    else {
      this.stop();
      this.drawStatic();
    }
  }

  private initWebGL(): boolean {
    this.releaseGpu(false);
    const attrs: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "default",
    };

    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let is2 = false;
    try {
      gl = this.canvas.getContext("webgl2", attrs) as WebGL2RenderingContext | null;
      if (gl) is2 = true;
    } catch {
      gl = null;
    }
    if (!gl) {
      try {
        gl =
          (this.canvas.getContext("webgl", attrs) as WebGLRenderingContext | null) ||
          (this.canvas.getContext("experimental-webgl", attrs) as WebGLRenderingContext | null);
      } catch {
        gl = null;
      }
    }
    if (!gl) return false;

    this.gl = gl;
    this.isWebGL2 = is2;

    const vertSrc = is2 ? WAVE_VERT_WEBGL2 : WAVE_VERT_WEBGL1;
    const fragSrc = is2 ? WAVE_FRAG_WEBGL2 : WAVE_FRAG_WEBGL1;
    const program = this.createProgram(vertSrc, fragSrc);
    if (!program) {
      this.releaseGpu(true);
      return false;
    }
    this.program = program;
    this.aPos = gl.getAttribLocation(program, "aPos");
    this.uniforms = {
      uTime: gl.getUniformLocation(program, "uTime"),
      uAmplitude: gl.getUniformLocation(program, "uAmplitude"),
      uFrequency: gl.getUniformLocation(program, "uFrequency"),
      uSpeed: gl.getUniformLocation(program, "uSpeed"),
      uComplexity: gl.getUniformLocation(program, "uComplexity"),
      uPointer: gl.getUniformLocation(program, "uPointer"),
      uInteractionRadius: gl.getUniformLocation(program, "uInteractionRadius"),
      uInteractionStrength: gl.getUniformLocation(program, "uInteractionStrength"),
      uAspect: gl.getUniformLocation(program, "uAspect"),
      uColor0: gl.getUniformLocation(program, "uColor0"),
      uColor1: gl.getUniformLocation(program, "uColor1"),
      uColor2: gl.getUniformLocation(program, "uColor2"),
      uHighlight: gl.getUniformLocation(program, "uHighlight"),
      uIntensity: gl.getUniformLocation(program, "uIntensity"),
      uBg: gl.getUniformLocation(program, "uBg"),
      uTransparent: gl.getUniformLocation(program, "uTransparent"),
    };

    if (!this.buildMesh(this.opts.quality)) {
      this.releaseGpu(true);
      return false;
    }

    this.mode = "webgl";
    this.fallbackEntered = false;
    if (this.fallbackEl) {
      this.fallbackEl.style.display = "none";
      this.fallbackEl.style.backgroundImage = "";
    }
    this.canvas.style.display = "block";
    return true;
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram | null {
    const gl = this.gl;
    if (!gl) return null;
    const vs = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      return null;
    }
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    if (!gl) return null;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private buildMesh(quality: WaveEngineOptions["quality"]): boolean {
    const gl = this.gl;
    if (!gl || !this.program) return false;

    const [cols, rows] = QUALITY_MESH[quality];
    const positions = new Float32Array((cols + 1) * (rows + 1) * 2);
    let pi = 0;
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        positions[pi++] = (x / cols) * 2 - 1;
        positions[pi++] = (y / rows) * 2 - 1;
      }
    }

    const indices = new Uint16Array(cols * rows * 6);
    let ii = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * (cols + 1) + x;
        indices[ii++] = i;
        indices[ii++] = i + 1;
        indices[ii++] = i + cols + 1;
        indices[ii++] = i + 1;
        indices[ii++] = i + cols + 2;
        indices[ii++] = i + cols + 1;
      }
    }

    if (this.vbo) gl.deleteBuffer(this.vbo);
    if (this.ibo) gl.deleteBuffer(this.ibo);

    this.vbo = gl.createBuffer();
    this.ibo = gl.createBuffer();
    if (!this.vbo || !this.ibo) return false;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    this.indexCount = indices.length;
    this.meshQuality = quality;
    return true;
  }

  private releaseGpu(loseContext: boolean) {
    const gl = this.gl;
    if (gl) {
      if (this.vbo) gl.deleteBuffer(this.vbo);
      if (this.ibo) gl.deleteBuffer(this.ibo);
      if (this.program) gl.deleteProgram(this.program);
      this.vbo = null;
      this.ibo = null;
      this.program = null;
      this.uniforms = null;
      this.meshQuality = null;
      if (loseContext) {
        const ext = gl.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      }
    }
    this.gl = null;
  }

  private enterFallback() {
    if (this.fallbackEntered && this.mode !== "webgl") return;
    this.fallbackEntered = true;
    this.stop();
    this.releaseGpu(false);

    if (this.opts.fallback === "canvas") {
      this.mode = "canvas";
      if (this.fallbackEl) {
        this.fallbackEl.style.display = "none";
      }
      this.canvas.style.display = "block";
      this.canvasFallback?.dispose();
      this.canvasFallback = new CanvasWaveFallback(this.canvas, {
        colors: this.palette,
        background: this.bg,
        transparent: this.opts.transparent,
        speed: this.opts.speed,
        amplitude: this.opts.amplitude,
      });
      this.canvasFallback.resize(this.cssW || 1, this.cssH || 1, Math.min(this.dpr, 1.25));
      this.syncLoop();
      return;
    }

    this.mode = "static";
    this.canvasFallback?.dispose();
    this.canvasFallback = null;
    this.paintStaticFallback();
  }

  private paintStaticFallback() {
    if (this.fallbackEl) {
      this.fallbackEl.style.display = "block";
      this.fallbackEl.style.backgroundImage = staticGradientCss(
        this.palette,
        this.bg,
        this.opts.transparent,
      );
      this.canvas.style.display = "none";
      return;
    }
    // Paint once via 2d if no fallback element
    const ctx = this.canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    this.canvas.style.display = "block";
    const w = this.canvas.width || 1;
    const h = this.canvas.height || 1;
    if (!this.opts.transparent) {
      ctx.fillStyle = `rgb(${this.bg.r},${this.bg.g},${this.bg.b})`;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }

  private resize() {
    const rect = this.root.getBoundingClientRect();
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));
    const deviceDpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    let dpr = Math.min(deviceDpr, QUALITY_DPR[this.opts.quality]);
    let bw = Math.max(1, Math.floor(cssW * dpr));
    let bh = Math.max(1, Math.floor(cssH * dpr));
    const pixels = bw * bh;
    if (pixels > MAX_PIXELS) {
      const factor = Math.sqrt(MAX_PIXELS / pixels);
      bw = Math.max(1, Math.floor(bw * factor));
      bh = Math.max(1, Math.floor(bh * factor));
      dpr = bw / cssW;
    }

    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = dpr;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;

    if (this.mode === "webgl" && this.gl) {
      if (this.canvas.width !== bw || this.canvas.height !== bh) {
        this.canvas.width = bw;
        this.canvas.height = bh;
      }
      this.gl.viewport(0, 0, bw, bh);
      if (this.meshQuality !== this.opts.quality) {
        this.buildMesh(this.opts.quality);
      }
    } else if (this.mode === "canvas" && this.canvasFallback) {
      this.canvasFallback.resize(cssW, cssH, Math.min(dpr, 1.25));
    } else if (this.mode === "static") {
      this.canvas.width = bw;
      this.canvas.height = bh;
      this.paintStaticFallback();
    }
  }

  private bindPointer() {
    // Capture so ripples still track while the pointer moves over children.
    this.root.addEventListener("pointerenter", this.onPointerEnter, true);
    this.root.addEventListener("pointermove", this.onPointerMove, true);
    this.root.addEventListener("pointerleave", this.onPointerLeave, true);
    this.root.addEventListener("pointercancel", this.onPointerLeave, true);
  }

  private unbindPointer() {
    this.root.removeEventListener("pointerenter", this.onPointerEnter, true);
    this.root.removeEventListener("pointermove", this.onPointerMove, true);
    this.root.removeEventListener("pointerleave", this.onPointerLeave, true);
    this.root.removeEventListener("pointercancel", this.onPointerLeave, true);
  }

  private readonly onPointerEnter = (e: PointerEvent) => {
    this.pointerInside = true;
    this.updatePointerFromEvent(e);
    if (this.opts.interaction && !this.reducedMotion) this.strengthTarget = 1;
  };

  private readonly onPointerMove = (e: PointerEvent) => {
    this.pointerInside = true;
    this.updatePointerFromEvent(e);
    if (this.opts.interaction && !this.reducedMotion) this.strengthTarget = 1;
    if (!this.running && this.canAnimate()) this.ensureLoop();
  };

  private readonly onPointerLeave = () => {
    this.pointerInside = false;
    this.strengthTarget = 0;
  };

  private updatePointerFromEvent(e: PointerEvent) {
    const rect = this.root.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    this.pointerTarget.x = clamp(nx, -1, 1);
    this.pointerTarget.y = clamp(ny, -1, 1);
  }

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
    if (!this.canAnimate()) {
      this.running = false;
      this.rafId = 0;
      this.drawStatic();
      return;
    }

    const dt = this.lastTs ? Math.min(0.05, (now - this.lastTs) / 1000) : 0.016;
    this.lastTs = now;
    this.time += dt;

    this.stepInteraction(dt);

    if (this.mode === "webgl") this.drawWebGL(this.time);
    else if (this.mode === "canvas") this.canvasFallback?.frame(this.time);

    this.rafId = requestAnimationFrame(this.tick);
  };

  private stepInteraction(dt: number) {
    if (!this.opts.interaction || this.reducedMotion) {
      this.strengthTarget = 0;
    }
    const posLerp = 1 - Math.exp(-dt * 10);
    this.pointerSmooth.x += (this.pointerTarget.x - this.pointerSmooth.x) * posLerp;
    this.pointerSmooth.y += (this.pointerTarget.y - this.pointerSmooth.y) * posLerp;

    const decay = this.opts.interactionDecay * 6;
    const rise = 10;
    const rate = this.pointerInside && this.strengthTarget > 0 ? rise : decay;
    const sLerp = 1 - Math.exp(-dt * rate);
    this.strengthSmooth += (this.strengthTarget - this.strengthSmooth) * sLerp;
    if (this.strengthSmooth < 0.001 && this.strengthTarget === 0) this.strengthSmooth = 0;
  }

  private drawStatic() {
    if (this.mode === "webgl") {
      this.stepInteraction(0);
      this.drawWebGL(this.time);
    } else if (this.mode === "canvas") {
      this.canvasFallback?.paintStatic();
    } else {
      this.paintStaticFallback();
    }
  }

  private drawWebGL(time: number) {
    const gl = this.gl;
    const program = this.program;
    const u = this.uniforms;
    if (!gl || !program || !u || !this.vbo || !this.ibo) return;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (this.opts.transparent) {
      gl.clearColor(0, 0, 0, 0);
    } else {
      const [r, g, b] = rgbNorm(this.bg);
      gl.clearColor(r, g, b, 1);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);

    const c0 = rgbNorm(this.palette[0] ?? { r: 37, g: 99, b: 255 });
    const c1 = rgbNorm(this.palette[1] ?? this.palette[0] ?? { r: 34, g: 211, b: 238 });
    const c2 = rgbNorm(
      this.palette[2] ?? this.palette[1] ?? this.palette[0] ?? { r: 139, g: 92, b: 246 },
    );
    const hi = rgbNorm(HIGHLIGHT);
    const bg = rgbNorm(this.bg);
    const aspect = this.cssW / Math.max(1, this.cssH);

    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uAmplitude, this.opts.amplitude);
    gl.uniform1f(u.uFrequency, this.opts.frequency);
    gl.uniform1f(u.uSpeed, this.opts.speed);
    gl.uniform1f(u.uComplexity, this.opts.complexity);
    gl.uniform3f(u.uPointer, this.pointerSmooth.x, this.pointerSmooth.y, this.strengthSmooth);
    gl.uniform1f(u.uInteractionRadius, this.opts.interactionRadius);
    gl.uniform1f(u.uInteractionStrength, this.opts.interactionStrength);
    gl.uniform1f(u.uAspect, aspect);
    gl.uniform3f(u.uColor0, c0[0], c0[1], c0[2]);
    gl.uniform3f(u.uColor1, c1[0], c1[1], c1[2]);
    gl.uniform3f(u.uColor2, c2[0], c2[1], c2[2]);
    gl.uniform3f(u.uHighlight, hi[0], hi[1], hi[2]);
    gl.uniform1f(u.uIntensity, this.opts.intensity);
    gl.uniform3f(u.uBg, bg[0], bg[1], bg[2]);
    gl.uniform1f(u.uTransparent, this.opts.transparent ? 1 : 0);

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  }
}
