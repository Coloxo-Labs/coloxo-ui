export const RIBBON_VERT_WEBGL2 = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPos;
layout(location = 1) in float aSide;

uniform mat4 uView;
uniform mat4 uProj;
uniform float uHalfWidth;

out float vDepth;
out float vSide;

void main() {
  vec4 viewPos = uView * vec4(aPos, 1.0);
  // Expand along view-space X (camera right in view space is +X after lookAt)
  viewPos.x += aSide * uHalfWidth;
  vDepth = -viewPos.z;
  vSide = aSide;
  gl_Position = uProj * viewPos;
}
`;

export const RIBBON_VERT_WEBGL1 = `
precision highp float;

attribute vec3 aPos;
attribute float aSide;

uniform mat4 uView;
uniform mat4 uProj;
uniform float uHalfWidth;

varying float vDepth;
varying float vSide;

void main() {
  vec4 viewPos = uView * vec4(aPos, 1.0);
  viewPos.x += aSide * uHalfWidth;
  vDepth = -viewPos.z;
  vSide = aSide;
  gl_Position = uProj * viewPos;
}
`;
