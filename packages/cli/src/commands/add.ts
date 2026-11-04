import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import { readConfig, mergeInstalled } from "../project/config.js";
import { detectProject, requirePackageJson } from "../project/detect.js";
import { createRegistryClient } from "../registry/factory.js";
import { resolveRegistryItems } from "../registry/resolver.js";
import { installRegistryItems } from "../installer/files.js";
import { installNpmDependencies } from "../installer/dependencies.js";
import type { StyleMode } from "../registry/schema.js";
import { COLOXO_CSS_PACKAGE } from "../registry/style-resolve.js";

export type AddOptions = {
  cwd: string;
  slugs: string[];
  overwrite?: boolean;
  yes?: boolean;
  registry?: string;
  style?: StyleMode;
};

export async function runAdd(options: AddOptions): Promise<void> {
  const cwd = path.resolve(options.cwd);

  if (options.slugs.length === 0) {
    throw new Error("Provide at least one component slug, e.g. coloxo add button");
  }

  await requirePackageJson(cwd);
  const config = await readConfig(cwd);
  if (!config) {
    throw new Error(`Missing coloxo.json in ${cwd}. Run ${pc.bold("coloxo init")} first.`);
  }

  p.intro(pc.bgCyan(pc.black(` coloxo add ${options.slugs.join(" ")} `)));
  p.log.step(`Style: ${pc.bold(options.style ?? config.style)}`);

  const project = await detectProject(cwd);
  const client = await createRegistryClient({
    cwd,
    config,
    registryFlag: options.registry,
  });

  const style = options.style ?? config.style;
  const items = await resolveRegistryItems(client, options.slugs, style);
  const { created, skipped } = await installRegistryItems({
    cwd,
    client,
    items,
    config,
    project,
    conflict: { overwrite: !!options.overwrite, yes: !!options.yes },
  });

  const { installed: npmDeps } = await installNpmDependencies(cwd, items, style);
  await mergeInstalled(
    cwd,
    items.map((i) => i.slug),
  );

  if (created.length > 0) {
    p.log.success("Created:");
    for (const f of created) {
      p.log.message(`  ${pc.green("+")} ${f}`);
    }
  }
  if (skipped.length > 0) {
    p.log.warn("Skipped (already exists):");
    for (const f of skipped) {
      p.log.message(`  ${pc.yellow("−")} ${f}`);
    }
  }
  if (npmDeps.length > 0) {
    p.log.step(`npm dependencies: ${npmDeps.join(", ")}`);
  }
  if (npmDeps.includes(COLOXO_CSS_PACKAGE)) {
    p.log.message(
      pc.dim(
        `Coloxo CSS styles were added to package.json via ${COLOXO_CSS_PACKAGE}. Import "@coloxo/ui/styles.css" once at the app root.`,
      ),
    );
  }

  const addedTheme = items.some((i) => i.slug === "theme" || i.providers?.includes("theme"));
  if (addedTheme) {
    p.log.message(
      pc.dim("Add ThemeProvider at your app root and import coloxo token CSS if not already."),
    );
  }

  p.outro(pc.green("Done."));
}
