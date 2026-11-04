export const GLOW_QUAD_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in vec2 vUv;

uniform vec3 uColor;
uniform float uIntensity;

out vec4 fragColor;

void main() {
  float d = length(vUv);
  float soft = exp(-d * d * 2.8);
  float outer = exp(-d * d * 1.1) * 0.45;
  float a = (soft + outer) * uIntensity;
  if (a < 0.004) discard;
  fragColor = vec4(uColor * a, a);
}
`;

export const GLOW_QUAD_FRAG_WEBGL1 = `
precision highp float;

varying vec2 vUv;

uniform vec3 uColor;
uniform float uIntensity;

void main() {
  float d = length(vUv);
  float soft = exp(-d * d * 2.8);
  float outer = exp(-d * d * 1.1) * 0.45;
  float a = (soft + outer) * uIntensity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor * a, a);
}
`;
