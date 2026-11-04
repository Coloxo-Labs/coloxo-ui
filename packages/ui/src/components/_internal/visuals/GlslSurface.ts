import { ShaderEngine, type ShaderProgramSpec } from "./shaderEngine";
import type { FrameInfo } from "./visualEngine";

export type GlslUniformValue = number | number[];

/**
 * A shader-based visual driven entirely by plain data: the component passes a fragment source and
 * a map of uniforms, and this class renders it. Fragment-shader effects that need no bespoke
 * JavaScript state can therefore skip writing an engine subclass at all.
 */
export class GlslSurface extends ShaderEngine {
  private source: string;
  private values: Record<string, GlslUniformValue>;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    source: string,
    values: Record<string, GlslUniformValue>,
    maxDpr?: number,
  ) {
    super(container, canvas, { maxDpr });
    this.source = source;
    this.values = values;
  }

  setValues(values: Record<string, GlslUniformValue>): void {
    this.values = values;
  }

  /** Swap the fragment program; re-links the GL program. */
  setSource(source: string): void {
    if (source === this.source) return;
    this.source = source;
    this.rebuild();
  }

  protected shader(): ShaderProgramSpec {
    return { fragment: this.source };
  }

  protected setFrameUniforms(gl: WebGLRenderingContext): void {
    for (const [name, value] of Object.entries(this.values)) {
      const loc = this.uniform(name);
      if (!loc) continue;
      if (typeof value === "number") {
        gl.uniform1f(loc, value);
      } else if (value.length === 2) {
        gl.uniform2f(loc, value[0] ?? 0, value[1] ?? 0);
      } else if (value.length === 3) {
        gl.uniform3f(loc, value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
      } else {
        gl.uniform4f(loc, value[0] ?? 0, value[1] ?? 0, value[2] ?? 0, value[3] ?? 0);
      }
    }
  }

  protected override draw(frame: FrameInfo): void {
    super.draw(frame);
  }
}
