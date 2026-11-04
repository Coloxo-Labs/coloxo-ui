import path from "node:path";
import type { RegistryFile, RegistryItem, StyleMode } from "./schema.js";

/**
 * Every file an item can declare, across all styles. Used by build and
 * validate so a missing source is caught regardless of which mode ships it.
 */
export function allFiles(item: RegistryItem): RegistryFile[] {
  const files: RegistryFile[] = [...(item.files ?? [])];
  for (const entry of Object.values(item.styles ?? {})) {
    if (entry) files.push(...entry.files);
  }
  return files;
}

export function allRegistryDependencies(item: RegistryItem): string[] {
  const deps = new Set<string>(item.registryDependencies ?? []);
  for (const entry of Object.values(item.styles ?? {})) {
    for (const d of entry?.registryDependencies ?? []) deps.add(d);
  }
  return [...deps];
}

/**
 * Folder-structure contract per styling mode. This is the invariant that keeps
 * the two modes honest:
 *
 * - `tailwind`   → flat `components/ui/<slug>.tsx`, no CSS Modules, no folder.
 * - `coloxo-css` → `components/ui/<slug>/<file>`, CSS Modules allowed.
 *
 * Simple components must stay simple in Tailwind mode; a folder per component
 * is the problem this mode exists to remove.
 */
export const TAILWIND_FLAT_ALLOWED = true;

export function styleShapeErrors(item: RegistryItem): string[] {
  const errors: string[] = [];

  const check = (style: StyleMode) => {
    const entry = item.styles?.[style];
    if (!entry) return;

    for (const file of entry.files) {
      const target = file.target.replace(/\\/g, "/");
      const segments = target.split("/").filter(Boolean);
      const base = segments[segments.length - 1] ?? "";

      if (segments.some((s) => s === "..")) {
        errors.push(`[${item.slug}] path traversal in ${style} target: ${file.target}`);
      }

      if (style === "tailwind") {
        if (base.endsWith(".module.css")) {
          errors.push(`[${item.slug}] tailwind target must not be a CSS Module: ${file.target}`);
        }
        /*
         * Components land as a single flat file. Shared libraries keep their
         * folder: `icons` is a multi-file set and `utils` needs an index for
         * `@/lib/utils` to resolve, and neither is a component the consumer
         * edits in place.
         */
        const isAsset = /\.(css|json|md)$/i.test(base) || base === "index.ts";
        if (!isAsset && item.type !== "registry:lib" && segments.length > 1) {
          errors.push(
            `[${item.slug}] tailwind target must be flat (components/ui/${base}), got: ${file.target}`,
          );
        }
      }

      /*
       * Only component packages are folder-shaped. Shared utilities and theme
       * providers are flat by design, so the rule must not reach them.
       */
      if (
        style === "coloxo-css" &&
        item.type === "registry:ui" &&
        /\.(tsx|ts)$/.test(base) &&
        segments.length < 2
      ) {
        errors.push(
          `[${item.slug}] coloxo-css component file must sit in its folder, got: ${file.target}`,
        );
      }
    }
  };

  check("tailwind");
  check("coloxo-css");
  return errors;
}

/**
 * Tailwind mode cannot ship a component that still imports a CSS Module or a
 * Coloxo token stylesheet; that would defeat the point of the mode.
 */
export function tailwindImportErrors(item: RegistryItem, contents: Map<string, string>): string[] {
  const entry = item.styles?.tailwind;
  if (!entry) return [];
  const errors: string[] = [];
  for (const file of entry.files) {
    const content = contents.get(file.path);
    if (content === undefined) continue;
    if (/\.module\.css["']/.test(content)) {
      errors.push(`[${item.slug}] tailwind file imports a CSS Module: ${file.path}`);
    }
    if (/styles\/(tokens|primitives)\.css/.test(content)) {
      errors.push(`[${item.slug}] tailwind file imports Coloxo token CSS: ${file.path}`);
    }
  }
  return errors;
}

export function targetBasename(file: RegistryFile): string {
  return path.basename(file.target);
}
