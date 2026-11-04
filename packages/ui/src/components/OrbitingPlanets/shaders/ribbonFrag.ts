export const RIBBON_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in float vDepth;
in float vSide;

uniform vec3 uColor;
uniform float uOpacity;

out vec4 fragColor;

void main() {
  float edge = 1.0 - abs(vSide);
  float soft = smoothstep(0.0, 0.55, edge);
  float depthFade = mix(1.0, 0.4, clamp((vDepth - 3.0) * 0.12, 0.0, 1.0));
  float a = uOpacity * soft * depthFade;
  fragColor = vec4(uColor * a, a);
}
`;

export const RIBBON_FRAG_WEBGL1 = `
precision highp float;

varying float vDepth;
varying float vSide;

uniform vec3 uColor;
uniform float uOpacity;

void main() {
  float edge = 1.0 - abs(vSide);
  float soft = smoothstep(0.0, 0.55, edge);
  float depthFade = mix(1.0, 0.4, clamp((vDepth - 3.0) * 0.12, 0.0, 1.0));
  float a = uOpacity * soft * depthFade;
  gl_FragColor = vec4(uColor * a, a);
}
`;
