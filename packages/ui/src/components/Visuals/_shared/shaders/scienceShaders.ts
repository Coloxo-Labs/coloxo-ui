import { GLSL_HEADER } from "../../../_internal/visuals/shaderEngine";
import { GLSL_UTILS } from "../../../_internal/visuals/glsl";

/**
 * Magnetic field visualiser. Field lines are traced analytically from dipole sources: for each
 * pole pair the shader evaluates the local field direction and draws a bright line where the
 * accumulating potential crosses a band, which is what produces continuous contours.
 */
export const MAGNETIC_FIELD_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uFieldStrength;
uniform float uLineDensity;
uniform float uParticleSpeed;
uniform float uPolarity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uPoleCount;

vec2 fieldAt(vec2 p, vec2 pole, float sign) {
  vec2 d = p - pole;
  float r2 = dot(d, d) + 0.004;
  vec2 radial = d / r2;
  vec2 tangential = vec2(-d.y, d.x) / r2;
  return sign * (radial * 0.75 + tangential * 0.65);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  vec2 a = vec2(-0.36 * aspect, 0.0);
  vec2 b = vec2(0.36 * aspect, 0.0);
  a += (uPointer - 0.5) * vec2(aspect, 1.0) * 0.35;
  b -= (uPointer - 0.5) * vec2(aspect, 1.0) * 0.35;

  vec2 field = fieldAt(p, a, 1.0) * uPolarity + fieldAt(p, b, -1.0);
  if (uPoleCount > 2.5) {
    vec2 c = vec2(0.0, 0.42) + vec2(cos(uTime * 0.4), sin(uTime * 0.4)) * 0.12;
    field += fieldAt(p, c, uPolarity) * 0.65;
  }

  field *= uFieldStrength;

  // Stream advection: offsets along the field reveal direction and speed.
  vec2 advect = p + normalize(field + 0.0001) * uParticleSpeed * 0.04;
  float potential = cxFbm(advect * 5.2 + uTime * 0.05) + length(field) * 0.35;

  float bands = abs(fract(potential * uLineDensity) - 0.5) * 2.0;
  float lines = pow(1.0 - bands, 10.0);

  // Drifting particles riding the lines.
  vec2 cell = floor((p + normalize(field + 0.0001) * uTime * uParticleSpeed * 0.12) * 26.0);
  float seed = cxHash(cell);
  float particle = smoothstep(0.985, 1.0, seed) * 1.4;

  float magnitude = clamp(length(field) * 0.5, 0.0, 1.0);
  vec3 color = mix(uColorA, uColorB, magnitude);
  float intensity = lines * 0.75 + particle + magnitude * 0.25;

  gl_FragColor = vec4(color * intensity, clamp(intensity, 0.0, 1.0));
}
`;

/**
 * Force-field membrane: a translucent sphere whose surface is displaced by travelling waves and by
 * pointer proximity. Because the shell is drawn as a normal-shaded sphere, deformation reads as
 * real relief rather than a flat overlay.
 */
export const FORCE_FIELD_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uWaveSpeed;
uniform float uOpacity;
uniform float uDistortion;
uniform float uDecay;
uniform vec3 uSurface;
uniform float uRadius;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float radius = uRadius * 0.42;
  float d = length(p);
  float disc = 1.0 - smoothstep(radius * 0.97, radius * 1.03, d);
  if (disc <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 n2 = p / max(radius, 0.001);
  float z = sqrt(max(1.0 - min(dot(n2, n2), 1.0), 0.0));
  vec3 normal = normalize(vec3(n2, z));

  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  float pointerDist = length(p - pointer);
  float pointerInfluence = exp(-pointerDist / max(uRadius * 0.22, 0.01)) * uDistortion;

  // Concentric waves travelling outward plus a slow ripple.
  float wave = sin(d * 26.0 - uTime * uWaveSpeed * 4.0) * 0.5 + 0.5;
  float ripple = sin(dot(normal.xy, vec2(1.0, 1.4)) * 12.0 - uTime * uWaveSpeed * 2.2) * 0.5 + 0.5;

  float deform = (wave * 0.45 + ripple * 0.55) * uDistortion;
  deform += pointerInfluence * 1.6;

  normal = normalize(normal + vec3(n2, 0.0) * deform * 0.55);

  vec3 view = vec3(0.0, 0.0, 1.0);
  float facing = clamp(dot(normal, view), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 2.2);

  float light = clamp(dot(normal, normalize(vec3(-0.4, 0.55, 0.75))), 0.0, 1.0);

  // Deformation drives opacity so pressed areas brighten, like a stretched membrane.
  float alpha = (0.12 + fresnel * 0.75 + deform * 0.5) * uOpacity;
  alpha *= disc;

  vec3 color = uSurface * (0.35 + 0.9 * light);
  color += uSurface * fresnel * 1.2;
  color += vec3(0.6, 0.8, 1.0) * pointerInfluence * 0.9;

  // Latitude/longitude scaffolding makes the shell read as a membrane, not a flat circle.
  float scaf = smoothstep(0.94, 1.0, abs(sin(atan(normal.y, normal.x) * 6.0)));
  color += scaf * 0.08;

  gl_FragColor = vec4(color * alpha, alpha);
}
`;

/** Living wireframe terrain: a height field rendered as a perspective grid with pointer dunes. */
export const TERRAIN_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uAmplitude;
uniform float uNoiseScale;
uniform float uInteractionRadius;
uniform float uCameraAngle;
uniform vec3 uWireColor;
uniform vec3 uFillColor;

float terrain(vec2 p) {
  float n = cxFbm(p * uNoiseScale + vec2(uTime * 0.08, uTime * 0.05));
  float n2 = cxFbm(p * uNoiseScale * 2.3 - uTime * 0.04);
  float h = (n - 0.5) * 1.6 + (n2 - 0.5) * 0.5;

  vec2 pointer = (uPointer - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float pd = length(p - pointer);
  h += exp(-pd / max(uInteractionRadius * 0.5, 0.01)) * 0.85;

  return h * uAmplitude;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  // Perspective projection: uv.y is the depth axis, uv.x compresses with distance.
  float depth = 1.0 - uv.y;
  float horizon = 0.16;
  if (depth < horizon) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float persp = horizon / depth;
  float worldY = (uv.x - 0.5) * aspect * 4.0 * persp;
  float worldZ = (1.0 - persp) * 6.0;

  vec2 p = vec2(worldY, worldZ);
  float h = terrain(p);

  // Screen-space offset from height, so peaks rise visibly.
  float heightOffset = h * 0.06 * persp;

  vec2 gridP = vec2(p.x, p.y);
  vec2 g1 = abs(fract(gridP * vec2(1.6, 1.6)) - 0.5);
  float grid = 1.0 - smoothstep(0.42, 0.5, min(g1.x, g1.y));

  // Approximate surface normal from finite differences for shading.
  float e = 0.06;
  float hx = terrain(p + vec2(e, 0.0)) - h;
  float hz = terrain(p + vec2(0.0, e)) - h;
  vec3 normal = normalize(vec3(-hx * 2.2, -hz * 2.2, 1.0));
  float light = clamp(dot(normal, normalize(vec3(0.35, -0.5, 0.8))), 0.0, 1.0);

  float fade = smoothstep(horizon, 0.55, depth);
  vec3 color = mix(uFillColor, uWireColor, grid);
  color *= 0.35 + 0.85 * light;
  color += uWireColor * grid * 0.55;
  color *= fade * persp * 1.4;

  float alpha = clamp((grid * 0.85 + 0.14) * fade * persp * 1.5, 0.0, 1.0);
  color += vec3(0.0, 0.0, 0.0) * heightOffset;
  gl_FragColor = vec4(color, alpha);
}
`;

/** Interactive ripple field: overlapping concentric waves with crest shading and refraction. */
export const RIPPLE_FIELD_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uAmplitude;
uniform float uWaveSpeed;
uniform float uFrequency;
uniform float uDecay;
uniform float uMode;
uniform float uDistortion;
uniform float uClickPulse;

vec3 scene(vec2 p) {
  float a = cxFbm(p * 1.7 + uTime * 0.03);
  float b = cxFbm(p * 3.1 - uTime * 0.05);
  return mix(mix(vec3(0.03, 0.08, 0.16), vec3(0.1, 0.28, 0.5), a), vec3(0.24, 0.5, 0.72), b * 0.5);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);

  float d = length(p - pointer);
  float phase = d * uFrequency * 6.28318 - uTime * uWaveSpeed * 3.0;

  float ring = sin(phase);
  float envelope = exp(-d * (1.2 + uDecay * 2.4));
  float wave = ring * envelope * uAmplitude;

  // The click pulse adds one expanding shock ring without needing CPU-side history.
  wave += sin(d * 18.0 - uClickPulse * 12.0) * exp(-d * 3.0) * uClickPulse * 0.5;

  // Derivative of the wave gives a fake surface normal for crest lighting.
  vec2 grad = normalize(p - pointer + 0.0001) * cos(phase) * envelope * uAmplitude;
  vec3 normal = normalize(vec3(-grad * 2.4, 1.0));
  float shade = clamp(dot(normal, normalize(vec3(-0.3, 0.5, 0.85))), 0.0, 1.0);

  vec2 offset = (p - pointer) * wave * uDistortion * 0.12;
  vec3 base = scene(p + offset);

  // Presets recolour rather than re-shading: water, glass, energy.
  vec3 tint = vec3(0.35, 0.75, 1.0);
  if (uMode > 0.5 && uMode < 1.5) tint = vec3(0.85, 0.92, 1.0);
  if (uMode > 1.5) tint = vec3(0.55, 0.4, 1.0);

  vec3 color = base * (0.55 + 0.9 * shade);
  color += tint * abs(wave) * 1.5;
  color += vec3(1.0) * pow(max(shade, 0.0), 14.0) * 0.35;

  gl_FragColor = vec4(color, 1.0);
}
`;
