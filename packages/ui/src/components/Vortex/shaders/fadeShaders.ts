/** Fullscreen fade / blit — WebGL2 (triangle VBO; same layout as WebGL1). */
export const FADE_VERT_WEBGL2 = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FADE_FRAG_WEBGL2 = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uFade;
out vec4 fragColor;
void main() {
  vec4 c = texture(uTex, vUv);
  fragColor = c * uFade;
}
`;

/** Fullscreen fade / blit — WebGL1 (uses a small VBO for the triangle). */
export const FADE_VERT_WEBGL1 = `
precision highp float;
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FADE_FRAG_WEBGL1 = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uFade;
void main() {
  vec4 c = texture2D(uTex, vUv);
  gl_FragColor = c * uFade;
}
`;
