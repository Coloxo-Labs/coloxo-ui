export const SPARKLE_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in vec2 vUv;
in float vTwinkle;

uniform vec3 uColor;

out vec4 fragColor;

void main() {
  float d = length(vUv);
  float a = exp(-d * d * 8.0) * vTwinkle * 0.85;
  if (a < 0.02) discard;
  fragColor = vec4(uColor * a, a);
}
`;

export const SPARKLE_FRAG_WEBGL1 = `
precision highp float;

varying vec2 vUv;
varying float vTwinkle;

uniform vec3 uColor;

void main() {
  float d = length(vUv);
  float a = exp(-d * d * 8.0) * vTwinkle * 0.85;
  if (a < 0.02) discard;
  gl_FragColor = vec4(uColor * a, a);
}
`;
