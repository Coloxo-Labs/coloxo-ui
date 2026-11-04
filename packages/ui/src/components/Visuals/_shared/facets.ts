export type Facet = {
  key: string;
  label: string;
  value: number;
};

export function steps(...labels: string[]): Facet[] {
  return labels.map((label, index) => ({ key: String(index), label, value: index }));
}

/** Enum prop -> shader index. Unknown values fall back so a typo cannot black out the effect. */
export function facetIndex(
  options: readonly string[],
  value: string | undefined,
  fallback: number,
): number {
  const index = options.indexOf(value ?? "");
  return index >= 0 ? index : fallback;
}
