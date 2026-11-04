export const ORBIT_VERT_WEBGL2 = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPos;

uniform mat4 uViewProj;

out float vDepth;

void main() {
  vec4 clip = uViewProj * vec4(aPos, 1.0);
  vDepth = clip.z / max(clip.w, 0.001);
  gl_Position = clip;
}
`;

export const ORBIT_VERT_WEBGL1 = `
precision highp float;

attribute vec3 aPos;

uniform mat4 uViewProj;

varying float vDepth;

void main() {
  vec4 clip = uViewProj * vec4(aPos, 1.0);
  vDepth = clip.z / max(clip.w, 0.001);
  gl_Position = clip;
}
`;
