import { GLSL_HEADER } from "../../../_internal/visuals/shaderEngine";
import { GLSL_UTILS } from "../../../_internal/visuals/glsl";

/**
 * Refractive glass cube. Three visible faces of an axonometric cube are shaded with a
 * Fresnel-weighted transmission term, an environment gradient bent by refraction, and a
 * per-face interior colour ramp, which together read as solid glass without a raytracer.
 */
export const GLASS_CUBE_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uIor;
uniform float uTransmission;
uniform float uThickness;
uniform float uRoughness;
uniform float uRotationSensitivity;
uniform vec3 uInterior;
uniform vec3 uRim;

vec3 environment(vec3 dir) {
  float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 sky = mix(vec3(0.08, 0.12, 0.24), vec3(0.3, 0.45, 0.75), t);
  sky += pow(max(dir.y, 0.0), 8.0) * 0.6;
  return sky;
}

// Screen-space mask for one parallelogram face of the cube.
float faceMask(vec2 p, vec2 o, vec2 a, vec2 b) {
  vec2 rel = p - o;
  float u = dot(rel, a) / max(dot(a, a), 0.0001);
  float v = dot(rel, b) / max(dot(b, b), 0.0001);
  if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) return 0.0;
  vec2 local = vec2(u, v);
  vec2 edge = min(local, 1.0 - local);
  return smoothstep(0.0, 0.02, min(edge.x, edge.y));
}

vec3 shadeFace(vec2 facet, vec3 faceNormal, float faceSeed, float mask) {
  vec3 view = vec3(0.0, 0.0, 1.0);
  float facing = clamp(dot(faceNormal, view), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 3.0);

  // Refract the view ray per face; the index of refraction compresses the lookup direction.
  vec3 refracted = refract(-view, faceNormal, 1.0 / max(uIor, 1.0));
  vec3 env = environment(refracted + vec3(facet, 0.0) * uThickness * 0.15);

  float interiorRamp = cxFbm(facet * 2.4 + vec2(uTime * 0.05, faceSeed));
  vec3 interior = uInterior * (0.45 + 0.75 * interiorRamp);

  vec3 color = mix(interior, env, uTransmission * (0.35 + 0.5 * facing));
  color += uRim * fresnel * 1.35;
  color *= 0.82 + 0.3 * faceSeed;

  // Roughness dims the sharp reflections rather than blurring them.
  color = mix(color, interior * 0.85, uRoughness * 0.55);
  return color * mask;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  // Pointer-driven tilt, clamped so the cube never inverts.
  vec2 tilt = (uPointer - 0.5) * uRotationSensitivity;
  p -= tilt * 0.12;

  float s = 0.26;
  vec2 right = vec2(s, -s * 0.5);
  vec2 left = vec2(-s, -s * 0.5);
  vec2 up = vec2(0.0, s * 1.0);
  vec2 top = vec2(0.0, 0.0);
  vec2 center = vec2(0.0, -0.02);

  vec2 originTop = center + up;
  vec2 originLeft = center - right;
  vec2 originRight = center + left;

  float mTop = faceMask(p, originTop, right, left);
  float mLeft = faceMask(p, originLeft, right, up);
  float mRight = faceMask(p, originRight, left, up);

  vec3 normalTop = normalize(vec3(0.0, 0.65, 0.76));
  vec3 normalLeft = normalize(vec3(-0.76, -0.28, 0.58));
  vec3 normalRight = normalize(vec3(0.76, -0.28, 0.58));

  vec3 localTop = (p - originTop);
  vec3 color = vec3(0.0);
  float coverage = 0.0;

  color += shadeFace(vec2(localTop.x, -localTop.y) * 6.0, normalTop, 0.35, mTop);
  coverage = max(coverage, mTop);
  color += shadeFace((p - originLeft).yx * 6.0, normalLeft, 0.75, mLeft);
  coverage = max(coverage, mLeft);
  color += shadeFace((p - originRight).yx * 6.0 + 3.0, normalRight, 0.05, mRight);
  coverage = max(coverage, mRight);

  gl_FragColor = vec4(color, coverage);
}
`;

/**
 * Liquid metal. A signed-distance blob is marched in the fragment shader, then shaded with a
 * high-metalness environment reflection. Pointer proximity stretches the field so the silhouette
 * deforms instead of merely moving.
 */
export const LIQUID_METAL_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uMorph;
uniform float uMetalness;
uniform float uRoughness;
uniform float uCursorInfluence;
uniform float uReflection;
uniform float uShape;

// Signed distance to a blob that blends sphere, torus and capsule as uMorph advances.
float blobSDF(vec2 p) {
  float t = uMorph;
  float radius = 0.3;

  float sphere = length(p) - radius;

  vec2 q = p;
  float torusR = radius * 0.72;
  float torusr = radius * 0.26;
  float torus = length(vec2(length(q) - torusR, 0.0)) - torusr;

  vec2 cap = p;
  cap.y = max(abs(cap.y) - radius * 0.42, 0.0);
  float capsule = length(cap) - radius * 0.55;

  if (uShape > 1.5) {
    // Twisted band: displace the torus angularly.
    float ang = atan(p.y, p.x);
    vec2 q2 = vec2(length(p) - torusR - sin(ang * 3.0 + uTime * 0.6) * 0.05, 0.0);
    return length(q2) - torusr;
  }
  if (uShape > 0.5) {
    return mix(capsule, torus, t);
  }
  return mix(sphere, torus, t);
}

vec3 normalAt(vec2 p) {
  float e = 0.002;
  float dx = blobSDF(p + vec2(e, 0.0)) - blobSDF(p - vec2(e, 0.0));
  float dy = blobSDF(p + vec2(0.0, e)) - blobSDF(p - vec2(0.0, e));
  return normalize(vec3(dx, dy, 0.12));
}

vec3 environment(vec3 dir) {
  float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 top = vec3(0.82, 0.88, 1.0);
  vec3 mid = vec3(0.32, 0.38, 0.5);
  vec3 bottom = vec3(0.06, 0.07, 0.1);
  vec3 env = t > 0.5 ? mix(mid, top, (t - 0.5) * 2.0) : mix(bottom, mid, t * 2.0);
  // Bright band gives the metal a recognisable horizon reflection.
  env += smoothstep(0.02, 0.0, abs(t - 0.62)) * 1.1;
  return env;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  vec2 toCursor = p - pointer;
  float pull = exp(-length(toCursor) * 5.0) * uCursorInfluence * 0.09;
  vec2 warped = p - normalize(toCursor + 0.0001) * pull;

  // Slow breathing so the surface never looks frozen.
  warped += vec2(sin(uTime * 0.4), cos(uTime * 0.33)) * 0.008;

  float d = blobSDF(warped);
  float mask = smoothstep(0.004, -0.004, d);
  if (mask <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 normal = normalAt(warped);
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 reflectDir = reflect(-view, normal);
  vec3 env = environment(reflectDir);

  float fresnel = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 4.0);

  vec3 dielectric = vec3(0.45, 0.47, 0.52);
  vec3 metallic = env * uReflection;
  vec3 color = mix(dielectric, metallic, uMetalness);

  color += fresnel * uReflection * 0.9;
  color = mix(color, vec3(0.35, 0.37, 0.42), uRoughness * 0.5);

  // Specular hotspot travels with the pointer, selling the polished-metal read.
  float hot = pow(max(dot(normal, normalize(vec3(pointer.x * 1.6, pointer.y * 1.6, 1.0))), 0.0), 30.0);
  color += hot * 1.3;
  color += smoothstep(0.0, -0.03, d) * 0.12;

  gl_FragColor = vec4(color * mask, mask);
}
`;

/**
 * Volumetric light tunnel. Depth is faked by integrating repeated beam samples along a radial ray,
 * which produces parallax and fog falloff without any post-processing passes.
 */
export const LIGHT_TUNNEL_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uBeamCount;
uniform float uDepth;
uniform float uTravel;
uniform float uBloom;
uniform float uCameraMotion;
uniform vec3 uPaletteA;
uniform vec3 uPaletteB;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  vec2 camera = (uPointer - 0.5) * uCameraMotion * 0.5;
  vec2 q = p - camera;

  float radius = length(q);
  float angle = atan(q.y, q.x);

  vec3 accumulated = vec3(0.0);
  float total = 0.0;

  // March a handful of layers; each contributes beams at a different scale and speed.
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float layerDepth = (fi + 1.0) / 6.0;

    // Perspective: distant layers collapse toward the vanishing point.
    float scale = 1.0 / (0.35 + layerDepth * uDepth);
    float travel = uTime * uTravel * (0.4 + layerDepth * 1.6);
    float a = angle + travel * 0.35;
    float r = radius * scale * 3.0;

    float beams = cos(a * uBeamCount + fi * 1.7) * 0.5 + 0.5;
    beams = pow(beams, 4.0);

    // Beams fade with radius and are occluded near the tunnel mouth.
    float falloff = smoothstep(0.9, 0.05, r);
    float vignette = smoothstep(0.0, 0.28, r);

    float intensity = beams * falloff * vignette * (0.35 + layerDepth * 0.5);
    vec3 tint = mix(uPaletteA, uPaletteB, layerDepth);

    accumulated += tint * intensity;
    total += intensity;
  }

  // Central light source at the vanishing point.
  accumulated += vec3(0.75, 0.88, 1.0) * exp(-radius * 9.0) * 1.4;

  // Fog: distance darkens the edges so the tunnel reads as deep space.
  float fog = smoothstep(1.05, 0.15, radius);
  accumulated *= fog;
  accumulated *= 0.75 + uBloom * 0.9;

  float alpha = clamp(total * 0.9 + fog * 0.35, 0.0, 1.0);
  gl_FragColor = vec4(accumulated, alpha);
}
`;

/** Spatial glitch: sliced RGB-separated offsets with a decaying burst envelope. */
export const GLITCH_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uIntensity;
uniform float uSlices;
uniform float uRgbShift;
uniform float uBurst;
uniform float uDuration;
uniform float uVertical;
uniform float uAmount;

vec3 scene(vec2 p) {
  float a = cxFbm(p * 2.4 + uTime * 0.06);
  float b = cxFbm(p * 5.1 - uTime * 0.09);
  vec3 c = mix(vec3(0.05, 0.08, 0.18), vec3(0.18, 0.36, 0.85), a);
  return mix(c, vec3(0.5, 0.22, 0.7), b * 0.5);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0);
  float pointerInfluence = exp(-length(p - pointer) * 3.0);

  float energy = uIntensity * (0.35 + uBurst * (1.0 - uAmount)) + pointerInfluence * uIntensity * 0.9;
  energy = clamp(energy, 0.0, 1.4);

  // Slice index: either horizontal bands or vertical columns.
  float axis = uVertical > 0.5 ? p.x : p.y;
  float slice = floor(axis * uSlices);
  float sliceSeed = cxHash(vec2(slice, floor(uTime * 12.0)));
  float sliceShift = (sliceSeed - 0.5) * energy * 0.35;

  vec2 offset = uVertical > 0.5 ? vec2(sliceShift, 0.0) : vec2(0.0, sliceShift);
  vec2 uv = p + offset;

  // Channel separation; stronger at the burst peak.
  float sep = uRgbShift * energy * 0.02;
  vec3 color;
  color.r = scene(uv + vec2(sep, 0.0)).r;
  color.g = scene(uv).g;
  color.b = scene(uv - vec2(sep, 0.0)).b;

  // Scanline dropout.
  float scan = step(0.94, cxHash(vec2(floor(uv.y * 240.0), floor(uTime * 20.0))));
  color = mix(color, color * 0.35, scan * energy * 0.7);

  // A bright tear at the slice boundary.
  float edge = abs(fract(axis * uSlices) - 0.5);
  color += vec3(0.7, 0.85, 1.0) * smoothstep(0.48, 0.5, edge) * energy * 0.35;

  gl_FragColor = vec4(color, 1.0);
}
`;

/** Dimensional portal: layered concentric rings, spiral particles and a refractive core. */
export const PORTAL_FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uRingCount;
uniform float uPortalDepth;
uniform float uRotation;
uniform float uParticleDensity;
uniform float uGlow;
uniform float uActivation;
uniform vec3 uCore;
uniform vec3 uAccent;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float radius = length(p);
  float angle = atan(p.y, p.x);
  float hover = uActivation;

  // Rings rotate in alternating directions.
  float rings = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    if (fi >= uRingCount) break;
    float rBase = (0.12 + fi * 0.052) * (1.0 + uPortalDepth * 0.18);
    float wobble = sin(angle * 3.0 + uTime * (fi * 0.4 + 0.6) * (mod(fi, 2.0) < 0.5 ? 1.0 : -1.0)) * 0.006;
    float ring = exp(-pow((radius - rBase - wobble) * 120.0, 2.0));
    rings += ring * (0.5 + 0.5 * sin(fi * 2.1 + uTime));
  }

  // Spiral particles converging on or escaping the mouth.
  float spiral = fract((angle / 6.28318) * 3.0 + radius * 5.0 - uTime * uRotation * 0.5);
  float particles = smoothstep(0.94, 1.0, spiral) * smoothstep(0.95, 0.15, radius);
  particles *= step(0.62, cxHash(vec2(floor(angle * 22.0), floor(radius * 26.0 - uTime * 2.0))));
  particles *= uParticleDensity;

  // Core: a warped disc that reads as depth behind the rings.
  float coreMask = smoothstep(0.16, 0.02, radius);
  vec2 coreUv = p / max(radius * 2.4, 0.03);
  float warp = cxFbm(coreUv * 2.2 + uTime * 0.12);
  vec3 coreColor = mix(uCore * 0.2, uAccent, warp);
  coreColor *= coreMask * (0.85 + hover * 0.8);

  float rim = exp(-pow((radius - 0.155) * 60.0, 2.0));
  vec3 color = coreColor;
  color += mix(uAccent, vec3(1.0), 0.4) * rim * (1.2 + uGlow);
  color += uAccent * rings * (0.55 + uGlow * 0.7) * (0.6 + hover * 0.8);
  color += vec3(1.0) * particles * 0.9;

  float alpha = clamp(coreMask + rings + particles * 0.8 + rim, 0.0, 1.0) * smoothstep(0.62, 0.52, radius);
  gl_FragColor = vec4(color * alpha, alpha);
}
`;
