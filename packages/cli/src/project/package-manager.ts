import fs from "node:fs/promises";
import path from "node:path";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

const LOCKFILES: { file: string; pm: PackageManager }[] = [
  { file: "pnpm-lock.yaml", pm: "pnpm" },
  { file: "package-lock.json", pm: "npm" },
  { file: "yarn.lock", pm: "yarn" },
  { file: "bun.lockb", pm: "bun" },
  { file: "bun.lock", pm: "bun" },
];

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  let dir = path.resolve(cwd);
  const root = path.parse(dir).root;

  while (true) {
    for (const { file, pm } of LOCKFILES) {
      try {
        await fs.access(path.join(dir, file));
        return pm;
      } catch {
        // continue
      }
    }
    if (dir === root) break;
    dir = path.dirname(dir);
  }
  return "npm";
}

export function installCommand(pm: PackageManager, packages: string[]): string[] {
  if (packages.length === 0) return [];
  switch (pm) {
    case "pnpm":
      return ["pnpm", "add", ...packages];
    case "yarn":
      return ["yarn", "add", ...packages];
    case "bun":
      return ["bun", "add", ...packages];
    default:
      return ["npm", "install", ...packages];
  }
}
