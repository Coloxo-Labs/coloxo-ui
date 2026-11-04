import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { StyleModeSchema } from "../registry/schema.js";

export const AliasesSchema = z.object({
  components: z.string().default("@/components/ui"),
  utils: z.string().default("@/lib/utils"),
  styles: z.string().default("@/styles"),
});

export const ColoxoConfigSchema = z.object({
  $schema: z.string().optional(),
  version: z.string().default("1"),
  /**
   * Styling mode used by `add`. Chosen during init from what the project
   * actually has installed; read back on every subsequent install.
   */
  style: StyleModeSchema.default("coloxo-css"),
  aliases: AliasesSchema.default({}),
  /** Local registry directory or remote registry.json URL */
  registry: z.string().optional(),
  /**
   * Base URL for repo-root-relative source paths when `registry` is remote.
   * Example: https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/
   */
  registryContentBase: z.string().url().optional(),
  installed: z.array(z.string()).default([]),
});

export type ColoxoConfig = z.infer<typeof ColoxoConfigSchema>;
export type ColoxoStyle = ColoxoConfig["style"];
export type ColoxoAliases = z.infer<typeof AliasesSchema>;

export const CONFIG_FILENAME = "coloxo.json";

export function defaultConfig(): ColoxoConfig {
  return ColoxoConfigSchema.parse({});
}

export async function readConfig(cwd: string): Promise<ColoxoConfig | undefined> {
  const file = path.join(cwd, CONFIG_FILENAME);
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = ColoxoConfigSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Invalid ${CONFIG_FILENAME}: ${parsed.error.message}`);
    }
    return parsed.data;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw err;
  }
}

export async function writeConfig(cwd: string, config: ColoxoConfig): Promise<void> {
  const file = path.join(cwd, CONFIG_FILENAME);
  const data = JSON.stringify(config, null, 2) + "\n";
  await fs.writeFile(file, data, "utf8");
}

export async function mergeInstalled(cwd: string, slugs: string[]): Promise<ColoxoConfig> {
  const existing = (await readConfig(cwd)) ?? defaultConfig();
  const installed = new Set(existing.installed);
  for (const s of slugs) installed.add(s);
  const next = { ...existing, installed: [...installed].sort() };
  await writeConfig(cwd, next);
  return next;
}
