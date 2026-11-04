/** Reusable GLSL ES 1.0 snippets. All functions are namespaced to avoid clashing in composed shaders. */

export const GLSL_UTILS = `
float cxHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float cxNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(cxHash(i), cxHash(i + vec2(1.0, 0.0)), u.x),
    mix(cxHash(i + vec2(0.0, 1.0)), cxHash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float cxFbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * cxNoise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec3 cxHue(float h) {
  vec3 k = mod(vec3(5.0, 3.0, 1.0) + h * 6.0, 6.0);
  return clamp(min(k, 4.0 - k), 0.0, 1.0);
}

float cxLuma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

/** Soft circular mask with a one-pixel-ish feather. */
float cxDisc(vec2 p, float radius, float feather) {
  return 1.0 - smoothstep(radius - feather, radius, length(p));
}

/** 0..1 rim highlight from a surface normal, biased toward grazing angles. */
float cxFresnel(vec3 normal, float power) {
  return pow(1.0 - clamp(normal.z, 0.0, 1.0), power);
}
`;

/** Palettes shared by the material effects, authored as GLSL vec3 constants. */
export const GLSL_PALETTES = `
vec3 cxIrridescentPalette(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}
`;

export type PaletteKey = "iridescent" | "aurora" | "sunset" | "ocean" | "monochrome";

/** Uniform triples fed to shaders that take a three-stop gradient. */
export const PALETTE_STOPS: Record<PaletteKey, [number[], number[], number[]]> = {
  iridescent: [
    [0.16, 0.31, 1.0],
    [0.53, 0.29, 0.95],
    [0.13, 0.83, 0.93],
  ],
  aurora: [
    [0.09, 0.65, 0.48],
    [0.16, 0.42, 0.94],
    [0.55, 0.36, 0.96],
  ],
  sunset: [
    [0.97, 0.45, 0.24],
    [0.91, 0.26, 0.55],
    [0.51, 0.24, 0.86],
  ],
  ocean: [
    [0.06, 0.36, 0.72],
    [0.09, 0.62, 0.83],
    [0.19, 0.83, 0.78],
  ],
  monochrome: [
    [0.68, 0.71, 0.78],
    [0.88, 0.9, 0.94],
    [0.42, 0.45, 0.52],
  ],
};
