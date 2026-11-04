import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "node:fs/promises";
import { defaultConfig, mergeInstalled, readConfig, writeConfig } from "../project/config.js";
import { detectProject, requirePackageJson } from "../project/detect.js";
import { detectPackageManager } from "../project/package-manager.js";
import { createRegistryClient } from "../registry/factory.js";
import { resolveRegistryItems } from "../registry/resolver.js";
import { installRegistryItems } from "../installer/files.js";
import { installNpmDependencies } from "../installer/dependencies.js";
import { resolveInstallPath } from "../installer/paths.js";
import { detectStyles, defaultStyle } from "../project/styles.js";
import { resolveForStyle } from "../registry/style-resolve.js";
import type { StyleMode } from "../registry/schema.js";

export type InitOptions = {
  cwd: string;
  force?: boolean;
  yes?: boolean;
  registry?: string;
  style?: StyleMode;
  yesStyle?: boolean;
};

const TIER_ZERO = ["styles", "utils", "theme"] as const;

export async function runInit(options: InitOptions): Promise<void> {
  const cwd = path.resolve(options.cwd);
  p.intro(pc.bgCyan(pc.black(" coloxo init ")));

  await requirePackageJson(cwd);
  const project = await detectProject(cwd);
  const pm = await detectPackageManager(cwd);
  const detectedStyles = await detectStyles(cwd);
  const style = await chooseStyle(options, detectedStyles);

  const existing = await readConfig(cwd);
  if (existing && !options.force) {
    if (options.yes) {
      p.log.warn(`${pc.cyan("coloxo.json")} already exists; use --force to reinitialize.`);
      p.outro("Skipped.");
      return;
    }
    const cont = await p.confirm({
      message: "coloxo.json already exists. Overwrite?",
      initialValue: false,
    });
    if (p.isCancel(cont) || !cont) {
      p.cancel("Init cancelled.");
      process.exit(1);
    }
  }

  const config = defaultConfig();
  config.style = style;
  const registrySource =
    options.registry ??
    process.env.COLOXO_REGISTRY_DIR ??
    process.env.COLOXO_REGISTRY_PATH;
  if (registrySource) {
    config.registry = registrySource;
  }

  const client = await createRegistryClient({
    cwd,
    config,
    registryFlag: options.registry,
  });

  // Persist discovered local registry path so later `add` works without rediscovery.
  if (!config.registry && "getRegistryRoot" in client) {
    const root = (client as { getRegistryRoot?: () => string }).getRegistryRoot?.();
    if (root) config.registry = root;
  }

  await writeConfig(cwd, config);
  p.log.success(`Created ${pc.cyan("coloxo.json")}`);

  p.log.step(`Detected package manager: ${pc.bold(pm)}`);
  p.log.step(`Styling mode: ${pc.bold(style)}`);
  if (detectedStyles.tailwind) {
    p.log.info(`Tailwind CSS ${detectedStyles.tailwindMajor ?? ""} detected`.trim());
  }
  if (project.hasTypeScript) {
    p.log.step("TypeScript project detected");
  }

  const items = await resolveRegistryItems(client, [...TIER_ZERO]);
  const dirs = new Set<string>();
  for (const item of items) {
    for (const file of resolveForStyle(item, style).files) {
      const { rel } = resolveInstallPath(item, file, config, project, cwd);
      dirs.add(path.dirname(rel));
    }
  }
  for (const d of dirs) {
    await fs.mkdir(path.join(cwd, d), { recursive: true });
  }

  const { created } = await installRegistryItems({
    cwd,
    client,
    items,
    config,
    project,
    conflict: { overwrite: !!options.force, yes: !!options.yes },
  });

  await installNpmDependencies(cwd, items, style);
  await mergeInstalled(cwd, items.map((i) => i.slug));

  p.log.success(`Installed foundation: ${TIER_ZERO.join(", ")}`);
  if (created.length > 0) {
    p.log.info(`Created ${created.length} file(s)`);
  }

  p.log.message(
    pc.dim("Wrap your app with ThemeProvider from the theme component when ready."),
  );
  p.outro(pc.green("Project initialized."));
}

/**
 * Styling mode is detected when possible. A prompt only appears when the
 * project has Tailwind but could plausibly want Coloxo CSS, and the caller
 * did not pass --style or non-interactive --yes.
 */
async function chooseStyle(
  options: InitOptions,
  detected: Awaited<ReturnType<typeof detectStyles>>,
): Promise<StyleMode> {
  if (options.style) return options.style;
  if (!detected.tailwind) return "coloxo-css";
  if (options.yes) return defaultStyle(detected);

  const answer = await p.select({
    message: "Which styling mode should components use?",
    initialValue: "tailwind",
    options: [
      {
        value: "tailwind",
        label: "Tailwind CSS",
        hint: "one .tsx file per simple component, no CSS Modules",
      },
      {
        value: "coloxo-css",
        label: "Coloxo CSS",
        hint: "component folder with a CSS Module, no Tailwind needed",
      },
    ],
  });
  if (p.isCancel(answer)) {
    p.cancel("Init cancelled.");
    process.exit(1);
  }
  return answer as StyleMode;
}
