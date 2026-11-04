/** Soft disc particle — WebGL2. */
export const VORTEX_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in vec4 vColor;
in float vSoft;
out vec4 fragColor;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = length(p);
  float soft = max(vSoft, 0.001);
  float a = smoothstep(1.0, 0.15 * soft, d);
  a *= a;
  if (a < 0.004) discard;
  fragColor = vec4(vColor.rgb, vColor.a * a);
}
`;

/** Soft disc particle — WebGL1. */
export const VORTEX_FRAG_WEBGL1 = `
precision highp float;

varying vec4 vColor;
varying float vSoft;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = length(p);
  float soft = max(vSoft, 0.001);
  float a = smoothstep(1.0, 0.15 * soft, d);
  a *= a;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor.rgb, vColor.a * a);
}
`;
