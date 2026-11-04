import { GLSL_HEADER } from "../../../_internal/visuals/shaderEngine";
import { GLSL_UTILS } from "../../../_internal/visuals/glsl";

/** Mesh gradient blending several drifting colour fields, with grain to break up banding. */
export const AURORA_MESH_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uBlobScale;
uniform float uSpeed;
uniform float uGrain;
uniform float uSoftness;

float blob(vec2 p, vec2 center, float radius) {
  float d = length(p - center) / max(radius, 0.001);
  return 1.0 - smoothstep(1.0 - uSoftness, 1.0, d);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float t = uTime * uSpeed;

  vec2 c1 = vec2(cos(t * 0.31), sin(t * 0.42)) * 0.42;
  vec2 c2 = vec2(cos(t * 0.23 + 2.1), sin(t * 0.37 + 1.4)) * 0.5;
  vec2 c3 = vec2(cos(t * 0.41 + 4.3), sin(t * 0.29 + 3.2)) * 0.46;

  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  c3 = mix(c3, pointer, 0.35 * uPointerInside);

  float b1 = blob(p, c1, 0.62 * uBlobScale);
  float b2 = blob(p, c2, 0.55 * uBlobScale);
  float b3 = blob(p, c3, 0.5 * uBlobScale);

  vec3 color = uColorA * b1 + uColorB * b2 + uColorC * b3;
  float total = b1 + b2 + b3 + 0.0001;
  color /= total;
  color *= min(total, 1.0);

  // Fine grain hides 8-bit banding across large soft gradients.
  float noise = cxHash(gl_FragCoord.xy) - 0.5;
  color += noise * uGrain;

  float vignette = 1.0 - smoothstep(0.55, 1.15, length(p));
  color *= 0.55 + vignette * 0.65;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

/** Chromatic text: the glyph mask is displaced per channel with an animated offset. */
export const CHROMATIC_TEXT_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uOffset;
uniform float uSpeed;
uniform float uBlur;
uniform float uFill;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uScanlines;

float glyphMask(vec2 uv) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float radius = 0.08 + uFill * 0.52;
  float stroke = 0.016 + uFill * 0.075;
  float ring = 1.0 - smoothstep(stroke, stroke + 0.012, abs(length(p) - radius));

  // Open the right-hand side so the ring reads as a C-shaped glyph instead of a solid disc.
  float gap = smoothstep(0.0, 0.06, p.x) * (1.0 - smoothstep(0.10, 0.20, abs(p.y)));

  return clamp(ring * (1.0 - gap), 0.0, 1.0);
}

void main() {
  vec2 uv = vUv;
  float t = uTime * uSpeed;

  // Wave-driven channel separation.
  float wave = sin(uv.y * 9.0 + t * 2.0) * 0.5 + 0.5;
  float displacement = uOffset * (0.004 + wave * 0.012);

  vec2 rUv = uv + vec2(displacement, 0.0);
  vec2 bUv = uv - vec2(displacement, 0.0);

  float rMask = glyphMask(rUv);
  float gMask = glyphMask(uv);
  float bMask = glyphMask(bUv);

  // Each displaced mask is tinted by its own channel colour, so the fringes read as separate
  // colour plates rather than as a blurred edge.
  float total = rMask + gMask + bMask;
  vec3 color = (uColorA * rMask + uColorB * gMask + uColorC * bMask) / max(total, 0.0001);

  // Where all three overlap the glyph core resolves toward white instead of saturating to a slab.
  float core = min(rMask, min(gMask, bMask));
  color = mix(color, vec3(1.0), core * 0.55);

  color *= 1.0 - uBlur * (1.0 - core) * 0.35;

  // Optional scanlines over the glyph area only.
  float scan = step(0.5, fract(uv.y * 220.0));
  color *= 1.0 - scan * uScanlines * 0.25;

  float alpha = max(rMask, max(gMask, bMask));
  gl_FragColor = vec4(color, alpha);
}
`;

/** Kinetic grid warp: a perspective grid displaced by travelling waves and pointer gravity. */
export const KINETIC_GRID_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uGridSize;
uniform float uWarpStrength;
uniform float uSpeed;
uniform float uLineWidth;
uniform float uPerspective;
uniform vec3 uLineColor;
uniform vec3 uAccentColor;

float gridLines(vec2 p, float size, float width) {
  vec2 g = abs(fract(p * size) - 0.5);
  float line = min(g.x, g.y);
  return 1.0 - smoothstep(width, width + 0.02, line);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  // Perspective squeeze toward the top of the frame.
  float depth = 1.0 - vUv.y;
  float persp = mix(1.0, 1.0 / max(0.32, uPerspective * depth + 0.18), 0.55);
  vec2 warpedP = vec2(p.x * persp, p.y);

  // Travelling waves plus pointer well.
  float wave = sin(warpedP.x * 3.4 + uTime * uSpeed) * cos(warpedP.y * 2.6 - uTime * uSpeed * 0.8);
  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  vec2 delta = warpedP - pointer;
  float dist = length(delta);
  float well = exp(-dist * 4.5) * uPointerInside * 0.22;

  warpedP += vec2(wave * 0.03, wave * 0.02) * uWarpStrength;
  warpedP -= normalize(delta + 0.0001) * well;

  float lines = gridLines(warpedP, uGridSize, uLineWidth);

  // Secondary, offset grid gives moire depth as it drifts.
  float sub = gridLines(warpedP * 2.0 + vec2(uTime * 0.03, 0.0), uGridSize, uLineWidth * 0.7);

  float glow = exp(-dist * 3.2) * uPointerInside;
  vec3 color = uLineColor * lines;
  color += uAccentColor * sub * 0.35;
  color += uAccentColor * glow * 0.5;
  color *= 1.0 - smoothstep(0.7, 1.25, length(p));

  float alpha = clamp(lines + sub * 0.3 + glow * 0.5, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

/** Bioluminescent drift: soft glowing organisms with depth-layered bloom and slow wander. */
export const BIOLUMINESCENCE_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uDensity;
uniform float uGlowRadius;
uniform float uDriftSpeed;
uniform float uHueShift;
uniform float uBloom;
uniform vec3 uColorA;
uniform vec3 uColorB;

vec3 palette(float t) {
  float h = fract(t + uHueShift);
  return mix(uColorA, uColorB, h) * (0.55 + h * 0.75);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  vec3 accumulated = vec3(0.0);
  float total = 0.0;

  // Three depth layers: farther layers are smaller, dimmer and slower.
  for (int layer = 0; layer < 3; layer += 1) {
    float fl = float(layer);
    float cells = uDensity * (1.0 + fl * 0.6);
    float speed = uDriftSpeed * (1.0 - fl * 0.28);
    float radius = uGlowRadius * (1.0 - fl * 0.22);

    vec2 drift = vec2(sin(uTime * 0.21 * speed + fl), cos(uTime * 0.17 * speed + fl * 1.7)) * 0.06;
    vec2 q = p + drift;

    // Jittered grid keeps organism positions random-looking but computable per pixel.
    vec2 cell = floor(q * cells);
    vec2 local = fract(q * cells) - 0.5;

    float seed = cxHash(cell + fl * 37.0);
    vec2 offset = vec2(cxHash(cell + 11.0), cxHash(cell + 23.0)) - 0.5;
    float organism = length(local - offset * 0.7);

    // Pulse each organism on its own phase.
    float pulse = 0.6 + 0.4 * sin(uTime * 1.1 + seed * 6.28318);
    float glow = exp(-organism / max(radius * 0.06, 0.001)) * pulse;
    glow *= step(0.42, seed);

    accumulated += palette(seed) * glow * (1.0 - fl * 0.22);
    total += glow;
  }

  accumulated *= uBloom;
  float alpha = clamp(total, 0.0, 1.0);

  // Dark water haze behind the organisms.
  vec3 haze = mix(vec3(0.01, 0.03, 0.07), vec3(0.02, 0.06, 0.13), vUv.y);
  vec3 color = haze + accumulated;

  gl_FragColor = vec4(color, 1.0);
}
`;

/** Rift scanner: a swept scanline reveals a corrupted surface with glitch bands. */
export const RIFT_SCAN_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uScanSpeed;
uniform float uScanWidth;
uniform float uCorruption;
uniform float uGridDensity;
uniform vec3 uScanColor;
uniform vec3 uBaseColor;
uniform float uTrail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float scanY = fract(uTime * uScanSpeed) * 1.3 - 0.15;
  float distToScan = abs(vUv.y - scanY);
  float scan = exp(-pow(distToScan / max(uScanWidth, 0.001), 2.0));

  // Trailing afterglow above the scanline.
  float trail = smoothstep(0.0, uTrail, vUv.y - scanY) * step(scanY, vUv.y) * 0.35;

  // Base surface: a structural grid plus noise, revealed only near the scanline.
  vec2 g = abs(fract(p * uGridDensity) - 0.5);
  float grid = 1.0 - smoothstep(0.03, 0.06, min(g.x, g.y));
  float noise = cxFbm(p * 5.0 + uTime * 0.12);

  float corruption = uCorruption * (scan + trail);
  float bands = step(0.72, cxHash(vec2(floor(vUv.y * 60.0), floor(uTime * 18.0))));
  float glitch = bands * corruption * 0.7;

  vec3 surface = uBaseColor * (0.25 + noise * 0.55);
  surface += uScanColor * grid * (0.5 + scan * 1.4);
  surface += uScanColor * scan * 0.85;
  surface += vec3(1.0) * smoothstep(0.004, 0.0, distToScan) * 0.9;
  surface += uScanColor * glitch;

  // Vertical tear through the centre line, only while corrupted.
  float tear = smoothstep(0.01, 0.0, abs(vUv.x - 0.5)) * corruption;
  surface += vec3(1.0, 0.4, 0.7) * tear * 0.5;

  float alpha = clamp(0.25 + scan * 0.9 + trail * 0.5 + grid * 0.15, 0.0, 1.0);
  gl_FragColor = vec4(surface, alpha);
}
`;
