/** WebGL2 (#version 300 es) vertex shader — displacement + perspective. */
export const WAVE_VERT_WEBGL2 = `#version 300 es
precision highp float;

in vec2 aPos;

uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform float uComplexity;
uniform vec3 uPointer;
uniform float uInteractionRadius;
uniform float uInteractionStrength;
uniform float uAspect;

out float vHeight;
out vec3 vNormal;
out vec2 vUv;
out float vPointer;

float waveH(vec2 p, float t, float freq, float amp, vec2 dir, float phase) {
  float d = dot(p, normalize(dir));
  return sin(d * freq + t + phase) * amp;
}

void main() {
  vUv = aPos * 0.5 + 0.5;
  float aspect = max(uAspect, 0.001);
  vec2 p = vec2(aPos.x * aspect, aPos.y) * 1.35;
  float t = uTime * uSpeed * 1.4;
  float freq = uFrequency * 2.8;
  float amp = uAmplitude * 0.42;
  float c = clamp(uComplexity, 0.0, 1.0);

  float h = 0.0;
  h += waveH(p, t, freq, amp, vec2(1.0, 0.35), 0.0);
  h += waveH(p, t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3);
  h += waveH(p, t * 0.85, freq * 0.85, amp * 0.55 * c, vec2(0.4, -0.9), 2.1);

  // Lightweight Gerstner-style horizontal drift
  float g = amp * 0.35;
  float k = freq * 0.9;
  float theta = k * (p.x * 0.7 + p.y * 0.3) - t;
  p.x += cos(theta) * g * 0.25;
  p.y += sin(theta) * g * 0.15;

  float rad = max(uInteractionRadius * 2.2, 0.08);
  float dist = length(p - uPointer.xy * vec2(aspect, 1.0) * 1.35);
  float influence = exp(-(dist * dist) / (rad * rad)) * uPointer.z * uInteractionStrength;
  h -= influence * 0.55;
  vPointer = influence;

  // Finite-difference normals in world space
  float e = 0.04;
  float hx =
    waveH(p + vec2(e, 0.0), t, freq, amp, vec2(1.0, 0.35), 0.0) +
    waveH(p + vec2(e, 0.0), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3) -
    (waveH(p - vec2(e, 0.0), t, freq, amp, vec2(1.0, 0.35), 0.0) +
     waveH(p - vec2(e, 0.0), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3));
  float hz =
    waveH(p + vec2(0.0, e), t, freq, amp, vec2(1.0, 0.35), 0.0) +
    waveH(p + vec2(0.0, e), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3) -
    (waveH(p - vec2(0.0, e), t, freq, amp, vec2(1.0, 0.35), 0.0) +
     waveH(p - vec2(0.0, e), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3));
  vNormal = normalize(vec3(-hx / (2.0 * e), 1.0, -hz / (2.0 * e)));
  vHeight = h;

  vec3 world = vec3(p.x, h, p.y);
  // Fixed tilted perspective camera
  float tilt = 0.55;
  float cy = cos(tilt);
  float sy = sin(tilt);
  vec3 cam = vec3(world.x, world.y * cy - world.z * sy, world.y * sy + world.z * cy);
  cam.z -= 2.35;
  float fov = 1.35;
  float depth = max(0.15 - cam.z, 0.15);
  gl_Position = vec4(cam.x * fov / depth, cam.y * fov / depth * 1.05, (depth - 1.5) / 4.0, 1.0);
}
`;

/** WebGL1 (GLSL ES 1.00) vertex shader. */
export const WAVE_VERT_WEBGL1 = `
precision highp float;

attribute vec2 aPos;

uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform float uComplexity;
uniform vec3 uPointer;
uniform float uInteractionRadius;
uniform float uInteractionStrength;
uniform float uAspect;

varying float vHeight;
varying vec3 vNormal;
varying vec2 vUv;
varying float vPointer;

float waveH(vec2 p, float t, float freq, float amp, vec2 dir, float phase) {
  float d = dot(p, normalize(dir));
  return sin(d * freq + t + phase) * amp;
}

void main() {
  vUv = aPos * 0.5 + 0.5;
  float aspect = max(uAspect, 0.001);
  vec2 p = vec2(aPos.x * aspect, aPos.y) * 1.35;
  float t = uTime * uSpeed * 1.4;
  float freq = uFrequency * 2.8;
  float amp = uAmplitude * 0.42;
  float c = clamp(uComplexity, 0.0, 1.0);

  float h = 0.0;
  h += waveH(p, t, freq, amp, vec2(1.0, 0.35), 0.0);
  h += waveH(p, t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3);
  h += waveH(p, t * 0.85, freq * 0.85, amp * 0.55 * c, vec2(0.4, -0.9), 2.1);

  float g = amp * 0.35;
  float k = freq * 0.9;
  float theta = k * (p.x * 0.7 + p.y * 0.3) - t;
  p.x += cos(theta) * g * 0.25;
  p.y += sin(theta) * g * 0.15;

  float rad = max(uInteractionRadius * 2.2, 0.08);
  float dist = length(p - uPointer.xy * vec2(aspect, 1.0) * 1.35);
  float influence = exp(-(dist * dist) / (rad * rad)) * uPointer.z * uInteractionStrength;
  h -= influence * 0.55;
  vPointer = influence;

  float e = 0.04;
  float hx =
    waveH(p + vec2(e, 0.0), t, freq, amp, vec2(1.0, 0.35), 0.0) +
    waveH(p + vec2(e, 0.0), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3) -
    (waveH(p - vec2(e, 0.0), t, freq, amp, vec2(1.0, 0.35), 0.0) +
     waveH(p - vec2(e, 0.0), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3));
  float hz =
    waveH(p + vec2(0.0, e), t, freq, amp, vec2(1.0, 0.35), 0.0) +
    waveH(p + vec2(0.0, e), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3) -
    (waveH(p - vec2(0.0, e), t, freq, amp, vec2(1.0, 0.35), 0.0) +
     waveH(p - vec2(0.0, e), t * 1.15, freq * 1.7, amp * 0.45 * (0.4 + c), vec2(-0.6, 1.0), 1.3));
  vNormal = normalize(vec3(-hx / (2.0 * e), 1.0, -hz / (2.0 * e)));
  vHeight = h;

  vec3 world = vec3(p.x, h, p.y);
  float tilt = 0.55;
  float cy = cos(tilt);
  float sy = sin(tilt);
  vec3 cam = vec3(world.x, world.y * cy - world.z * sy, world.y * sy + world.z * cy);
  cam.z -= 2.35;
  float fov = 1.35;
  float depth = max(0.15 - cam.z, 0.15);
  gl_Position = vec4(cam.x * fov / depth, cam.y * fov / depth * 1.05, (depth - 1.5) / 4.0, 1.0);
}
`;
