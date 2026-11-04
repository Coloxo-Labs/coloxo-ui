import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import { ease } from "../_shared/particles";
import { project, rotate, torus, vec3 } from "../_shared/projection";

export type ObjectKind = "cube" | "sphere" | "torus";

export type GalleryConfig = {
  kinds: ObjectKind[];
  color: string;
  accent: string;
  /** Orbit speed of the group. */
  speed: number;
  /** Pointer parallax strength. */
  parallax: number;
  lineWidth: number;
  /** Which object is focused on pointer hover, -1 for none. */
  focus: number;
};

type SceneObject = {
  kind: ObjectKind;
  x: number;
  y: number;
  z: number;
  /** 0..1 hover emphasis. */
  emphasis: number;
  spin: number;
};

const CUBE_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

/**
 * A small gallery of 3D primitives orbiting a shared axis. Objects are depth-sorted as whole units
 * so nearer objects correctly overlap farther ones, and pointer hover lifts an object's opacity.
 */
export class ObjectGalleryEngine extends Canvas2DEngine {
  private config: GalleryConfig;
  private objects: SceneObject[] = [];
  private builtFor = "";
  private angle = 0;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: GalleryConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: GalleryConfig): void {
    this.config = config;
  }

  private build(kinds: ObjectKind[]): void {
    const key = kinds.join(",");
    if (key === this.builtFor) return;
    this.builtFor = key;
    this.objects = kinds.map((kind, index) => {
      const t = kinds.length === 1 ? 0 : index / kinds.length;
      const a = t * Math.PI * 2;
      return {
        kind,
        x: Math.cos(a) * 0.85,
        y: Math.sin(a * 1.3) * 0.28,
        z: Math.sin(a) * 0.85,
        emphasis: 0,
        spin: index * 0.8,
      };
    });
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;
    this.build(config.kinds);
    this.angle += frame.dt * config.speed;

    const { width, height } = frame;
    ctx.clearRect(0, 0, width, height);

    const tiltX = 0.32 + (frame.pointer.y - 0.5) * config.parallax * 0.6;
    const tiltY = this.angle + (frame.pointer.x - 0.5) * config.parallax;

    // Rotate the ring layout, then depth-sort the objects as units.
    const positioned = this.objects.map((obj, index) => {
      const cos = Math.cos(this.angle);
      const sin = Math.sin(this.angle);
      const rx = obj.x * cos - obj.z * sin;
      const rz = obj.x * sin + obj.z * cos;
      return { obj, index, x: rx, z: rz };
    });
    positioned.sort((a, b) => b.z - a.z);

    const pointerX = frame.pointer.px;
    const pointerY = frame.pointer.py;
    const focusIndex = config.focus >= 0 ? config.focus : -1;

    for (const entry of positioned) {
      const projected = project(vec3(entry.x, entry.obj.y, entry.z), width, height, 3.0, 1.15);
      const distance = Math.hypot(projected.x - pointerX, projected.y - pointerY);
      const hover = frame.pointer.inside && distance < 70 ? 1 : 0;
      const target = entry.index === focusIndex ? 1 : hover;
      entry.obj.emphasis = ease(entry.obj.emphasis, target, 0.2, frame.dt);
      entry.obj.spin += frame.dt * 0.6;

      const size = Math.min(width, height) * 0.075 * projected.scale;
      this.drawObject(ctx, entry.obj, projected.x, projected.y, size, tiltX, tiltY, config);
    }

    ctx.globalAlpha = 1;
  }

  private drawObject(
    ctx: CanvasRenderingContext2D,
    obj: SceneObject,
    cx: number,
    cy: number,
    size: number,
    tiltX: number,
    tiltY: number,
    config: GalleryConfig,
  ): void {
    const emphasis = obj.emphasis;
    ctx.strokeStyle = emphasis > 0.5 ? config.accent : config.color;
    ctx.lineWidth = config.lineWidth * (1 + emphasis * 1.8);
    ctx.globalAlpha = 0.55 + emphasis * 0.45;

    if (obj.kind === "cube") {
      const corners = [
        vec3(-1, -1, -1),
        vec3(1, -1, -1),
        vec3(1, 1, -1),
        vec3(-1, 1, -1),
        vec3(-1, -1, 1),
        vec3(1, -1, 1),
        vec3(1, 1, 1),
        vec3(-1, 1, 1),
      ].map((p) => {
        const rotated = rotate(p, tiltX + obj.spin * 0.4, tiltY + obj.spin * 0.3, 0);
        return {
          x: cx + rotated.x * size,
          y: cy + rotated.y * size,
          z: rotated.z,
        };
      });

      for (const [a, b] of CUBE_EDGES) {
        const na = corners[a];
        const nb = corners[b];
        if (!na || !nb) continue;
        ctx.globalAlpha = (0.3 + ((na.z + nb.z) / 2 + 1) * 0.32) * (0.7 + emphasis * 0.3);
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }
      return;
    }

    if (obj.kind === "sphere") {
      // Latitude/longitude cage: cheap and reads as a sphere in projection.
      const rings = 4;
      for (let i = 1; i < rings; i += 1) {
        const phi = (i / rings) * Math.PI;
        const r = Math.sin(phi);
        const y = Math.cos(phi);
        ctx.beginPath();
        for (let s = 0; s <= 32; s += 1) {
          const a = (s / 32) * Math.PI * 2;
          const point = rotate(
            vec3(Math.cos(a) * r, y, Math.sin(a) * r),
            tiltX + obj.spin * 0.3,
            tiltY,
            0,
          );
          const x = cx + point.x * size;
          const py = cy + point.y * size;
          if (s === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        ctx.stroke();
      }
      return;
    }

    // Torus: draw the major rings only, which stays legible at gallery scale.
    const rings = torus(10, 8, 1, 0.34);
    for (const ring of rings) {
      ctx.beginPath();
      ring.forEach((point, index) => {
        const rotated = rotate(point, tiltX + obj.spin * 0.5, tiltY, 0);
        const x = cx + rotated.x * size;
        const y = cy + rotated.y * size;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  protected override release(): void {
    this.objects = [];
    super.release();
  }
}
