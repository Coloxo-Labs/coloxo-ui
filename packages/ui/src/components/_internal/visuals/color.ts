export type RGB = { r: number; g: number; b: number };

const HEX_SHORT = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX_LONG = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const RGB_FN = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i;

/** Parses hex and rgb() strings. Returns `null` for anything else (named colors, hsl). */
export function parseColor(value: string): RGB | null {
  const input = value.trim();
  const short = HEX_SHORT.exec(input);
  if (short) {
    const r = short[1] ?? "0";
    const g = short[2] ?? "0";
    const b = short[3] ?? "0";
    return {
      r: parseInt(`${r}${r}`, 16) / 255,
      g: parseInt(`${g}${g}`, 16) / 255,
      b: parseInt(`${b}${b}`, 16) / 255,
    };
  }
  const long = HEX_LONG.exec(input);
  if (long) {
    return {
      r: parseInt(long[1] ?? "0", 16) / 255,
      g: parseInt(long[2] ?? "0", 16) / 255,
      b: parseInt(long[3] ?? "0", 16) / 255,
    };
  }
  const fn = RGB_FN.exec(input);
  if (fn) {
    return {
      r: Math.min(255, Number(fn[1] ?? 0)) / 255,
      g: Math.min(255, Number(fn[2] ?? 0)) / 255,
      b: Math.min(255, Number(fn[3] ?? 0)) / 255,
    };
  }
  return null;
}

/**
 * Keeps only values that parse, falling back to `fallback` when the caller passed nothing usable.
 * Shader uniform arrays cannot hold CSS keywords, so unparseable entries are dropped here rather
 * than silently rendering black.
 */
export function sanitizePalette(colors: readonly string[] | undefined, fallback: readonly string[]): string[] {
  const parsed = (colors ?? []).filter((color) => typeof color === "string" && parseColor(color));
  return parsed.length > 0 ? parsed.slice(0, 8) : [...fallback];
}

export function toRgb(colors: readonly string[], fallback: RGB): RGB[] {
  const parsed = colors.map(parseColor).filter((c): c is RGB => c !== null);
  return parsed.length > 0 ? parsed : [fallback];
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export function rgbToCss({ r, g, b }: RGB, alpha = 1): string {
  const to255 = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  return alpha >= 1
    ? `rgb(${to255(r)} ${to255(g)} ${to255(b)})`
    : `rgb(${to255(r)} ${to255(g)} ${to255(b)} / ${alpha})`;
}

/** RGB triple in 0..1 for shader uniforms, with a safe fallback for unparseable input. */
export function rgbTriple(value: string | undefined, fallback: RGB): [number, number, number] {
  if (!value) return [fallback.r, fallback.g, fallback.b];
  const parsed = parseColor(value);
  return parsed ? [parsed.r, parsed.g, parsed.b] : [fallback.r, fallback.g, fallback.b];
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/** Reads a numeric prop defensively: non-finite input falls back instead of poisoning the frame. */
export function numeric(value: number | undefined, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}
