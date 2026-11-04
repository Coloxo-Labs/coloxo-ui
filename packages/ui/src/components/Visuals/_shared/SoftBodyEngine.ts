import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";

export type SoftBodyConfig = {
  /** Grid points per side of the simulated membrane. */
  resolution: number;
  color: string;
  accent: string;
  /** Spring stiffness for the structural constraints. */
  stiffness: number;
  /** Gravity applied to every node. */
  gravity: number;
  /** How far a pointer drag pushes nodes. */
  pushRadius: number;
  /** Damping per integration step, 0..1. */
  damping: number;
  wireframe: boolean;
};

type Node = { x: number; y: number; px: number; py: number; pinned: boolean };

/**
 * Verlet-integrated soft body. Nodes are relaxed against structural constraints each frame, which
 * produces believable cloth/jelly behaviour with no external physics library. Positions are stored
 * in normalized space so resizing does not require a rebuild.
 */
export class SoftBodyEngine extends Canvas2DEngine {
  private config: SoftBodyConfig;
  private nodes: Node[] = [];
  private builtFor = "";
  private width_px = 0;
  private height_px = 0;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: SoftBodyConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: SoftBodyConfig): void {
    if (config.resolution !== this.config.resolution) this.builtFor = "";
    this.config = config;
  }

  private build(resolution: number, width: number, height: number): void {
    const key = `${resolution}|${Math.round(width)}x${Math.round(height)}`;
    if (key === this.builtFor) return;
    this.builtFor = key;
    this.width_px = width;
    this.height_px = height;

    const size = Math.min(width, height) * 0.62;
    const originX = width / 2 - size / 2;
    const originY = height / 2 - size / 2;

    this.nodes = [];
    for (let y = 0; y < resolution; y += 1) {
      for (let x = 0; x < resolution; x += 1) {
        const u = x / (resolution - 1);
        const v = y / (resolution - 1);
        const nx = originX + u * size;
        const ny = originY + v * size;
        // Pin the top corners so the sheet hangs like fabric.
        const pinned = (x === 0 || x === resolution - 1) && y === 0;
        this.nodes.push({ x: nx, y: ny, px: nx, py: ny, pinned });
      }
    }
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;
    const resolution = Math.max(4, Math.min(28, Math.round(config.resolution)));
    this.build(resolution, frame.width, frame.height);

    const { width, height } = frame;
    const dt = Math.min(frame.dt, 1 / 30);
    const gravity = config.gravity * 900 * dt * dt;

    // Verlet integration.
    for (const node of this.nodes) {
      if (node.pinned) continue;
      const vx = (node.x - node.px) * config.damping;
      const vy = (node.y - node.py) * config.damping;
      node.px = node.x;
      node.py = node.y;
      node.x += vx;
      node.y += vy + gravity;
    }

    // Pointer push.
    if (frame.pointer.inside) {
      const px = frame.pointer.px;
      const py = frame.pointer.py;
      const radius = config.pushRadius;
      for (const node of this.nodes) {
        if (node.pinned) continue;
        const dx = node.x - px;
        const dy = node.y - py;
        const dist = Math.hypot(dx, dy);
        if (dist < radius && dist > 0.001) {
          const force = (1 - dist / radius) * (frame.pointer.down ? 14 : 6);
          node.x += (dx / dist) * force;
          node.y += (dy / dist) * force;
        }
      }
    }

    // Constraint relaxation: structural neighbours in both axes.
    const iterations = 4;
    for (let pass = 0; pass < iterations; pass += 1) {
      for (let y = 0; y < resolution; y += 1) {
        for (let x = 0; x < resolution; x += 1) {
          const index = y * resolution + x;
          const node = this.nodes[index];
          if (!node) continue;

          if (x < resolution - 1) {
            this.relax(node, this.nodes[index + 1], config.stiffness);
          }
          if (y < resolution - 1) {
            this.relax(node, this.nodes[index + resolution], config.stiffness);
          }
        }
      }
      // Keep the sheet inside the container.
      for (const node of this.nodes) {
        if (node.pinned) continue;
        node.x = Math.max(4, Math.min(width - 4, node.x));
        node.y = Math.max(4, Math.min(height - 4, node.y));
      }
    }

    ctx.clearRect(0, 0, width, height);

    // Fill quads, then stroke the grid.
    if (config.wireframe) {
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      for (let y = 0; y < resolution; y += 1) {
        for (let x = 0; x < resolution - 1; x += 1) {
          const a = this.nodes[y * resolution + x];
          const b = this.nodes[y * resolution + x + 1];
          if (!a || !b) continue;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
      for (let x = 0; x < resolution; x += 1) {
        for (let y = 0; y < resolution - 1; y += 1) {
          const a = this.nodes[y * resolution + x];
          const b = this.nodes[(y + 1) * resolution + x];
          if (!a || !b) continue;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
      ctx.stroke();

      // Node dots at intersections.
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = config.accent;
      for (const node of this.nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Pinned anchors.
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#ffffff";
    for (const node of this.nodes) {
      if (!node.pinned) continue;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  /** Position-based relaxation toward the rest length between two neighbouring nodes. */
  private relax(a: Node, b: Node | undefined, stiffness: number): void {
    if (!b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.0001) return;
    const diff = (dist - this.restLength()) / dist;
    if (a.pinned && b.pinned) return;
    if (a.pinned) {
      b.x -= dx * diff * stiffness;
      b.y -= dy * diff * stiffness;
      return;
    }
    if (b.pinned) {
      a.x += dx * diff * stiffness;
      a.y += dy * diff * stiffness;
      return;
    }
    a.x += dx * diff * 0.5 * stiffness;
    a.y += dy * diff * 0.5 * stiffness;
    b.x -= dx * diff * 0.5 * stiffness;
    b.y -= dy * diff * 0.5 * stiffness;
  }

  private restLength(): number {
    const resolution = Math.max(4, Math.min(28, Math.round(this.config.resolution)));
    return (Math.min(this.width_px, this.height_px) * 0.62) / (resolution - 1);
  }

  protected override release(): void {
    this.nodes = [];
    super.release();
  }
}
