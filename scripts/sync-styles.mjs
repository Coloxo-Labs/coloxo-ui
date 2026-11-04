import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reg = JSON.parse(readFileSync(path.join(root, "registry/registry.json"), "utf8"));

function available(item) {
  const styles = [];
  if (item.styles?.tailwind) styles.push("tailwind");
  if (item.styles?.["coloxo-css"]) styles.push("coloxo-css");
  if (styles.length === 0 && item.files) styles.push("coloxo-css");
  return styles;
}

const entries = reg.items
  .map((item) => [item.slug, available(item)])
  .sort((a, b) => a[0].localeCompare(b[0]));

const lines = entries.map(
  ([slug, styles]) => `  "${slug}": [${styles.map((style) => `"${style}"`).join(", ")}],`,
);

const counts = { "coloxo-css": 0, tailwind: 0 };
let dual = 0;
for (const [, styles] of entries) {
  if (styles.includes("coloxo-css")) counts["coloxo-css"] += 1;
  if (styles.includes("tailwind")) counts.tailwind += 1;
  if (styles.includes("coloxo-css") && styles.includes("tailwind")) dual += 1;
}

const body = `/**
 * GENERATED FILE - do not edit by hand.
 * Source: registry/registry.json. Regenerate with \`pnpm styles:build\`.
 *
 * Style availability per component, derived with the same rule the CLI uses so
 * the documentation cannot promise a style the installer would reject.
 */

export type StyleMode = "coloxo-css" | "tailwind";

export const STYLE_MODES: StyleMode[] = ["coloxo-css", "tailwind"];

/** Slugs whose \`availableStyles()\` includes the given mode. */
export const COMPONENT_STYLES: Record<string, StyleMode[]> = {
${lines.join("\n")}
};

export const STYLE_COUNTS: Record<StyleMode, number> = {
  "coloxo-css": ${counts["coloxo-css"]},
  tailwind: ${counts.tailwind},
};

/** Items shipping in both modes. */
export const DUAL_STYLE_COUNT = ${dual};

export function stylesFor(slug: string): StyleMode[] {
  return COMPONENT_STYLES[slug] ?? [];
}
`;

writeFileSync(path.resolve(root, "../ui-playground/content/styles.ts"), body);
console.log(
  `styles.ts: ${entries.length} slugs, coloxo-css ${counts["coloxo-css"]}, tailwind ${counts.tailwind}, dual ${dual}`,
);
