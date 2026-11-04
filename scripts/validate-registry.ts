/**
 * CI gate: validate registry manifests, file integrity, and dependency graph.
 */
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RegistryItemSchema, RegistrySchema, type RegistryItem } from "../registry/schema.ts";
import {
  allFiles,
  allRegistryDependencies,
  styleShapeErrors,
  tailwindImportErrors,
} from "../packages/cli/src/registry/manifest-files.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY_DIR = path.join(ROOT, "registry");

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadAll(): Promise<RegistryItem[]> {
  const assembled = path.join(REGISTRY_DIR, "registry.json");
  if (await exists(assembled)) {
    const raw = JSON.parse(await readFile(assembled, "utf8"));
    return RegistrySchema.parse(raw).items;
  }

  const items: RegistryItem[] = [];
  for (const sub of ["base", "components"]) {
    const dir = path.join(REGISTRY_DIR, sub);
    if (!(await exists(dir))) continue;
    for (const name of (await readdir(dir)).filter((n) => n.endsWith(".json"))) {
      items.push(
        RegistryItemSchema.parse(JSON.parse(await readFile(path.join(dir, name), "utf8"))),
      );
    }
  }
  return items;
}

async function main() {
  const items = await loadAll();
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push("Registry is empty");
  }

  for (const item of items) {
    // Forbidden: shell / script fields (security)
    const json = JSON.stringify(item);
    if (/"shell"|"postInstall"|"scripts"/i.test(json) && /"shell"|"postInstall"/.test(json)) {
      errors.push(`[${item.slug}] forbidden executable metadata field`);
    }

    for (const file of allFiles(item)) {
      if (!(await exists(path.join(ROOT, file.path)))) {
        errors.push(`[${item.slug}] missing: ${file.path}`);
      }
      if (file.path.includes("..")) {
        errors.push(`[${item.slug}] path traversal: ${file.path}`);
      }
    }

    for (const dep of allRegistryDependencies(item)) {
      if (!bySlug.has(dep)) {
        errors.push(`[${item.slug}] unknown registryDependency: ${dep}`);
      }
    }

    // Cycle detection (simple DFS)
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (slug: string, stack: string[]) => {
      if (visited.has(slug)) return;
      if (visiting.has(slug)) {
        errors.push(`Cycle: ${[...stack, slug].join(" → ")}`);
        return;
      }
      visiting.add(slug);
      const node = bySlug.get(slug);
      for (const d of node ? allRegistryDependencies(node) : []) {
        visit(d, [...stack, slug]);
      }
      visiting.delete(slug);
      visited.add(slug);
    };
    visit(item.slug, []);
  }

  // Tailwind files must not smuggle CSS Modules or token CSS back in
  for (const item of items) {
    const contents = new Map<string, string>();
    for (const file of allFiles(item)) {
      try {
        contents.set(file.path, await readFile(path.join(ROOT, file.path), "utf8"));
      } catch {
        // missing files are reported above
      }
    }
    for (const issue of tailwindImportErrors(item, contents)) {
      errors.push(issue);
    }
  }

  // Folder-structure contract per style mode
  for (const item of items) {
    for (const issue of styleShapeErrors(item)) {
      errors.push(issue);
    }
  }

  // Tier 0 required
  for (const required of ["styles", "utils", "theme"]) {
    if (!bySlug.has(required)) {
      errors.push(`Missing required base item: ${required}`);
    }
  }

  if (errors.length) {
    console.error(
      `validate-registry FAILED (${errors.length} issues):\n` +
        errors.map((e) => `  - ${e}`).join("\n"),
    );
    process.exit(1);
  }

  console.log(`validate-registry OK (${items.length} items)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
