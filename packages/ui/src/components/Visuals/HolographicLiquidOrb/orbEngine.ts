import {
  GLSL_HEADER,
  ShaderEngine,
  type ShaderProgramSpec,
} from "../../_internal/visuals/shaderEngine";
import { GLSL_UTILS } from "../../_internal/visuals/glsl";
import type { FrameInfo } from "../../_internal/visuals/visualEngine";
import type { OrbColorScheme, OrbQuality } from "./types";
import { numeric } from "../../_internal/visuals/color";

export type OrbOptions = {
  iridescence: number;
  distortion: number;
  rotationSpeed: number;
  interactionStrength: number;
  scale: number;
  quality: OrbQuality;
  paused: boolean;
};

const QUALITY_DPR: Record<OrbQuality, number> = { low: 1, medium: 1.5, high: 2 };

const SCHEME_INDEX: Record<OrbColorScheme, number> = {
  iridescent: 0,
  aurora: 1,
  sunset: 2,
  ocean: 3,
  monochrome: 4,
};

/**
 * Ray-marched sphere with an animated normal field: the "liquid" look comes from perturbing the
 * sphere normal with flow noise rather than from a mesh, so there is no geometry to upload and the
 * whole effect is one full-screen pass.
 */
const FRAGMENT = `${GLSL_HEADER}
${GLSL_UTILS}
uniform float uIridescence;
uniform float uDistortion;
uniform float uRotation;
uniform float uInteraction;
uniform float uScale;
uniform float uScheme;

vec3 schemeColor(float t) {
  float s = uScheme;
  // Blue-dominant, low-saturation ramp: the hue range is deliberately narrow so the surface
  // reads as an oil film rather than a full-spectrum rainbow.
  vec3 iridescent = vec3(
    0.34 + 0.26 * sin(6.28318 * (t + 0.02)),
    0.52 + 0.30 * sin(6.28318 * (t + 0.31)),
    0.80 + 0.18 * sin(6.28318 * (t + 0.63))
  );
  vec3 aurora = vec3(
    0.35 + 0.45 * sin(6.28318 * (t + 0.05)),
    0.62 + 0.3 * sin(6.28318 * (t + 0.32)),
    0.55 + 0.35 * sin(6.28318 * (t + 0.61))
  );
  vec3 sunset = vec3(
    0.92 + 0.08 * sin(6.28318 * (t + 0.02)),
    0.42 + 0.3 * sin(6.28318 * (t + 0.28)),
    0.4 + 0.42 * sin(6.28318 * (t + 0.55))
  );
  vec3 ocean = vec3(
    0.18 + 0.2 * sin(6.28318 * (t + 0.1)),
    0.55 + 0.3 * sin(6.28318 * (t + 0.4)),
    0.78 + 0.2 * sin(6.28318 * (t + 0.72))
  );
  float mono = 0.55 + 0.4 * sin(6.28318 * t);
  vec3 monochrome = vec3(mono * 0.92, mono * 0.95, mono);

  if (s < 0.5) return iridescent;
  if (s < 1.5) return aurora;
  if (s < 2.5) return sunset;
  if (s < 3.5) return ocean;
  return clamp(monochrome, 0.0, 1.0);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  uv.x *= aspect;

  vec2 pointerOffset = vec2(0.0);
  if (uPointerInside > 0.5) {
    pointerOffset = (uPointer * 2.0 - 1.0) * vec2(aspect, 1.0) * 0.12 * uInteraction;
  }
  vec2 local = uv - pointerOffset;
  // Rotate the sampling space, which spins the flow field without moving the silhouette.
  local = mat2(cos(uRotation), -sin(uRotation), sin(uRotation), cos(uRotation)) * local;

  float radius = 0.82 * uScale;
  float dist2 = dot(local, local);
  float mask = cxDisc(local, radius, 0.012);
  if (mask <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // True sphere normal first (z >= 0, so it is never the zero vector), then perturb. Deriving the
  // noise from the normal rather than from the planar coordinate avoids a singular centre point.
  vec2 p = local / max(radius, 0.001);
  float z = sqrt(max(1.0 - dist2 / (radius * radius), 0.0));
  vec3 normal = normalize(vec3(p, z));

  float n1 = cxFbm(normal.xy * 2.3 + vec2(uTime * 0.11, uTime * 0.07));
  float n2 = cxFbm(normal.xy * 4.6 - vec2(uTime * 0.06, uTime * 0.09));
  normal = normalize(normal + vec3(n1 - 0.5, n2 - 0.5, 0.0) * uDistortion * 0.9);

  vec3 view = vec3(0.0, 0.0, 1.0);
  float facing = clamp(dot(normal, view), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, 3.0);

  vec3 lightDir = normalize(vec3(-0.45, 0.6, 0.85));
  float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);
  vec3 halfDir = normalize(lightDir + view);
  float specular = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 64.0);

  // Pointer pressure: a local bulge where the cursor sits, so the surface reads as pressed on.
  vec2 pointerLocal = (uPointer * 2.0 - 1.0) * vec2(aspect, 1.0) - pointerOffset;
  float press = uPointerInside * uInteraction * smoothstep(0.55, 0.0, length(pointerLocal - local));

  // Two flows at different rates; their interference is what reads as a moving oil film.
  float flow = cxFbm(normal.xy * 1.8 + vec2(uTime * 0.09, -uTime * 0.06) + press * 0.6);
  float film = cxFbm(normal.xy * 3.4 + vec2(-uTime * 0.14, uTime * 0.1) - press * 0.8);
  float ramp = fract(flow * 0.8 + film * 0.5 + uTime * 0.03 + press * 0.25);
  vec3 filmColor = schemeColor(ramp);
  vec3 deep = schemeColor(fract(ramp + 0.5)) * 0.35;

  vec3 color = mix(deep, filmColor, 0.55 + 0.35 * uIridescence);
  color *= 0.28 + 0.82 * diffuse;
  color += filmColor * fresnel * (0.35 + 0.5 * uIridescence);
  color += specular * vec3(1.0) * 0.6;

  // Rim light keeps the silhouette crisp against dark backgrounds.
  float rim = smoothstep(0.55, 1.0, length(p));
  color += rim * mix(vec3(0.55, 0.7, 1.0), filmColor, 0.5) * 0.45;

  color *= mask;
  gl_FragColor = vec4(color, mask);
}
`;

export class OrbEngine extends ShaderEngine {
  private options: OrbOptions;
  private scheme: OrbColorScheme;

  constructor(
    container: HTMLElement,
    canvas: HTMLCanvasElement,
    options: OrbOptions,
    scheme: OrbColorScheme,
  ) {
    super(container, canvas, { maxDpr: QUALITY_DPR[options.quality] });
    this.options = options;
    this.scheme = scheme;
    this.setPaused(options.paused);
  }

  setOptions(options: OrbOptions, scheme: OrbColorScheme): void {
    this.options = options;
    this.scheme = scheme;
    this.setPaused(options.paused);
  }

  protected shader(): ShaderProgramSpec {
    return { fragment: FRAGMENT };
  }

  protected setFrameUniforms(gl: WebGLRenderingContext, frame: FrameInfo): void {
    const set = (name: string, value: number) => {
      const loc = this.uniform(name);
      if (loc) gl.uniform1f(loc, value);
    };
    set("uIridescence", this.options.iridescence);
    set("uDistortion", this.options.distortion);
    set("uInteraction", this.options.interactionStrength);
    set("uScale", this.options.scale);
    set("uScheme", SCHEME_INDEX[this.scheme] ?? 0);
    set("uRotation", frame.time * this.options.rotationSpeed * 0.5);
  }
}

export function orbOptions(input: {
  iridescence?: number;
  distortion?: number;
  rotationSpeed?: number;
  interactionStrength?: number;
  scale?: number;
  quality?: OrbQuality;
  paused?: boolean;
}): OrbOptions {
  return {
    iridescence: numeric(input.iridescence, 0.85, 0, 1),
    distortion: numeric(input.distortion, 0.4, 0, 1),
    rotationSpeed: numeric(input.rotationSpeed, 0.35, 0, 3),
    interactionStrength: numeric(input.interactionStrength, 0.6, 0, 1),
    scale: numeric(input.scale, 0.78, 0.2, 0.95),
    quality: input.quality ?? "medium",
    paused: input.paused ?? false,
  };
}
