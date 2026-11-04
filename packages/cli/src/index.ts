#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { runInit } from "./commands/init.js";
import { runAdd } from "./commands/add.js";
import { runList } from "./commands/list.js";
import type { StyleMode } from "./registry/schema.js";

/** Validate a --style value early so a typo fails fast, not mid-install. */
function parseStyle(value: string | undefined): StyleMode | undefined {
  if (value === undefined) return undefined;
  if (value === "tailwind" || value === "coloxo-css") return value;
  console.error(pc.red(`Unknown style "${value}". Use "tailwind" or "coloxo-css".`));
  process.exit(1);
}

const program = new Command();

program
  .name("coloxo")
  .description("Premium Coloxo UI CLI — copy components from the registry into your project")
  .version("1.0.6");

program
  .command("init")
  .description("Initialize coloxo.json and install foundation (styles, utils, theme)")
  .option("-f, --force", "Overwrite existing coloxo.json and files")
  .option("-y, --yes", "Skip prompts")
  .option("--cwd <dir>", "Project directory", process.cwd())
  .option("--registry <path|url>", "Registry directory or JSON URL")
  .option("--style <mode>", "Styling mode: tailwind or coloxo-css")
  .action(
    async (opts: {
      force?: boolean;
      yes?: boolean;
      cwd: string;
      registry?: string;
      style?: string;
    }) => {
      try {
        await runInit({
          cwd: opts.cwd,
          force: opts.force,
          yes: opts.yes,
          registry: opts.registry,
          style: parseStyle(opts.style),
        });
      } catch (err) {
        console.error(pc.red((err as Error).message));
        process.exit(1);
      }
    },
  );

program
  .command("add")
  .description("Add registry components by slug")
  .argument("[slugs...]", "Component slugs to add")
  .option("-o, --overwrite", "Overwrite existing files")
  .option("-y, --yes", "Skip overwrite prompts (skip existing files)")
  .option("--cwd <dir>", "Project directory", process.cwd())
  .option("--registry <path|url>", "Registry directory or JSON URL")
  .option("--style <mode>", "Override styling mode for this install")
  .action(
    async (
      slugs: string[],
      opts: {
        overwrite?: boolean;
        yes?: boolean;
        cwd: string;
        registry?: string;
        style?: string;
      },
    ) => {
      try {
        await runAdd({
          cwd: opts.cwd,
          slugs,
          overwrite: opts.overwrite,
          yes: opts.yes,
          registry: opts.registry,
          style: parseStyle(opts.style),
        });
      } catch (err) {
        console.error(pc.red((err as Error).message));
        process.exit(1);
      }
    },
  );

program
  .command("list")
  .description("List available registry components")
  .option("--cwd <dir>", "Project directory", process.cwd())
  .option("--registry <path|url>", "Registry directory or JSON URL")
  .action(async (opts: { cwd: string; registry?: string }) => {
    try {
      await runList({ cwd: opts.cwd, registry: opts.registry });
    } catch (err) {
      console.error(pc.red((err as Error).message));
      process.exit(1);
    }
  });

program.parse();
