import { spawn } from "node:child_process";
import { collectNpmDependencies } from "../registry/resolver.js";
import type { RegistryItem, StyleMode } from "../registry/schema.js";
import {
  detectPackageManager,
  installCommand,
  type PackageManager,
} from "../project/package-manager.js";

export async function installNpmDependencies(
  cwd: string,
  items: RegistryItem[],
  style?: StyleMode,
): Promise<{ installed: string[]; skipped: boolean }> {
  const packages = collectNpmDependencies(items, style);
  if (packages.length === 0) {
    return { installed: [], skipped: true };
  }

  const pm = await detectPackageManager(cwd);
  const cmd = installCommand(pm, packages);
  await runCommand(cmd, cwd);
  return { installed: packages, skipped: false };
}

function runCommand(args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [bin, ...rest] = args;
    const child = spawn(bin, rest, { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${bin} exited with code ${code}`));
    });
  });
}

export { type PackageManager };
