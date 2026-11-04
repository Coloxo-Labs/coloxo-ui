import type { RegistryFile, RegistryItem, StyleEntry, StyleMode } from "./schema.js";

export type ResolvedItem = {
  item: RegistryItem;
  /** Files to install for the chosen style, with explicit target paths. */
  files: RegistryFile[];
  /** Third-party packages required by this style. */
  dependencies: string[];
  /** Registry slugs required by this style. */
  registryDependencies: string[];
  cssImports: string[];
};

/**
 * Manifests predate styling modes. Treat a legacy manifest as Coloxo CSS,
 * which is what its flat file list was written for.
 */
export const LEGACY_STYLE: StyleMode = "coloxo-css";

/** npm package that ships the Coloxo CSS stylesheet (`@coloxo/ui/styles.css`). */
export const COLOXO_CSS_PACKAGE = "@coloxo/ui";

const VISUAL_SUPPORT_SLUGS = new Set(["visual-runtime", "visual-shared"]);
const VISUAL_BACKGROUND_SLUGS = new Set([
  "fluid-background",
  "vortex",
  "wave-background",
  "orbiting-planets",
]);

/** Effects that exist only as Coloxo CSS, including their shared runtime. */
export function isColoxoCssVisual(item: RegistryItem): boolean {
  if (VISUAL_SUPPORT_SLUGS.has(item.slug) || VISUAL_BACKGROUND_SLUGS.has(item.slug)) return true;
  const deps = new Set(item.registryDependencies ?? []);
  for (const entry of Object.values(item.styles ?? {})) {
    for (const dep of entry?.registryDependencies ?? []) deps.add(dep);
  }
  return deps.has("visual-runtime") || deps.has("visual-shared");
}

function withCssPackage(dependencies: string[]): string[] {
  return dependencies.includes(COLOXO_CSS_PACKAGE)
    ? dependencies
    : [...dependencies, COLOXO_CSS_PACKAGE];
}

export function availableStyles(item: RegistryItem): StyleMode[] {
  const styles: StyleMode[] = [];
  if (item.styles?.tailwind) styles.push("tailwind");
  if (item.styles?.["coloxo-css"]) styles.push("coloxo-css");
  if (styles.length === 0 && item.files) styles.push(LEGACY_STYLE);
  return styles;
}

function entryFor(item: RegistryItem, style: StyleMode): StyleEntry | undefined {
  const entry = item.styles?.[style];
  if (entry) return entry;
  if (style === LEGACY_STYLE && item.files) {
    return {
      files: item.files,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      cssImports: item.cssImports,
    };
  }
  return undefined;
}

/**
 * Resolve one item for a style. Throws when the style is unavailable so the
 * caller reports a real error instead of silently installing the wrong shape.
 */
export function resolveForStyle(item: RegistryItem, style: StyleMode): ResolvedItem {
  const visual = isColoxoCssVisual(item);
  // Visuals have no Tailwind source. A Tailwind project still receives the
  // Coloxo CSS files, and the stylesheet package is installed from npm.
  const entry =
    entryFor(item, style) ??
    (style === "tailwind" && visual ? entryFor(item, LEGACY_STYLE) : undefined);
  if (!entry) {
    const offered = availableStyles(item);
    throw new Error(
      `"${item.slug}" is not available for style "${style}".` +
        (offered.length ? ` Available styles: ${offered.join(", ")}.` : " It declares no files."),
    );
  }
  return {
    item,
    files: entry.files,
    dependencies: visual ? withCssPackage(entry.dependencies ?? []) : (entry.dependencies ?? []),
    registryDependencies: entry.registryDependencies ?? [],
    cssImports: entry.cssImports ?? [],
  };
}
