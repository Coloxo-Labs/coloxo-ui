import { VORTEX_VERT_WEBGL1, VORTEX_VERT_WEBGL2 } from "./shaders/vortexVert";
import { VORTEX_FRAG_WEBGL1, VORTEX_FRAG_WEBGL2 } from "./shaders/vortexFrag";
import {
  FADE_FRAG_WEBGL1,
  FADE_FRAG_WEBGL2,
  FADE_VERT_WEBGL1,
  FADE_VERT_WEBGL2,
} from "./shaders/fadeShaders";

export type VortexEngineOptions = {
  particles: number;
  speed: number;
  range: number;
  colors: string[];
  intensity: number;
  trailPersistence: number;
  quality: "low" | "medium" | "high";
  centerX: number;
  centerY: number;
  paused: boolean;
  respectReducedMotion: boolean;
};

type Rgb = { r: number; g: number; b: number };

type ParticleUniforms = {
  uTime: WebGLUniformLocation | null;
  uSpeed: WebGLUniformLocation | null;
  uRange: WebGLUniformLocation | null;
  uIntensity: WebGLUniformLocation | null;
  uCenter: WebGLUniformLocation | null;
  uResolution: WebGLUniformLocation | null;
  uDpr: WebGLUniformLocation | null;
  uColor0: WebGLUniformLocation | null;
  uColor1: WebGLUniformLocation | null;
  uColor2: WebGLUniformLocation | null;
  uColor3: WebGLUniformLocation | null;
  uColorCount: WebGLUniformLocation | null;
};

const QUALITY_DPR: Record<VortexEngineOptions["quality"], number> = {
  low: 1,
  medium: 1.35,
  high: 1.5,
};

const QUALITY_PARTICLE_MULT: Record<VortexEngineOptions["quality"], number> = {
  low: 0.55,
  medium: 1,
  high: 1.35,
};

const MAX_PIXELS = 1_800_000;
const DEFAULT_COLORS = ["#2563FF", "#22D3EE", "#8B5CF6", "#EC4899"];
const DEFAULT_PARTICLES = 420;
const MIN_PARTICLES = 40;
const MAX_PARTICLES = 900;
const STRIDE_FLOATS = 8; // aSeed(4) + aAttr(4)

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
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

export function clampParticles(n: number): number {
  return Math.round(clamp(n, MIN_PARTICLES, MAX_PARTICLES));
}

export function clampSpeed(n: number): number {
  return clamp(n, 0.1, 3);
}

export function clampRange(n: number): number {
  return clamp(n, 0.25, 2);
}

function rgbNorm(c: Rgb): [number, number, number] {
  return [c.r / 255, c.g / 255, c.b / 255];
}

export { DEFAULT_COLORS, DEFAULT_PARTICLES };

/**
 * Native WebGL vortex — GPU-driven spiral particles with persistence trails.
 * No Three.js. Falls back to a light Canvas 2D glow field if WebGL fails.
 */
export class VortexEngine {
  private root: HTMLElement;
  private canvas: HTMLCanvasElement;
  private opts: VortexEngineOptions;
  private palette: Rgb[] = [];

  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private isWebGL2 = false;
  private mode: "webgl" | "canvas2d" = "webgl";
  private ctx2d: CanvasRenderingContext2D | null = null;

  private particleProgram: WebGLProgram | null = null;
  private fadeProgram: WebGLProgram | null = null;
  private particleUniforms: ParticleUniforms | null = null;
  private uFadeTex: WebGLUniformLocation | null = null;
  private uFadeAmount: WebGLUniformLocation | null = null;
  private aSeedLoc = 0;
  private aAttrLoc = 1;
  private aFadePos = 0;

  private particleVbo: WebGLBuffer | null = null;
  private fadeVbo: WebGLBuffer | null = null;
  private particleVao: WebGLVertexArrayObject | null = null;
  private fadeVao: WebGLVertexArrayObject | null = null;
  private particleCount = 0;
  private particleData: Float32Array | null = null;

  private fboA: WebGLFramebuffer | null = null;
  private fboB: WebGLFramebuffer | null = null;
  private texA: WebGLTexture | null = null;
  private texB: WebGLTexture | null = null;
  private fboW = 0;
  private fboH = 0;
  private writeA = true;

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
  private curSpeed = 1;

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
      this.enterCanvasFallback();
      return;
    }
    this.resize();
    this.syncLoop();
  };

  constructor(root: HTMLElement, canvas: HTMLCanvasElement, opts: VortexEngineOptions) {
    this.root = root;
    this.canvas = canvas;
    this.opts = this.normalize(opts);
    this.palette = buildPalette(this.opts.colors);
    this.curSpeed = this.opts.paused ? 0 : this.opts.speed;

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

    if (!this.initWebGL()) {
      this.enterCanvasFallback();
    }

    this.resize();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.disposed) return;
        this.resize();
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

  setOptions(partial: Partial<VortexEngineOptions>) {
    const prev = this.opts;
    const next = this.normalize({ ...this.opts, ...partial });
    const qualityChanged = next.quality !== prev.quality;
    const particlesChanged = next.particles !== prev.particles;
    const colorsChanged =
      next.colors.length !== prev.colors.length || next.colors.some((c, i) => c !== prev.colors[i]);

    this.opts = next;
    if (colorsChanged) this.palette = buildPalette(next.colors);
    this.syncReducedMotion();

    if (this.mode === "webgl") {
      if (qualityChanged) this.resize();
      if (qualityChanged || particlesChanged || colorsChanged) this.rebuildParticles();
    }

    this.syncLoop();
  }

  dispose() {
    this.disposed = true;
    this.stop();
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
    // Do not loseContext on unmount — a lost canvas can never get a new WebGL
    // context, which breaks React Strict Mode remounts on the same node.
    this.releaseGpu(false);
    this.ctx2d = null;
    this.particleData = null;
  }

  private normalize(opts: VortexEngineOptions): VortexEngineOptions {
    return {
      ...opts,
      particles: clampParticles(opts.particles ?? DEFAULT_PARTICLES),
      speed: clampSpeed(opts.speed ?? 1),
      range: clampRange(opts.range ?? 1),
      colors: sanitizeColors(opts.colors),
      intensity: clamp01(opts.intensity),
      trailPersistence: clamp01(opts.trailPersistence),
      centerX: clamp01(opts.centerX),
      centerY: clamp01(opts.centerY),
      paused: Boolean(opts.paused),
      respectReducedMotion: opts.respectReducedMotion !== false,
      quality: opts.quality === "low" || opts.quality === "high" ? opts.quality : "medium",
    };
  }

  private syncReducedMotion() {
    if (!this.opts.respectReducedMotion) {
      this.reducedMotion = false;
      return;
    }
    this.reducedMotion = this.mediaQuery ? this.mediaQuery.matches : false;
  }

  private canAnimate(): boolean {
    if (this.disposed || this.reducedMotion || this.hidden || this.offscreen) return false;
    if (this.opts.paused && this.curSpeed < 0.004) return false;
    if (this.mode === "webgl") return Boolean(this.gl && this.particleProgram);
    return Boolean(this.ctx2d);
  }

  private syncLoop() {
    if (this.reducedMotion) {
      this.stop();
      this.drawStatic();
      return;
    }
    if (this.canAnimate() || (this.opts.paused && this.curSpeed >= 0.004)) this.ensureLoop();
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
      preserveDrawingBuffer: false,
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
    this.mode = "webgl";

    const pProg = this.createProgram(
      is2 ? VORTEX_VERT_WEBGL2 : VORTEX_VERT_WEBGL1,
      is2 ? VORTEX_FRAG_WEBGL2 : VORTEX_FRAG_WEBGL1,
    );
    const fProg = this.createProgram(
      is2 ? FADE_VERT_WEBGL2 : FADE_VERT_WEBGL1,
      is2 ? FADE_FRAG_WEBGL2 : FADE_FRAG_WEBGL1,
    );
    if (!pProg || !fProg) {
      this.releaseGpu(true);
      return false;
    }
    this.particleProgram = pProg;
    this.fadeProgram = fProg;

    this.aSeedLoc = gl.getAttribLocation(pProg, "aSeed");
    this.aAttrLoc = gl.getAttribLocation(pProg, "aAttr");
    this.particleUniforms = {
      uTime: gl.getUniformLocation(pProg, "uTime"),
      uSpeed: gl.getUniformLocation(pProg, "uSpeed"),
      uRange: gl.getUniformLocation(pProg, "uRange"),
      uIntensity: gl.getUniformLocation(pProg, "uIntensity"),
      uCenter: gl.getUniformLocation(pProg, "uCenter"),
      uResolution: gl.getUniformLocation(pProg, "uResolution"),
      uDpr: gl.getUniformLocation(pProg, "uDpr"),
      uColor0: gl.getUniformLocation(pProg, "uColor0"),
      uColor1: gl.getUniformLocation(pProg, "uColor1"),
      uColor2: gl.getUniformLocation(pProg, "uColor2"),
      uColor3: gl.getUniformLocation(pProg, "uColor3"),
      uColorCount: gl.getUniformLocation(pProg, "uColorCount"),
    };
    this.uFadeTex = gl.getUniformLocation(fProg, "uTex");
    this.uFadeAmount = gl.getUniformLocation(fProg, "uFade");

    this.fadeVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fadeVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.aFadePos = gl.getAttribLocation(fProg, "aPos");
    if (is2) {
      const gl2 = gl as WebGL2RenderingContext;
      this.fadeVao = gl2.createVertexArray();
      gl2.bindVertexArray(this.fadeVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.fadeVbo);
      if (this.aFadePos >= 0) {
        gl.enableVertexAttribArray(this.aFadePos);
        gl.vertexAttribPointer(this.aFadePos, 2, gl.FLOAT, false, 0, 0);
      }
      gl2.bindVertexArray(null);
    }

    this.particleVbo = gl.createBuffer();
    if (!this.particleVbo) {
      this.releaseGpu(true);
      return false;
    }
    if (is2) {
      const gl2 = gl as WebGL2RenderingContext;
      this.particleVao = gl2.createVertexArray();
    }

    this.rebuildParticles();
    return true;
  }

  private enterCanvasFallback() {
    this.mode = "canvas2d";
    // Must lose the WebGL context before a 2D context can be created on this canvas.
    this.releaseGpu(true);
    this.ctx2d = this.canvas.getContext("2d", { alpha: true });
    this.ctx2d?.clearRect(0, 0, this.canvas.width || 1, this.canvas.height || 1);
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

  private targetParticleCount(): number {
    const area = Math.max(1, this.cssW * this.cssH);
    const areaScale = Math.sqrt(area / (960 * 540));
    const n =
      this.opts.particles * QUALITY_PARTICLE_MULT[this.opts.quality] * clamp(areaScale, 0.55, 1.35);
    return clampParticles(n);
  }

  private rebuildParticles() {
    const count = this.targetParticleCount();
    const data = new Float32Array(count * STRIDE_FLOATS);
    const nColors = Math.max(1, this.palette.length);
    for (let i = 0; i < count; i++) {
      const o = i * STRIDE_FLOATS;
      const inward = Math.random() > 0.18;
      data[o] = Math.random() * Math.PI * 2; // angle0
      data[o + 1] = Math.random(); // radiusNorm seed / phase offset
      data[o + 2] = (0.35 + Math.random() * 1.1) * (Math.random() > 0.5 ? 1 : -1) * 0.55; // omega
      data[o + 3] = inward ? -(0.08 + Math.random() * 0.35) : 0.05 + Math.random() * 0.18;
      data[o + 4] = 0.6 + Math.random() * 2.4; // size
      data[o + 5] = 0.28 + Math.random() * 0.62; // alpha
      data[o + 6] = Math.random(); // phase
      data[o + 7] = i % nColors; // color index
    }
    this.particleData = data;
    this.particleCount = count;

    const gl = this.gl;
    if (!gl || !this.particleVbo) return;
    if (this.isWebGL2 && this.particleVao) {
      (gl as WebGL2RenderingContext).bindVertexArray(this.particleVao);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const stride = STRIDE_FLOATS * 4;
    if (this.aSeedLoc >= 0) {
      gl.enableVertexAttribArray(this.aSeedLoc);
      gl.vertexAttribPointer(this.aSeedLoc, 4, gl.FLOAT, false, stride, 0);
    }
    if (this.aAttrLoc >= 0) {
      gl.enableVertexAttribArray(this.aAttrLoc);
      gl.vertexAttribPointer(this.aAttrLoc, 4, gl.FLOAT, false, stride, 16);
    }
    if (this.isWebGL2) {
      (gl as WebGL2RenderingContext).bindVertexArray(null);
    }
  }

  private ensureFbo(w: number, h: number): boolean {
    const gl = this.gl;
    if (!gl) return false;
    if (this.fboW === w && this.fboH === h && this.fboA && this.fboB) return true;
    this.destroyFbos();

    const make = () => {
      const tex = gl.createTexture();
      const fbo = gl.createFramebuffer();
      if (!tex || !fbo) return null;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (!ok) {
        gl.deleteTexture(tex);
        gl.deleteFramebuffer(fbo);
        return null;
      }
      return { tex, fbo };
    };

    const a = make();
    const b = make();
    if (!a || !b) {
      this.destroyFbos();
      return false;
    }
    this.texA = a.tex;
    this.fboA = a.fbo;
    this.texB = b.tex;
    this.fboB = b.fbo;
    this.fboW = w;
    this.fboH = h;
    this.writeA = true;

    // Clear both
    for (const fbo of [this.fboA, this.fboB]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return true;
  }

  private destroyFbos() {
    const gl = this.gl;
    if (!gl) return;
    if (this.texA) gl.deleteTexture(this.texA);
    if (this.texB) gl.deleteTexture(this.texB);
    if (this.fboA) gl.deleteFramebuffer(this.fboA);
    if (this.fboB) gl.deleteFramebuffer(this.fboB);
    this.texA = this.texB = null;
    this.fboA = this.fboB = null;
    this.fboW = this.fboH = 0;
  }

  private releaseGpu(loseContext: boolean) {
    const gl = this.gl;
    if (gl) {
      this.destroyFbos();
      if (this.isWebGL2) {
        const gl2 = gl as WebGL2RenderingContext;
        if (this.particleVao) gl2.deleteVertexArray(this.particleVao);
        if (this.fadeVao) gl2.deleteVertexArray(this.fadeVao);
      }
      if (this.particleVbo) gl.deleteBuffer(this.particleVbo);
      if (this.fadeVbo) gl.deleteBuffer(this.fadeVbo);
      if (this.particleProgram) gl.deleteProgram(this.particleProgram);
      if (this.fadeProgram) gl.deleteProgram(this.fadeProgram);
      this.particleVbo = this.fadeVbo = null;
      this.particleVao = this.fadeVao = null;
      this.particleProgram = this.fadeProgram = null;
      this.particleUniforms = null;
      if (loseContext) {
        const ext = gl.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      }
    }
    this.gl = null;
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

    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw;
      this.canvas.height = bh;
    }

    if (this.mode === "webgl" && this.gl) {
      if (!this.ensureFbo(bw, bh)) {
        this.enterCanvasFallback();
      } else if (this.particleCount !== this.targetParticleCount()) {
        this.rebuildParticles();
      }
    }
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

    const dt = this.lastTs ? Math.min(0.05, (now - this.lastTs) / 1000) : 0.016;
    this.lastTs = now;

    const targetSpeed = this.opts.paused || this.reducedMotion ? 0 : this.opts.speed;
    this.curSpeed += (targetSpeed - this.curSpeed) * (1 - Math.exp(-dt / 0.18));
    if (this.curSpeed < 0.004 && targetSpeed === 0) this.curSpeed = 0;

    this.time += dt * Math.max(this.curSpeed, 0);

    if (this.mode === "webgl") this.drawWebGL(this.time);
    else this.drawCanvas2d(this.time);

    if (!this.canAnimate() && !(this.opts.paused && this.curSpeed >= 0.004)) {
      this.running = false;
      this.rafId = 0;
      this.drawStatic();
      return;
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  private drawStatic() {
    if (this.mode === "webgl") this.drawWebGL(this.time);
    else this.drawCanvas2d(this.time);
  }

  private drawWebGL(time: number) {
    const gl = this.gl;
    const pProg = this.particleProgram;
    const fProg = this.fadeProgram;
    const u = this.particleUniforms;
    if (!gl || !pProg || !fProg || !u || !this.particleVbo) return;
    if (!this.ensureFbo(this.canvas.width, this.canvas.height)) {
      this.enterCanvasFallback();
      this.drawCanvas2d(time);
      return;
    }

    const readTex = this.writeA ? this.texB : this.texA;
    const writeFbo = this.writeA ? this.fboA : this.fboB;
    const writeTex = this.writeA ? this.texA : this.texB;
    if (!readTex || !writeFbo || !writeTex) return;

    const w = this.fboW;
    const h = this.fboH;

    // 1) Fade previous frame into write buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, writeFbo);
    gl.viewport(0, 0, w, h);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.useProgram(fProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readTex);
    gl.uniform1i(this.uFadeTex, 0);
    // Higher persistence → slower fade (closer to 1)
    const fade = 0.82 + this.opts.trailPersistence * 0.16;
    gl.uniform1f(this.uFadeAmount, fade);
    this.drawFullscreen(gl);
    // Clear path if fade wiped everything — still ok

    // 2) Draw particles additively into write buffer
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(pProg);
    if (this.isWebGL2 && this.particleVao) {
      (gl as WebGL2RenderingContext).bindVertexArray(this.particleVao);
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVbo);
      const stride = STRIDE_FLOATS * 4;
      if (this.aSeedLoc >= 0) {
        gl.enableVertexAttribArray(this.aSeedLoc);
        gl.vertexAttribPointer(this.aSeedLoc, 4, gl.FLOAT, false, stride, 0);
      }
      if (this.aAttrLoc >= 0) {
        gl.enableVertexAttribArray(this.aAttrLoc);
        gl.vertexAttribPointer(this.aAttrLoc, 4, gl.FLOAT, false, stride, 16);
      }
    }

    const c0 = rgbNorm(this.palette[0] ?? { r: 37, g: 99, b: 255 });
    const c1 = rgbNorm(this.palette[1] ?? this.palette[0]!);
    const c2 = rgbNorm(this.palette[2] ?? this.palette[0]!);
    const c3 = rgbNorm(this.palette[3] ?? this.palette[0]!);

    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uSpeed, Math.max(this.curSpeed, 0.001));
    gl.uniform1f(u.uRange, this.opts.range);
    gl.uniform1f(u.uIntensity, this.opts.intensity);
    gl.uniform2f(u.uCenter, this.opts.centerX, this.opts.centerY);
    gl.uniform2f(u.uResolution, this.cssW, this.cssH);
    gl.uniform1f(u.uDpr, this.dpr);
    gl.uniform3f(u.uColor0, c0[0], c0[1], c0[2]);
    gl.uniform3f(u.uColor1, c1[0], c1[1], c1[2]);
    gl.uniform3f(u.uColor2, c2[0], c2[1], c2[2]);
    gl.uniform3f(u.uColor3, c3[0], c3[1], c3[2]);
    gl.uniform1f(u.uColorCount, this.palette.length);

    gl.drawArrays(gl.POINTS, 0, this.particleCount);

    // 3) Blit to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(fProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, writeTex);
    gl.uniform1i(this.uFadeTex, 0);
    gl.uniform1f(this.uFadeAmount, 1);
    this.drawFullscreen(gl);

    this.writeA = !this.writeA;
  }

  private drawFullscreen(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    if (this.isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      if (!this.fadeVao) return;
      gl2.bindVertexArray(this.fadeVao);
      gl2.drawArrays(gl.TRIANGLES, 0, 3);
      gl2.bindVertexArray(null);
      return;
    }
    if (!this.fadeVbo) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fadeVbo);
    if (this.aFadePos >= 0) {
      gl.enableVertexAttribArray(this.aFadePos);
      gl.vertexAttribPointer(this.aFadePos, 2, gl.FLOAT, false, 0, 0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Lightweight Canvas 2D fallback — soft spiral dots, not a WebGL clone. */
  private drawCanvas2d(time: number) {
    const ctx = this.ctx2d;
    if (!ctx) return;
    const w = this.cssW;
    const h = this.cssH;
    if (w < 1 || h < 1) return;

    const fade = 1 - (0.08 + (1 - this.opts.trailPersistence) * 0.22);
    ctx.fillStyle = `rgba(0,0,0,${(1 - fade).toFixed(3)})`;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    const count = Math.min(this.targetParticleCount(), 280);
    const cx = this.opts.centerX * w;
    const cy = this.opts.centerY * h;
    const maxR = Math.hypot(w, h) * 0.55 * this.opts.range;
    const spd = Math.max(this.curSpeed, 0.001);

    for (let i = 0; i < count; i++) {
      const seed = i * 1.618;
      const omega = (0.4 + (i % 7) * 0.12) * (i % 2 === 0 ? 1 : -1);
      const radial = i % 5 === 0 ? 0.12 : -0.22;
      const phase = (seed % 1) * Math.PI * 2;
      const travel = time * spd * Math.abs(radial) * 0.55 + phase;
      const cycle = travel - Math.floor(travel);
      const rn = radial < 0 ? 1 - cycle * 0.92 : 0.08 + cycle * 0.92;
      const angle = seed + omega * time * spd * (1 + 0.8 * (1 - rn));
      const x = cx + Math.cos(angle) * rn * maxR;
      const y = cy + Math.sin(angle) * rn * maxR;
      const c = this.palette[i % this.palette.length]!;
      const r = (1.2 + (i % 5) * 0.6) * (0.7 + this.opts.intensity);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      const a = (0.25 + this.opts.intensity * 0.45) * (0.4 + (1 - rn) * 0.6);
      g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${a.toFixed(3)})`);
      g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
}
