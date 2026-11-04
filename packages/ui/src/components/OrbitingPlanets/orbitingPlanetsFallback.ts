export type FallbackRgb = { r: number; g: number; b: number };

export function staticOrbitCss(
  central: FallbackRgb,
  planets: FallbackRgb[],
  orbit: FallbackRgb,
  background: FallbackRgb,
  transparent: boolean,
): string {
  const bg = transparent ? "transparent" : `rgb(${background.r},${background.g},${background.b})`;
  const layers: string[] = [];

  // Soft core halo
  layers.push(
    `radial-gradient(circle at 50% 48%, rgba(${central.r},${central.g},${central.b},0.55) 0 6%, rgba(${central.r},${central.g},${central.b},0.18) 16%, transparent 34%)`,
  );

  // Orbit ellipses
  for (let i = 0; i < Math.min(planets.length, 8); i++) {
    const s = 22 + i * 8;
    layers.push(
      `radial-gradient(ellipse ${s}% ${Math.round(s * 0.68)}% at 50% 50%, transparent ${s - 0.8}%, rgba(${orbit.r},${orbit.g},${orbit.b},0.28) ${s}%, transparent ${s + 0.9}%)`,
    );
  }

  // Planet dots
  for (let i = 0; i < Math.min(planets.length, 10); i++) {
    const p = planets[i]!;
    const x = 50 + Math.cos(i * 0.95 + 0.4) * (16 + i * 4.2);
    const y = 50 + Math.sin(i * 0.95 + 0.4) * (11 + i * 3.1);
    layers.push(
      `radial-gradient(circle at ${x}% ${y}%, rgba(${p.r},${p.g},${p.b},0.95) 0 2px, transparent 3.5px)`,
    );
  }

  // Central body
  layers.push(
    `radial-gradient(circle at 50% 48%, rgba(${central.r},${central.g},${central.b},0.98) 0 5%, rgba(${central.r},${central.g},${central.b},0.4) 9%, transparent 16%)`,
  );
  layers.push(
    `linear-gradient(180deg, ${bg}, rgb(${background.r},${background.g},${background.b}))`,
  );
  return layers.join(", ");
}
