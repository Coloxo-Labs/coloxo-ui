/**
 * Detect which styling modes a project can use.
 *
 * Tailwind is never assumed: a project without tailwindcss installed cannot
 * consume Tailwind utilities, so offering that mode would produce broken code.
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { StyleMode } from "../registry/schema.js";

export type DetectedStyles = {
  /** tailwindcss is a direct dependency. */
  tailwind: boolean;
  /** Major version when it can be read from the lockfile-free package.json. */
  tailwindMajor: number | undefined;
  /** A tailwind config exists (v3/early v4 setups). */
  tailwindConfigured: boolean;
};

type Pkg = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function majorOf(spec: string | undefined): number | undefined {
  if (!spec) return undefined;
  const m = /(\d+)/.exec(spec.replace(/^[\^~>=<\s]*/, ""));
  return m ? Number(m[1]) : undefined;
}

export async function detectStyles(cwd: string): Promise<DetectedStyles> {
  let pkg: Pkg = {};
  try {
    pkg = JSON.parse(await fs.readFile(path.join(cwd, "package.json"), "utf8")) as Pkg;
  } catch {
    // no package.json; caller handles that separately
  }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const tailwindConfigured =
    (await exists(path.join(cwd, "tailwind.config.ts"))) ||
    (await exists(path.join(cwd, "tailwind.config.js"))) ||
    (await exists(path.join(cwd, "tailwind.config.mjs"))) ||
    (await exists(path.join(cwd, "tailwind.config.cjs")));

  return {
    tailwind: Boolean(deps.tailwindcss),
    tailwindMajor: majorOf(deps.tailwindcss),
    tailwindConfigured,
  };
}

/**
 * Pick a default style without asking when the answer is unambiguous:
 * only choose Tailwind when the project actually has it.
 */
export function defaultStyle(detected: DetectedStyles): StyleMode {
  return detected.tailwind ? "tailwind" : "coloxo-css";
}
