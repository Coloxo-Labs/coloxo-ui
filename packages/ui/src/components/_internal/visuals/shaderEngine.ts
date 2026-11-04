import { VisualEngine, type FrameInfo, type SurfaceOptions } from "./visualEngine";

export type UniformKind = "1f" | "2f" | "3f" | "4f" | "1i" | "1fv" | "3fv";

export type UniformSpec = {
  name: string;
  kind: UniformKind;
  value: number | number[];
};

export type ShaderProgramSpec = {
  fragment: string;
  /** Fixed uniforms applied once per frame before `setFrameUniforms`. */
  uniforms?: UniformSpec[];
};

export const FULLSCREEN_VERTEX = `
attribute vec2 aPosition;
attribute vec2 aUv;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const GLSL_HEADER = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uPointer;
uniform vec2 uPointerPx;
uniform float uPointerInside;
`;

/**
 * Full-screen triangle shader surface. Every fragment-shader visual (lenses, ripple fields,
 * distortion fields, tunnels) is one draw call with a different program, so this owns the
 * boilerplate: context creation, program linking, uniform lookup, and the static quad.
 *
 * Subclasses supply the fragment source and per-frame uniforms and inherit resize, visibility,
 * offscreen, pointer and reduced-motion handling from `VisualEngine`.
 */
export abstract class ShaderEngine extends VisualEngine {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private locations = new Map<string, WebGLUniformLocation | null>();
  private fixedUniforms: UniformSpec[] = [];
  private ready = false;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, options: SurfaceOptions = {}) {
    super(container, canvas, options);
  }

  /** Fragment shader source including `GLSL_HEADER` plus any extra fixed uniforms. */
  protected abstract shader(): ShaderProgramSpec;

  /** Push props-driven uniforms. `uTime`, `uResolution`, `uDpr` and pointer values are automatic. */
  protected abstract setFrameUniforms(gl: WebGLRenderingContext, frame: FrameInfo): void;

  /** Draw a static substitute when WebGL is unavailable. */
  protected fallback(_frame: FrameInfo): void {}

  protected get context(): WebGLRenderingContext | null {
    return this.gl;
  }

  protected override init(): void {
    const attrs: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    };
    const gl =
      (this.canvas.getContext("webgl", attrs) as WebGLRenderingContext | null) ??
      (this.canvas.getContext("experimental-webgl", attrs) as WebGLRenderingContext | null);
    this.gl = gl;
    if (!gl) {
      this.ready = false;
      return;
    }
    this.compile();
  }

  protected override onResize(width: number, height: number, dpr: number): void {
    this.gl?.viewport(0, 0, Math.round(width * dpr), Math.round(height * dpr));
  }

  private compile(): void {
    const gl = this.gl;
    if (!gl) return;
    const spec = this.shader();

    const vertexShader = this.createShader(gl.VERTEX_SHADER, FULLSCREEN_VERTEX);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, spec.fragment);
    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      this.ready = false;
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      this.ready = false;
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      this.ready = false;
      return;
    }

    if (this.program) gl.deleteProgram(this.program);
    this.program = program;
    this.locations.clear();
    this.fixedUniforms = spec.uniforms ?? [];

    if (!this.buffer) this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 0, 3, -1, 2, 0, -1, 3, 0, 2]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.SCISSOR_TEST);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aPosition);
    const aUv = gl.getAttribLocation(program, "aUv");
    if (aUv >= 0) {
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
      gl.enableVertexAttribArray(aUv);
    }

    this.ready = true;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    if (!gl) return null;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[coloxo] shader compile failed:", gl.getShaderInfoLog(shader));
      }
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /** Cached uniform lookup; missing uniforms resolve to null and are skipped. */
  protected uniform(name: string): WebGLUniformLocation | null {
    if (!this.locations.has(name)) {
      const loc = this.program ? this.gl?.getUniformLocation(this.program, name) ?? null : null;
      this.locations.set(name, loc);
    }
    return this.locations.get(name) ?? null;
  }

  /** Apply a uniform spec. Exposed so a generic shader surface can push prop-driven values. */
  protected applyUniform(uniform: UniformSpec): void {
    this.applyFixed(uniform);
  }

  private applyFixed(uniform: UniformSpec): void {
    const gl = this.gl;
    const loc = this.uniform(uniform.name);
    if (!gl || !loc) return;
    const { value, kind } = uniform;
    const array = Array.isArray(value) ? value : [value];

    switch (kind) {
      case "1i":
        gl.uniform1i(loc, array[0] ?? 0);
        return;
      case "1f":
        gl.uniform1f(loc, array[0] ?? 0);
        return;
      case "1fv":
        gl.uniform1fv(loc, new Float32Array(array));
        return;
      case "3fv":
        gl.uniform3fv(loc, new Float32Array(array));
        return;
      case "2f":
        gl.uniform2f(loc, array[0] ?? 0, array[1] ?? 0);
        return;
      case "3f":
        gl.uniform3f(loc, array[0] ?? 0, array[1] ?? 0, array[2] ?? 0);
        return;
      default:
        gl.uniform4f(loc, array[0] ?? 0, array[1] ?? 0, array[2] ?? 0, array[3] ?? 0);
    }
  }

  /** Re-link after the caller changed shader-affecting props. */
  protected rebuild(): void {
    if (this.gl) this.compile();
  }

  protected draw(frame: FrameInfo): void {
    const gl = this.gl;
    if (!gl || !this.program) {
      this.fallback(frame);
      return;
    }

    gl.useProgram(this.program);
    gl.viewport(0, 0, Math.round(frame.width * frame.dpr), Math.round(frame.height * frame.dpr));
    gl.scissor(0, 0, Math.round(frame.width * frame.dpr), Math.round(frame.height * frame.dpr));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const uniform of this.fixedUniforms) this.applyFixed(uniform);

    const set1f = (name: string, v: number) => {
      const loc = this.uniform(name);
      if (loc) gl.uniform1f(loc, v);
    };
    const set2f = (name: string, x: number, y: number) => {
      const loc = this.uniform(name);
      if (loc) gl.uniform2f(loc, x, y);
    };

    set1f("uTime", frame.time);
    set2f("uResolution", frame.width, frame.height);
    set1f("uDpr", frame.dpr);
    set2f("uPointer", frame.pointer.x, frame.pointer.y);
    set2f("uPointerPx", frame.pointer.px, frame.pointer.py);
    set1f("uPointerInside", frame.pointer.inside ? 1 : 0);

    this.setFrameUniforms(gl, frame);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  protected override release(): void {
    const gl = this.gl;
    if (!gl) return;
    if (this.program) gl.deleteProgram(this.program);
    if (this.buffer) gl.deleteBuffer(this.buffer);
    this.program = null;
    this.buffer = null;
    this.gl = null;
    this.ready = false;
    this.locations.clear();
  }
}
