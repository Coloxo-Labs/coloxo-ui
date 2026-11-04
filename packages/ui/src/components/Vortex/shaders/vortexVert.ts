/** Soft spiral particles — WebGL2. */
export const VORTEX_VERT_WEBGL2 = `#version 300 es
precision highp float;

layout(location = 0) in vec4 aSeed; // angle0, radiusNorm0, omega, radialVel
layout(location = 1) in vec4 aAttr; // size, alpha, phase, colorIndex

uniform float uTime;
uniform float uSpeed;
uniform float uRange;
uniform float uIntensity;
uniform vec2 uCenter;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uColorCount;

out vec4 vColor;
out float vSoft;

vec3 palette(float idx) {
  float n = max(uColorCount, 1.0);
  float i = mod(floor(idx + 0.5), n);
  if (i < 0.5) return uColor0;
  if (i < 1.5) return uColor1;
  if (i < 2.5) return uColor2;
  return uColor3;
}

void main() {
  float angle0 = aSeed.x;
  float rn0 = aSeed.y;
  float omega = aSeed.z;
  float radialVel = aSeed.w;
  float size = aAttr.x;
  float alpha = aAttr.y;
  float phase = aAttr.z;
  float ci = aAttr.w;

  float spd = max(uSpeed, 0.01);
  float travel = uTime * spd * abs(radialVel) * 0.55 + phase + rn0;
  float cycle = fract(travel);
  // Soft lifecycle: fade at birth/death so wraps never flash
  float envelope = smoothstep(0.0, 0.08, cycle) * smoothstep(1.0, 0.92, cycle);

  float inward = step(radialVel, 0.0);
  float rn = mix(mix(0.08, 1.0, cycle), mix(1.0, 0.08, cycle), inward);
  float swirl = 1.0 + 0.85 * (1.0 - rn);
  float angle = angle0 + omega * uTime * spd * swirl;
  float wobble = sin(uTime * spd * 1.3 + phase * 6.2831) * 0.012;
  rn = clamp(rn + wobble, 0.04, 1.05);

  float maxR = 0.55 * uRange;
  // Aspect-correct: x uses height-normalized units mapped by aspect
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float px = cos(angle) * rn * maxR;
  float py = sin(angle) * rn * maxR;
  // NDC: center in 0–1 → -1–1, radius scaled to shorter axis
  vec2 center = uCenter * 2.0 - 1.0;
  // Flip Y for GL
  center.y = -center.y;
  float scaleY = 1.85;
  float scaleX = scaleY / aspect;
  vec2 pos = center + vec2(px * scaleX, -py * scaleY);

  gl_Position = vec4(pos, 0.0, 1.0);

  float core = 1.0 - rn * 0.35;
  float point = size * (4.5 + uIntensity * 10.0) * core * uDpr;
  gl_PointSize = clamp(point, 2.0, 48.0);

  vec3 col = palette(ci);
  // Slight palette lerp by phase for richness
  vec3 colB = palette(ci + 1.0);
  col = mix(col, colB, 0.15 + 0.2 * sin(phase * 5.0));
  float a = alpha * envelope * (0.35 + uIntensity * 0.75) * (0.55 + core * 0.45);
  vColor = vec4(col, a);
  vSoft = 1.0;
}
`;

/** Soft spiral particles — WebGL1. */
export const VORTEX_VERT_WEBGL1 = `
precision highp float;

attribute vec4 aSeed;
attribute vec4 aAttr;

uniform float uTime;
uniform float uSpeed;
uniform float uRange;
uniform float uIntensity;
uniform vec2 uCenter;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uColorCount;

varying vec4 vColor;
varying float vSoft;

vec3 palette(float idx) {
  float n = max(uColorCount, 1.0);
  float i = mod(floor(idx + 0.5), n);
  if (i < 0.5) return uColor0;
  if (i < 1.5) return uColor1;
  if (i < 2.5) return uColor2;
  return uColor3;
}

void main() {
  float angle0 = aSeed.x;
  float rn0 = aSeed.y;
  float omega = aSeed.z;
  float radialVel = aSeed.w;
  float size = aAttr.x;
  float alpha = aAttr.y;
  float phase = aAttr.z;
  float ci = aAttr.w;

  float spd = max(uSpeed, 0.01);
  float travel = uTime * spd * abs(radialVel) * 0.55 + phase + rn0;
  float cycle = fract(travel);
  float envelope = smoothstep(0.0, 0.08, cycle) * smoothstep(1.0, 0.92, cycle);

  float inward = step(radialVel, 0.0);
  float rn = mix(mix(0.08, 1.0, cycle), mix(1.0, 0.08, cycle), inward);
  float swirl = 1.0 + 0.85 * (1.0 - rn);
  float angle = angle0 + omega * uTime * spd * swirl;
  float wobble = sin(uTime * spd * 1.3 + phase * 6.2831) * 0.012;
  rn = clamp(rn + wobble, 0.04, 1.05);

  float maxR = 0.55 * uRange;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float px = cos(angle) * rn * maxR;
  float py = sin(angle) * rn * maxR;
  vec2 center = uCenter * 2.0 - 1.0;
  center.y = -center.y;
  float scaleY = 1.85;
  float scaleX = scaleY / aspect;
  vec2 pos = center + vec2(px * scaleX, -py * scaleY);

  gl_Position = vec4(pos, 0.0, 1.0);

  float core = 1.0 - rn * 0.35;
  float point = size * (4.5 + uIntensity * 10.0) * core * uDpr;
  gl_PointSize = clamp(point, 2.0, 48.0);

  vec3 col = palette(ci);
  vec3 colB = palette(ci + 1.0);
  col = mix(col, colB, 0.15 + 0.2 * sin(phase * 5.0));
  float a = alpha * envelope * (0.35 + uIntensity * 0.75) * (0.55 + core * 0.45);
  vColor = vec4(col, a);
  vSoft = 1.0;
}
`;
