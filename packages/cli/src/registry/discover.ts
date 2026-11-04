import fs from "node:fs/promises";
import path from "node:path";

/** Walk up from startDir looking for a registry directory. */
export async function discoverRegistryRoot(startDir: string): Promise<string | undefined> {
  let dir = path.resolve(startDir);
  const root = path.parse(dir).root;

  while (true) {
    const candidate = path.join(dir, "registry");
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        const hasJson = await fileExists(path.join(candidate, "registry.json"));
        const hasBase = await fileExists(path.join(candidate, "base"));
        if (hasJson || hasBase) {
          return candidate;
        }
      }
    } catch {
      // not found
    }
    if (dir === root) break;
    dir = path.dirname(dir);
  }
  return undefined;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}


export function resolveRegistryPath(options: {
  cwd: string;
  envDir?: string;
  cliPath?: string;
  configPath?: string;
}): string | undefined {
  if (options.cliPath) {
    return path.isAbsolute(options.cliPath)
      ? options.cliPath
      : path.join(options.cwd, options.cliPath);
  }
  if (options.envDir) {
    return path.isAbsolute(options.envDir) ? options.envDir : path.join(options.cwd, options.envDir);
  }
  if (options.configPath) {
    return path.isAbsolute(options.configPath)
      ? options.configPath
      : path.join(options.cwd, options.configPath);
  }
  return undefined;
}

/** Repo root is the parent of the `registry/` directory. */
export async function inferRepoRoot(registryRoot: string): Promise<string> {
  return path.dirname(registryRoot);
}
