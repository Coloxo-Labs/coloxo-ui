import pc from "picocolors";
import path from "node:path";
import { readConfig } from "../project/config.js";
import { createRegistryClient } from "../registry/factory.js";
import type { RegistryItem } from "../registry/schema.js";

export type ListOptions = {
  cwd: string;
  registry?: string;
};

function groupByCategory(items: RegistryItem[]): Map<string, RegistryItem[]> {
  const map = new Map<string, RegistryItem[]>();
  for (const item of items) {
    const cat =
      item.category ??
      (item.type === "registry:style" || item.type === "registry:lib"
        ? "Foundation"
        : item.type === "registry:theme"
          ? "Foundation"
          : "Uncategorized");
    const list = map.get(cat) ?? [];
    list.push(item);
    map.set(cat, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.slug.localeCompare(b.slug));
  }
  return map;
}

export async function runList(options: ListOptions): Promise<void> {
  const cwd = path.resolve(options.cwd);
  const config = await readConfig(cwd);
  const client = await createRegistryClient({
    cwd,
    config: config ?? undefined,
    registryFlag: options.registry,
  });

  const items = await client.listItems();
  const installed = new Set(config?.installed ?? []);
  const grouped = groupByCategory(items);

  console.log(pc.bold("\nColoxo registry\n"));

  for (const [category, list] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(pc.cyan(` ${category}`));
    for (const item of list) {
      const mark = installed.has(item.slug) ? pc.green("●") : pc.dim("○");
      const status = item.status !== "stable" ? pc.dim(` (${item.status})`) : "";
      console.log(`  ${mark} ${pc.bold(item.slug)}${status} — ${item.description}`);
    }
    console.log();
  }
}
