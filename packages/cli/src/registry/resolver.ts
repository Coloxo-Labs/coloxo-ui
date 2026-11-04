import type { RegistryClient } from "./client.js";
import type { RegistryItem, StyleMode } from "./schema.js";
import { resolveForStyle } from "./style-resolve.js";

export class RegistryResolveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistryResolveError";
  }
}

/**
 * Registry dependencies of an item for a given style. Without a style this
 * falls back to the manifest's top-level list, preserving old behaviour.
 */
function depsOf(item: RegistryItem, style?: StyleMode): string[] {
  if (!style) return item.registryDependencies;
  return resolveForStyle(item, style).registryDependencies;
}
/** Resolve slugs and transitive registryDependencies (dependency-first order, deduped). */
export async function resolveRegistryItems(
  client: RegistryClient,
  slugs: string[],
  style?: StyleMode,
): Promise<RegistryItem[]> {
  const all = await client.listItems();
  const bySlug = new Map(all.map((i) => [i.slug, i]));

  const needed = new Set<string>();
  const queue = [...slugs];

  while (queue.length > 0) {
    const slug = queue.shift()!;
    if (needed.has(slug)) continue;
    const item = bySlug.get(slug);
    if (!item) {
      throw new RegistryResolveError(`Unknown registry item: "${slug}"`);
    }
    needed.add(slug);
    for (const dep of depsOf(item, style)) {
      if (!needed.has(dep)) {
        queue.push(dep);
      }
    }
  }

  const ordered: RegistryItem[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(slug: string): void {
    if (visited.has(slug)) return;
    if (visiting.has(slug)) {
      throw new RegistryResolveError(`Circular registry dependency involving "${slug}"`);
    }
    visiting.add(slug);
    const item = bySlug.get(slug);
    if (item) {
      for (const dep of depsOf(item, style)) {
        if (needed.has(dep)) visit(dep);
      }
      ordered.push(item);
    }
    visiting.delete(slug);
    visited.add(slug);
  }

  for (const slug of slugs) {
    if (needed.has(slug)) visit(slug);
  }
  for (const slug of needed) {
    visit(slug);
  }

  return dedupeBySlug(ordered);
}

export function dedupeBySlug(items: RegistryItem[]): RegistryItem[] {
  const seen = new Set<string>();
  const out: RegistryItem[] = [];
  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}

export function collectNpmDependencies(items: RegistryItem[], style?: StyleMode): string[] {
  const deps = new Set<string>();
  for (const item of items) {
    const declared = style ? resolveForStyle(item, style).dependencies : item.dependencies;
    for (const d of declared) {
      deps.add(d);
    }
  }
  return [...deps].sort();
}
