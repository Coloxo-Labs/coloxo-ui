export const GLOW_QUAD_VERT_WEBGL2 = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;

uniform vec3 uCenter;
uniform float uSize;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform mat4 uViewProj;

out vec2 vUv;

void main() {
  vUv = aCorner;
  vec3 world = uCenter + uCamRight * aCorner.x * uSize + uCamUp * aCorner.y * uSize;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;

export const GLOW_QUAD_VERT_WEBGL1 = `
precision highp float;

attribute vec2 aCorner;

uniform vec3 uCenter;
uniform float uSize;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform mat4 uViewProj;

varying vec2 vUv;

void main() {
  vUv = aCorner;
  vec3 world = uCenter + uCamRight * aCorner.x * uSize + uCamUp * aCorner.y * uSize;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;
