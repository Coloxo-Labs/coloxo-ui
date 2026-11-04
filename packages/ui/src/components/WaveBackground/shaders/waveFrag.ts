/** WebGL2 fragment shader — palette gradient + soft lighting. */
export const WAVE_FRAG_WEBGL2 = `#version 300 es
precision highp float;

in float vHeight;
in vec3 vNormal;
in vec2 vUv;
in float vPointer;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uIntensity;
uniform vec3 uBg;
uniform float uTransparent;

out vec4 fragColor;

void main() {
  float h = clamp(vHeight * 1.6 + 0.5, 0.0, 1.0);
  vec3 base = mix(uColor0, uColor1, smoothstep(0.0, 0.55, h));
  base = mix(base, uColor2, smoothstep(0.4, 1.0, h));

  vec3 n = normalize(vNormal);
  vec3 light = normalize(vec3(0.35, 0.9, 0.45));
  float diff = max(dot(n, light), 0.0);
  vec3 view = normalize(vec3(0.0, 0.55, 1.0));
  vec3 halfV = normalize(light + view);
  float spec = pow(max(dot(n, halfV), 0.0), 32.0);

  float inten = clamp(uIntensity, 0.0, 1.0);
  vec3 col = base * (0.35 + diff * 0.75) * (0.55 + inten * 0.7);
  col += uHighlight * spec * (0.25 + inten * 0.55);
  col += uHighlight * vPointer * 0.45;

  float vignette = smoothstep(0.95, 0.25, length(vUv - 0.5));
  col *= 0.55 + vignette * 0.55;

  float fog = smoothstep(-0.2, 0.55, vHeight);
  col = mix(uBg * 0.35, col, fog);

  float alpha = uTransparent > 0.5 ? (0.55 + fog * 0.4 + vPointer * 0.15) : 1.0;
  if (uTransparent < 0.5) {
    col = mix(uBg, col, 0.85 + fog * 0.15);
  }
  fragColor = vec4(col, alpha);
}
`;

/** WebGL1 fragment shader. */
export const WAVE_FRAG_WEBGL1 = `
precision highp float;

varying float vHeight;
varying vec3 vNormal;
varying vec2 vUv;
varying float vPointer;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uHighlight;
uniform float uIntensity;
uniform vec3 uBg;
uniform float uTransparent;

void main() {
  float h = clamp(vHeight * 1.6 + 0.5, 0.0, 1.0);
  vec3 base = mix(uColor0, uColor1, smoothstep(0.0, 0.55, h));
  base = mix(base, uColor2, smoothstep(0.4, 1.0, h));

  vec3 n = normalize(vNormal);
  vec3 light = normalize(vec3(0.35, 0.9, 0.45));
  float diff = max(dot(n, light), 0.0);
  vec3 view = normalize(vec3(0.0, 0.55, 1.0));
  vec3 halfV = normalize(light + view);
  float spec = pow(max(dot(n, halfV), 0.0), 32.0);

  float inten = clamp(uIntensity, 0.0, 1.0);
  vec3 col = base * (0.35 + diff * 0.75) * (0.55 + inten * 0.7);
  col += uHighlight * spec * (0.25 + inten * 0.55);
  col += uHighlight * vPointer * 0.45;

  float vignette = smoothstep(0.95, 0.25, length(vUv - 0.5));
  col *= 0.55 + vignette * 0.55;

  float fog = smoothstep(-0.2, 0.55, vHeight);
  col = mix(uBg * 0.35, col, fog);

  float alpha = uTransparent > 0.5 ? (0.55 + fog * 0.4 + vPointer * 0.15) : 1.0;
  if (uTransparent < 0.5) {
    col = mix(uBg, col, 0.85 + fog * 0.15);
  }
  gl_FragColor = vec4(col, alpha);
}
`;
