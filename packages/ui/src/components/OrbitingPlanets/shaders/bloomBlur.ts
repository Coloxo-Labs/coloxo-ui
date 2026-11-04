export const BLOOM_BLUR_VERT_WEBGL2 = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aPos;
out vec2 vUv;

void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const BLOOM_BLUR_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;
uniform vec2 uTexel;
out vec4 fragColor;

void main() {
  vec2 off = uDir * uTexel;
  vec4 c = texture(uTex, vUv) * 0.227027;
  c += texture(uTex, vUv + off) * 0.1945946;
  c += texture(uTex, vUv - off) * 0.1945946;
  c += texture(uTex, vUv + off * 2.0) * 0.1216216;
  c += texture(uTex, vUv - off * 2.0) * 0.1216216;
  c += texture(uTex, vUv + off * 3.0) * 0.054054;
  c += texture(uTex, vUv - off * 3.0) * 0.054054;
  fragColor = c;
}
`;

export const BLOOM_COMPOSITE_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in vec2 vUv;
uniform sampler2D uTex;
uniform float uStrength;
out vec4 fragColor;

void main() {
  vec4 c = texture(uTex, vUv);
  fragColor = vec4(c.rgb * uStrength, c.a * uStrength);
}
`;
