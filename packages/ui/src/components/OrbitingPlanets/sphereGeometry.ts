export type SphereMesh = {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
  indexCount: number;
};

const QUALITY_SEGMENTS: Record<"low" | "medium" | "high", [number, number]> = {
  low: [16, 12],
  medium: [24, 18],
  high: [32, 24],
};

/** Indexed UV unit sphere centered at origin. */
export function buildSphereMesh(quality: "low" | "medium" | "high"): SphereMesh {
  const [lonSeg, latSeg] = QUALITY_SEGMENTS[quality];
  const positions: number[] = [];
  const normals: number[] = [];

  for (let y = 0; y <= latSeg; y++) {
    const v = y / latSeg;
    const phi = v * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x <= lonSeg; x++) {
      const u = x / lonSeg;
      const theta = u * Math.PI * 2;
      const nx = Math.cos(theta) * sinPhi;
      const ny = cosPhi;
      const nz = Math.sin(theta) * sinPhi;
      positions.push(nx, ny, nz);
      normals.push(nx, ny, nz);
    }
  }

  const indices: number[] = [];
  const row = lonSeg + 1;
  for (let y = 0; y < latSeg; y++) {
    for (let x = 0; x < lonSeg; x++) {
      const a = y * row + x;
      const b = a + row;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
    indexCount: indices.length,
  };
}
