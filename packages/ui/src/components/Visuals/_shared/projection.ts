export type Vec3 = { x: number; y: number; z: number };

export const vec3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });

export function rotate(v: Vec3, ax: number, ay: number, az: number): Vec3 {
  let { x, y, z } = v;

  // X
  const cy = Math.cos(ax);
  const sy = Math.sin(ax);
  [y, z] = [y * cy - z * sy, y * sy + z * cy];

  // Y
  const cyy = Math.cos(ay);
  const syy = Math.sin(ay);
  [x, z] = [x * cyy + z * syy, -x * syy + z * cyy];

  // Z
  const cz = Math.cos(az);
  const sz = Math.sin(az);
  [x, y] = [x * cz - y * sz, x * sz + y * cz];

  return { x, y, z };
}

export type Projected = { x: number; y: number; scale: number; depth: number };

/** Perspective projection around the canvas centre. `focal` controls how strong the effect is. */
export function project(
  v: Vec3,
  width: number,
  height: number,
  focal = 2.6,
  zoom = 1,
): Projected {
  const scale = Math.min(width, height) * 0.34 * zoom;
  const perspective = focal / (focal + v.z);
  return {
    x: width / 2 + v.x * scale * perspective,
    y: height / 2 + v.y * scale * perspective,
    scale: perspective,
    depth: v.z,
  };
}

/** Vertex ring of a regular polygon in the XY plane. */
export function polygon(count: number, radius = 1, z = 0): Vec3[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return vec3(Math.cos(a) * radius, Math.sin(a) * radius, z);
  });
}

/** Points on a sphere via the Fibonacci lattice — evenly distributed without clustering at poles. */
export function fibonacciSphere(count: number, radius = 1): Vec3[] {
  const points: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(vec3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return points;
}

/** Surface points of a parametric torus, useful for wireframe rings and gyroscopes. */
export function torus(
  majorSegments: number,
  minorSegments: number,
  majorRadius = 1,
  minorRadius = 0.3,
): Vec3[][] {
  return Array.from({ length: majorSegments }, (_, i) => {
    const u = (i / majorSegments) * Math.PI * 2;
    return Array.from({ length: minorSegments }, (_, j) => {
      const v = (j / minorSegments) * Math.PI * 2;
      const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
      const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
      const z = minorRadius * Math.sin(v);
      return vec3(x, y, z);
    });
  });
}

export function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return vec3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
}
