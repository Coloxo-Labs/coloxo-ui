export type GradientType = "linear" | "radial";

export type GradientStop = {
  id: string;
  color: string;
  /** 0–100 */
  position: number;
};

export type GradientValue = {
  type: GradientType;
  /** Degrees — used when `type` is `linear`. */
  angle: number;
  stops: GradientStop[];
};

export const DEFAULT_GRADIENT: GradientValue = {
  type: "linear",
  angle: 90,
  stops: [
    { id: "stop-1", color: "#2348ff", position: 0 },
    { id: "stop-2", color: "#db2777", position: 100 },
  ],
};

let stopSeq = 0;
export function createStopId() {
  stopSeq += 1;
  return `stop-${Date.now()}-${stopSeq}`;
}

export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

export function gradientToCss(value: GradientValue): string {
  const stops = sortStops(value.stops)
    .map((stop) => `${stop.color} ${clamp(stop.position, 0, 100)}%`)
    .join(", ");
  if (value.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }
  return `linear-gradient(${clamp(value.angle, 0, 360)}deg, ${stops})`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function updateStop(
  value: GradientValue,
  stopId: string,
  patch: Partial<Pick<GradientStop, "color" | "position">>,
): GradientValue {
  return {
    ...value,
    stops: value.stops.map((stop) =>
      stop.id === stopId
        ? {
            ...stop,
            ...patch,
            position:
              patch.position != null ? clamp(patch.position, 0, 100) : stop.position,
          }
        : stop,
    ),
  };
}

export function addStop(value: GradientValue, color = "#ffffff"): GradientValue {
  const sorted = sortStops(value.stops);
  const mid =
    sorted.length >= 2
      ? (sorted[0]!.position + sorted[sorted.length - 1]!.position) / 2
      : 50;
  return {
    ...value,
    stops: [
      ...value.stops,
      { id: createStopId(), color, position: Math.round(mid) },
    ],
  };
}

export function removeStop(value: GradientValue, stopId: string): GradientValue {
  if (value.stops.length <= 2) return value;
  return {
    ...value,
    stops: value.stops.filter((stop) => stop.id !== stopId),
  };
}
