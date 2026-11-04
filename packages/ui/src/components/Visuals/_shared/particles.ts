export type Point = { x: number; y: number };

/** Deterministic PRNG so a given seed always produces the same layout. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Frame-rate independent easing toward a target. `smoothing` is 0..1 per 60fps frame. */
export function ease(current: number, target: number, smoothing: number, dt: number): number {
  const factor = 1 - Math.pow(1 - smoothing, dt * 60);
  return current + (target - current) * factor;
}

export type ShapeKind = "ring" | "grid" | "spiral" | "wave" | "scatter";

/** Sample `count` points of a named shape, normalized to the container's shorter side. */
export function sampleShape(
  kind: ShapeKind,
  count: number,
  radius: number,
  random: () => number,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1);
    switch (kind) {
      case "ring": {
        const angle = t * Math.PI * 2;
        points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        break;
      }
      case "grid": {
        const side = Math.ceil(Math.sqrt(count));
        const gx = (i % side) / (side - 1) - 0.5;
        const gy = Math.floor(i / side) / (side - 1) - 0.5;
        points.push({ x: gx * radius * 2, y: gy * radius * 2 });
        break;
      }
      case "spiral": {
        const angle = t * Math.PI * 5;
        const r = radius * t;
        points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
        break;
      }
      case "wave": {
        points.push({
          x: (t - 0.5) * radius * 2,
          y: Math.sin(t * Math.PI * 4) * radius * 0.28,
        });
        break;
      }
      default:
        points.push({
          x: (random() - 0.5) * radius * 2,
          y: (random() - 0.5) * radius * 2,
        });
    }
  }
  return points;
}
