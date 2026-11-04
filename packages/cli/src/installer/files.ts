import fs from "node:fs/promises";
import path from "node:path";
import type { RegistryClient } from "../registry/client.js";
import type { RegistryFile, RegistryItem } from "../registry/schema.js";
import { resolveForStyle } from "../registry/style-resolve.js";
import type { ColoxoConfig } from "../project/config.js";
import type { ProjectInfo } from "../project/detect.js";
import { resolveInstallPath } from "./paths.js";
import { transformFileContent } from "./transforms.js";
import { shouldWriteFile, type ConflictPolicy } from "./conflict.js";

export type InstallResult = {
  created: string[];
  skipped: string[];
};

type Planned = {
  item: RegistryItem;
  file: RegistryFile;
  abs: string;
  rel: string;
  siblingRenames: Record<string, string>;
};

export async function installRegistryItems(options: {
  cwd: string;
  client: RegistryClient;
  items: RegistryItem[];
  config: ColoxoConfig;
  project: ProjectInfo;
  conflict: ConflictPolicy;
}): Promise<InstallResult> {
  const { cwd, client, items, config, project, conflict } = options;
  const style = config.style;

  /*
   * Build the full plan first. Resolving every target before writing means a
   * conflict or a bad manifest is reported before the tree is touched, so a
   * multi-file component never lands half-installed.
   */
  const plan: Planned[] = [];
  for (const item of items) {
    const { files } = resolveForStyle(item, style);
    const siblingRenames: Record<string, string> = {};
    for (const f of files) {
      const fromBase = path.basename(f.path);
      const toBase = path.basename(f.target);
      if (fromBase !== toBase) siblingRenames[fromBase] = toBase;
    }
    for (const file of files) {
      const { abs, rel } = resolveInstallPath(item, file, config, project, cwd);
      plan.push({ item, file, abs, rel, siblingRenames });
    }
  }

  const existing = new Set<string>();
  for (const p of plan) {
    try {
      await fs.access(p.abs);
      existing.add(p.abs);
    } catch {
      // target is free
    }
  }

  const approved = new Set<string>();
  const policy: ConflictPolicy = {
    ...conflict,
    preflightConflicts: [...existing].map((abs) => path.relative(cwd, abs)),
  };
  for (const abs of existing) {
    if (await shouldWriteFile(abs, policy)) approved.add(abs);
  }

  const created: string[] = [];
  const skipped: string[] = [];

  for (const p of plan) {
    if (existing.has(p.abs) && !approved.has(p.abs)) {
      skipped.push(p.rel);
      continue;
    }

    let raw: string | Buffer;
    try {
      raw = await client.readSource(p.file.path);
    } catch (err) {
      throw new Error(
        `Cannot read source file ${p.file.path} for "${p.item.slug}": ${(err as Error).message}`,
      );
    }

    const isBinary =
      p.file.path.endsWith(".png") || p.file.path.endsWith(".jpg") || p.file.path.endsWith(".webp");

    await fs.mkdir(path.dirname(p.abs), { recursive: true });
    if (isBinary) {
      await fs.writeFile(p.abs, raw);
    } else {
      const text = typeof raw === "string" ? raw : Buffer.from(raw).toString("utf8");
      const content = transformFileContent(text, p.file.path, {
        config,
        items,
        siblingRenames: p.siblingRenames,
      });
      await fs.writeFile(p.abs, content, "utf8");
    }
    created.push(p.rel);
  }

  return { created, skipped };
}
