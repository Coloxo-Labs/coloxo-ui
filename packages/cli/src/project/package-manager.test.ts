import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectPackageManager, installCommand } from "./package-manager.js";

const tmpDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "coloxo-cli-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tmpDirs.splice(0)) {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

describe("detectPackageManager", () => {
  it("detects pnpm from pnpm-lock.yaml", async () => {
    const dir = await makeTempDir();
    await fs.writeFile(path.join(dir, "pnpm-lock.yaml"), "", "utf8");
    expect(await detectPackageManager(dir)).toBe("pnpm");
  });

  it("detects npm from package-lock.json", async () => {
    const dir = await makeTempDir();
    await fs.writeFile(path.join(dir, "package-lock.json"), "{}", "utf8");
    expect(await detectPackageManager(dir)).toBe("npm");
  });
});

describe("installCommand", () => {
  it("builds pnpm add command", () => {
    expect(installCommand("pnpm", ["clsx"])).toEqual(["pnpm", "add", "clsx"]);
  });
});
