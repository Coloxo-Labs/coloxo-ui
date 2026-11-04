/**
 * Assembles registry/registry.json from registry/base/*.json and registry/components/*.json.
 * Verifies that every declared source file exists on disk.
 */
import { readdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RegistryItemSchema, RegistrySchema, type RegistryItem } from "../registry/schema.ts";
import { allFiles, allRegistryDependencies } from "../packages/cli/src/registry/manifest-files.ts";

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

async function loadJsonFiles(dir: string): Promise<RegistryItem[]> {
  if (!(await exists(dir))) return [];
  const names = (await readdir(dir)).filter((n) => n.endsWith(".json")).sort();
  const items: RegistryItem[] = [];
  for (const name of names) {
    const raw = JSON.parse(await readFile(path.join(dir, name), "utf8"));
    const parsed = RegistryItemSchema.parse(raw);
    items.push(parsed);
  }
  return items;
}

async function main() {
  const items = [
    ...(await loadJsonFiles(path.join(REGISTRY_DIR, "base"))),
    ...(await loadJsonFiles(path.join(REGISTRY_DIR, "components"))),
  ];

  const slugs = new Set<string>();
  const errors: string[] = [];

  for (const item of items) {
    if (slugs.has(item.slug)) {
      errors.push(`Duplicate slug: ${item.slug}`);
    }
    slugs.add(item.slug);

    for (const file of allFiles(item)) {
      const abs = path.join(ROOT, file.path);
      if (!(await exists(abs))) {
        errors.push(`[${item.slug}] missing file: ${file.path}`);
      }
    }

    for (const dep of allRegistryDependencies(item)) {
      if (!items.some((i) => i.slug === dep)) {
        // Allow forward refs that will be resolved after full load — check against collected slugs later
      }
    }
  }

  for (const item of items) {
    for (const dep of allRegistryDependencies(item)) {
      if (!slugs.has(dep)) {
        errors.push(`[${item.slug}] unknown registryDependency: ${dep}`);
      }
    }
  }

  if (errors.length) {
    console.error("Registry build failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }

  const registry = RegistrySchema.parse({
    $schema: "./schema.json",
    name: "coloxo",
    version: "1.0.0",
    items,
  });

  const outPath = path.join(REGISTRY_DIR, "registry.json");
  await writeFile(outPath, JSON.stringify(registry, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outPath} (${items.length} items)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
