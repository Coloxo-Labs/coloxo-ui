export const ORBIT_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in float vDepth;

uniform vec3 uColor;
uniform float uOpacity;

out vec4 fragColor;

void main() {
  float fade = mix(1.0, 0.35, clamp(vDepth * 0.55 + 0.35, 0.0, 1.0));
  fragColor = vec4(uColor, uOpacity * fade);
}
`;

export const ORBIT_FRAG_WEBGL1 = `
precision highp float;

varying float vDepth;

uniform vec3 uColor;
uniform float uOpacity;

void main() {
  float fade = mix(1.0, 0.35, clamp(vDepth * 0.55 + 0.35, 0.0, 1.0));
  gl_FragColor = vec4(uColor, uOpacity * fade);
}
`;
