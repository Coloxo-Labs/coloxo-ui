import { GLSL_HEADER } from "../../../_internal/visuals/shaderEngine";
import { GLSL_UTILS } from "../../../_internal/visuals/glsl";

/**
 * Gravitational lens. Particle positions are advected by an inverse-square deflection toward
 * movable masses, then drawn as additive streaks. Doing the deflection per-pixel (instead of
 * simulating particles on the CPU) keeps streaks coherent at any frame rate.
 */
export const GRAVITATIONAL_LENS_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uGravity;
uniform float uLensRadius;
uniform vec2 uCenter;
uniform float uTrail;
uniform vec3 uColor;
uniform float uPoles;
uniform float uRepel;

vec2 deflect(vec2 p, vec2 source, float strength) {
  vec2 delta = source - p;
  float d2 = dot(delta, delta) + 0.0016;
  return delta * clamp(strength / d2, 0.0, 26.0) * 0.06;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 lens = (uCenter - 0.5) * vec2(aspect, 1.0);
  vec2 deflection = deflect(p, lens, uGravity);

  vec2 pole = vec2(cos(uTime * 0.31), sin(uTime * 0.31)) * 0.44 * vec2(aspect, 1.0);
  if (uPoles > 1.5) {
    deflection += deflect(p, lens + pole, uGravity * 0.72);
    deflection += deflect(p, lens - pole, uGravity * 0.5 * uRepel);
  }

  vec2 bent = p + deflection;

  vec2 spin = vec2(-bent.y, bent.x);
  vec2 flow = bent + spin * 0.35;

  float n = cxFbm(flow * 3.1 + uTime * 0.06);
  float filaments = cxFbm(flow * 7.4 - uTime * 0.12);
  float density = smoothstep(0.42, 0.86, n * 0.65 + filaments * 0.35);

  float arc = abs(sin(atan(bent.y, bent.x) * 3.0 + length(bent) * 9.0 - uTime * 0.5));
  float streak = pow(1.0 - arc, 6.0) * density;

  float dist = length(p - lens);
  float lensGlow = (1.0 - smoothstep(0.0, uLensRadius, dist)) * 0.55;
  float halo = exp(-dist * 4.2) * 0.55;

  float intensity = density * 0.55 + streak * (0.5 + uTrail) + halo + lensGlow;
  intensity *= smoothstep(0.02, 0.35, length(p));

  vec3 color = uColor * intensity;
  color += vec3(1.0) * streak * 0.18;

  gl_FragColor = vec4(color, clamp(intensity * 1.15, 0.0, 1.0));
}
`;

/**
 * Refraction lens. UV space is remapped through a spherical glass volume so the backdrop appears
 * magnified and bent, with wavelength-dependent offsets at the rim for chromatic fringing.
 */
export const REFRACTION_LENS_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uMagnification;
uniform float uLensRadius;
uniform float uRefraction;
uniform float uChromatic;
uniform float uEdgeGlow;
uniform vec3 uTint;

vec3 backdrop(vec2 p) {
  vec2 grid = abs(fract(p * vec2(9.0, 6.0)) - 0.5);
  float lines = smoothstep(0.44, 0.5, max(grid.x, grid.y));
  float blob = cxFbm(p * 2.6 + uTime * 0.05);
  float blob2 = cxFbm(p * 3.8 - uTime * 0.04);
  vec3 base = mix(vec3(0.05, 0.07, 0.13), vec3(0.16, 0.24, 0.42), blob);
  base = mix(base, vec3(0.32, 0.2, 0.5), blob2 * 0.45);
  return base + lines * 0.16;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 lens = (uPointer - 0.5) * vec2(aspect, 1.0);

  float d = length(p - lens);
  float radius = uLensRadius * 0.5;
  float inside = 1.0 - smoothstep(radius * 0.92, radius, d);

  vec2 dir = (p - lens) / max(radius, 0.0001);
  float edgeT = clamp(d / max(radius, 0.0001), 0.0, 1.0);

  // Spherical surface height; the slope near the rim is what produces the strong bend.
  float h = sqrt(max(1.0 - edgeT * edgeT, 0.0));
  vec2 bend = dir * (1.0 - h) * uRefraction * 0.42;

  vec2 sampleUv = (p - bend) / max(uMagnification, 0.2);

  vec3 outside = backdrop(p);
  vec3 r = backdrop(sampleUv + dir * uChromatic * 0.012);
  vec3 g = backdrop(sampleUv);
  vec3 b = backdrop(sampleUv - dir * uChromatic * 0.012);
  vec3 refracted = vec3(r.r, g.g, b.b) * uTint;

  float fresnel = pow(edgeT, 3.0);
  refracted += fresnel * uEdgeGlow * 0.85;
  refracted += pow(max(1.0 - abs(dir.y + 0.45), 0.0), 22.0) * 0.3 * inside;

  gl_FragColor = vec4(mix(outside, refracted, inside), 1.0);
}
`;

/**
 * Interactive field distortion. A decaying displacement field trails the pointer and bends the
 * procedural backdrop; presets switch the displacement shape, not the whole program.
 */
export const FIELD_DISTORTION_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uStrength;
uniform float uRadius;
uniform float uDecay;
uniform float uType;
uniform float uBlend;

vec2 presetOffset(vec2 p, vec2 dir, float falloff) {
  if (uType < 0.5) {
    return -dir * falloff;
  }
  if (uType < 1.5) {
    return vec2(sin(dir.y * 26.0 + uTime * 3.0), cos(dir.x * 22.0 - uTime * 2.4)) * falloff * 0.5;
  }
  if (uType < 2.5) {
    return normalize(dir + 0.0001) * sin(length(dir) * 30.0 - uTime * 4.0) * falloff * 0.7;
  }
  return dir * falloff * 1.4;
}

vec3 scene(vec2 p) {
  float a = cxFbm(p * 2.1 + vec2(uTime * 0.04, -uTime * 0.03));
  float b = cxFbm(p * 4.3 - vec2(uTime * 0.07, uTime * 0.05));
  vec3 c1 = vec3(0.06, 0.09, 0.22);
  vec3 c2 = vec3(0.14, 0.3, 0.72);
  vec3 c3 = vec3(0.42, 0.22, 0.66);
  return mix(mix(c1, c2, a), c3, b * 0.55);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);

  vec2 dir = p - pointer;
  float dist = length(dir);
  float falloff = exp(-dist / max(uRadius * 0.5, 0.01)) * uStrength * 0.06 * (1.0 - uDecay * 0.5);

  vec2 warped = p + presetOffset(p, dir, falloff);
  vec3 color = mix(scene(p), scene(warped), uBlend);
  color += vec3(0.35, 0.5, 1.0) * falloff * 0.6;

  gl_FragColor = vec4(color, 1.0);
}
`;
