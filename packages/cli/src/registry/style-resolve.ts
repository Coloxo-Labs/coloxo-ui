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
  const entry = entryFor(item, style);
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
    dependencies: entry.dependencies ?? [],
    registryDependencies: entry.registryDependencies ?? [],
    cssImports: entry.cssImports ?? [],
  };
}
