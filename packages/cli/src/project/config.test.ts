import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { CONFIG_FILENAME, defaultConfig, readConfig, writeConfig } from "./config.js";

const tmpDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "coloxo-config-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tmpDirs.splice(0)) {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

describe("coloxo config", () => {
  it("writes and reads coloxo.json with defaults", async () => {
    const dir = await makeTempDir();
    const config = defaultConfig();
    await writeConfig(dir, config);
    const raw = await fs.readFile(path.join(dir, CONFIG_FILENAME), "utf8");
    expect(JSON.parse(raw).aliases.components).toBe("@/components/ui");

    const read = await readConfig(dir);
    expect(read?.aliases.utils).toBe("@/lib/utils");
  });

  it("returns undefined when config missing", async () => {
    const dir = await makeTempDir();
    expect(await readConfig(dir)).toBeUndefined();
  });
});
