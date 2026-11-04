import { Canvas2DEngine } from "../../_internal/visuals/canvasEngine";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";

export type SpringConfig = {
  /** Number of trailing nodes per follower. */
  trailLength: number;
  /** Spring stiffness — higher snaps faster. */
  stiffness: number;
  /** Damping ratio, 0–1. Low values overshoot and wobble. */
  damping: number;
  color: string;
  accent: string;
  /** Node radius in CSS pixels. */
  nodeSize: number;
};

type Node = { x: number; y: number; vx: number; vy: number };

/**
 * Spring-follower trails. The head chases the pointer with damped spring physics and every
 * subsequent node chases the node in front of it, which produces natural whip and settle.
 */
export class SpringTrailEngine extends Canvas2DEngine {
  private config: SpringConfig;
  private nodes: Node[] = [];
  private head: Node = { x: 0, y: 0, vx: 0, vy: 0 };
  private initialised = false;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, config: SpringConfig) {
    super(container, canvas);
    this.config = config;
  }

  setConfig(config: SpringConfig): void {
    this.config = config;
  }

  protected override draw(frame: FrameInfo): void {
    const ctx = this.prepare(frame);
    if (!ctx) return;
    const config = this.config;

    const { width, height } = frame;
    const targetX = frame.pointer.inside ? frame.pointer.px : width / 2;
    const targetY = frame.pointer.inside ? frame.pointer.py : height / 2;

    if (!this.initialised) {
      this.initialised = true;
      this.head = { x: targetX, y: targetY, vx: 0, vy: 0 };
      this.nodes = Array.from({ length: config.trailLength }, () => ({
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
      }));
    }

    if (this.nodes.length !== config.trailLength) {
      this.nodes = Array.from({ length: config.trailLength }, () => ({
        x: this.head.x,
        y: this.head.y,
        vx: 0,
        vy: 0,
      }));
    }

    // Fixed timestep in sub-steps keeps stiff springs stable across refresh rates.
    const steps = 3;
    const dt = Math.min(frame.dt, 0.05) / steps;
    const stiffness = config.stiffness * 60;
    const damping = 1 - config.damping * 0.18;

    for (let step = 0; step < steps; step += 1) {
      // Head spring toward the pointer.
      this.head.vx += (targetX - this.head.x) * stiffness * dt;
      this.head.vy += (targetY - this.head.y) * stiffness * dt;
      this.head.vx *= damping;
      this.head.vy *= damping;
      this.head.x += this.head.vx * dt * 60;
      this.head.y += this.head.vy * dt * 60;

      let leadX = this.head.x;
      let leadY = this.head.y;
      for (const node of this.nodes) {
        const restX = leadX;
        const restY = leadY;
        node.vx += (restX - node.x) * stiffness * 0.55 * dt;
        node.vy += (restY - node.y) * stiffness * 0.55 * dt;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx * dt * 60;
        node.y += node.vy * dt * 60;
        leadX = node.x;
        leadY = node.y;
      }
    }

    ctx.clearRect(0, 0, width, height);

    // Connection lines fade toward the tail.
    ctx.lineCap = "round";
    for (let i = 0; i < this.nodes.length - 1; i += 1) {
      const a = i === 0 ? this.head : this.nodes[i - 1];
      const b = this.nodes[i];
      if (!a || !b) continue;
      const t = i / this.nodes.length;
      ctx.strokeStyle = t < 0.5 ? config.color : config.accent;
      ctx.globalAlpha = (1 - t) * 0.85;
      ctx.lineWidth = Math.max(0.6, config.nodeSize * (1 - t) * 1.6);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Nodes.
    const all = [this.head, ...this.nodes];
    for (let i = 0; i < all.length; i += 1) {
      const node = all[i];
      if (!node) continue;
      const t = i / Math.max(all.length - 1, 1);
      const radius = Math.max(0.8, config.nodeSize * (1 - t * 0.75));

      const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
      glow.addColorStop(0, "rgba(255,255,255,0.85)");
      glow.addColorStop(0.35, t < 0.5 ? config.color : config.accent);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  protected override release(): void {
    this.nodes = [];
    this.initialised = false;
    super.release();
  }
}
