export const SPHERE_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vWorldPos;

uniform vec3 uColor;
uniform vec3 uLightDir;
uniform vec3 uEye;
uniform float uLighting;
uniform float uGlow;
uniform float uGlowIntensity;
uniform float uIsCentral;

out vec4 fragColor;

void main() {
  vec3 n = normalize(vNormal);
  vec3 l = normalize(uLightDir);
  vec3 v = normalize(uEye - vWorldPos);
  float diff = max(dot(n, l), 0.0);
  vec3 h = normalize(l + v);
  float spec = pow(max(dot(n, h), 0.0), mix(36.0, 64.0, uIsCentral));
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.2);

  float ambient = mix(0.18, 0.28, uIsCentral);
  float lit = ambient + diff * (0.5 + uLighting * 0.4);
  vec3 col = uColor * lit;

  // Soft ice specular
  col += vec3(0.85, 0.95, 1.0) * spec * (0.12 + uLighting * 0.28) * mix(0.7, 1.15, uIsCentral);

  // Cool rim / atmospheric fringe
  vec3 rimCol = mix(uColor, vec3(0.55, 0.85, 1.0), 0.55);
  col += rimCol * rim * (0.2 + uGlow * uGlowIntensity * 0.85);
  col += vec3(0.35, 0.7, 1.0) * rim * uGlow * uGlowIntensity * mix(0.25, 0.55, uIsCentral);

  fragColor = vec4(col, 1.0);
}
`;

export const SPHERE_FRAG_WEBGL1 = `
precision highp float;

varying vec3 vNormal;
varying vec3 vWorldPos;

uniform vec3 uColor;
uniform vec3 uLightDir;
uniform vec3 uEye;
uniform float uLighting;
uniform float uGlow;
uniform float uGlowIntensity;
uniform float uIsCentral;

void main() {
  vec3 n = normalize(vNormal);
  vec3 l = normalize(uLightDir);
  vec3 v = normalize(uEye - vWorldPos);
  float diff = max(dot(n, l), 0.0);
  vec3 h = normalize(l + v);
  float spec = pow(max(dot(n, h), 0.0), mix(36.0, 64.0, uIsCentral));
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.2);

  float ambient = mix(0.18, 0.28, uIsCentral);
  float lit = ambient + diff * (0.5 + uLighting * 0.4);
  vec3 col = uColor * lit;

  col += vec3(0.85, 0.95, 1.0) * spec * (0.12 + uLighting * 0.28) * mix(0.7, 1.15, uIsCentral);

  vec3 rimCol = mix(uColor, vec3(0.55, 0.85, 1.0), 0.55);
  col += rimCol * rim * (0.2 + uGlow * uGlowIntensity * 0.85);
  col += vec3(0.35, 0.7, 1.0) * rim * uGlow * uGlowIntensity * mix(0.25, 0.55, uIsCentral);

  gl_FragColor = vec4(col, 1.0);
}
`;
