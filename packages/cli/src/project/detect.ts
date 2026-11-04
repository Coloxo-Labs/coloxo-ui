import fs from "node:fs/promises";
import path from "node:path";

export type ProjectFramework = "next" | "vite" | "unknown";

export type ProjectInfo = {
  hasPackageJson: boolean;
  hasTypeScript: boolean;
  hasSrcDir: boolean;
  framework: ProjectFramework;
};

export async function detectProject(cwd: string): Promise<ProjectInfo> {
  const hasPackageJson = await fileExists(path.join(cwd, "package.json"));
  const hasTypeScript =
    (await fileExists(path.join(cwd, "tsconfig.json"))) ||
    (await fileExists(path.join(cwd, "tsconfig.app.json")));
  const hasSrcDir = await fileExists(path.join(cwd, "src"));

  let framework: ProjectFramework = "unknown";
  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(await fs.readFile(path.join(cwd, "package.json"), "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) framework = "next";
      else if (deps.vite || deps["@vitejs/plugin-react"]) framework = "vite";
    } catch {
      // ignore
    }
  }

  return { hasPackageJson, hasTypeScript, hasSrcDir, framework };
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function requirePackageJson(cwd: string): Promise<void> {
  const info = await detectProject(cwd);
  if (!info.hasPackageJson) {
    throw new Error(`No package.json found in ${cwd}. Run coloxo init from your project root.`);
  }
}
