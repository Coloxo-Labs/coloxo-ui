export const SPARKLE_VERT_WEBGL2 = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec3 aCenter;
layout(location = 2) in float aSeed;

uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform mat4 uViewProj;
uniform float uTime;
uniform float uSize;

out vec2 vUv;
out float vTwinkle;

void main() {
  vUv = aCorner;
  float tw = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 6.28);
  vTwinkle = tw;
  float s = uSize * (0.7 + aSeed * 0.5) * (0.85 + tw * 0.25);
  vec3 world = aCenter + uCamRight * aCorner.x * s + uCamUp * aCorner.y * s;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;

export const SPARKLE_VERT_WEBGL1 = `
precision highp float;

attribute vec2 aCorner;
attribute vec3 aCenter;
attribute float aSeed;

uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform mat4 uViewProj;
uniform float uTime;
uniform float uSize;

varying vec2 vUv;
varying float vTwinkle;

void main() {
  vUv = aCorner;
  float tw = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 6.28);
  vTwinkle = tw;
  float s = uSize * (0.7 + aSeed * 0.5) * (0.85 + tw * 0.25);
  vec3 world = aCenter + uCamRight * aCorner.x * s + uCamUp * aCorner.y * s;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;
