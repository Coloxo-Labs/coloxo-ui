import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { RegistryClient } from "../registry/client.js";
import type { RegistryItem } from "../registry/schema.js";
import { defaultConfig } from "../project/config.js";
import { installRegistryItems } from "./files.js";

let dir: string;

const item: RegistryItem = {
  name: "Button",
  slug: "button",
  type: "registry:ui",
  description: "button",
  styles: {
    tailwind: {
      files: [{ path: "src/tw/button.tsx", target: "button.tsx" }],
      dependencies: [],
      registryDependencies: [],
    },
    "coloxo-css": {
      files: [
        { path: "src/css/button.tsx", target: "button/button.tsx" },
        { path: "src/css/button.module.css", target: "button/button.module.css" },
      ],
      dependencies: [],
      registryDependencies: [],
    },
  },
};

/** Fake client whose source root is a temp dir holding the manifest files. */
function client(): RegistryClient {
  return {
    listItems: async () => [item],
    getItem: async () => item,
    getSourceRoot: async () => dir,
    readSource: async (filePath: string) => {
      const abs = path.isAbsolute(filePath) ? filePath : path.join(dir, filePath);
      return fs.readFile(abs, "utf8");
    },
  };
}

async function seed() {
  await fs.mkdir(path.join(dir, "src/tw"), { recursive: true });
  await fs.mkdir(path.join(dir, "src/css"), { recursive: true });
  await fs.writeFile(path.join(dir, "src/tw/button.tsx"), "export const TW = 1;\n");
  await fs.writeFile(path.join(dir, "src/css/button.tsx"), "export const CSS = 1;\n");
  await fs.writeFile(path.join(dir, "src/css/button.module.css"), ".a{}\n");
}

async function install(style: "tailwind" | "coloxo-css", conflict = { overwrite: false, yes: true }) {
  const config = { ...defaultConfig(), style };
  return installRegistryItems({
    cwd: dir,
    client: client(),
    items: [item],
    config,
    project: {
      hasPackageJson: true,
      hasTypeScript: true,
      hasSrcDir: false,
      framework: "next",
    },
    conflict,
  });
}

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "coloxo-install-"));
  await seed();
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("installRegistryItems", () => {
  it("writes a single flat file in tailwind mode", async () => {
    const { created } = await install("tailwind");
    expect(created).toEqual(["components/ui/button.tsx"]);
    await expect(fs.access(path.join(dir, "components/ui/button/button.tsx"))).rejects.toThrow();
  });

  it("writes a component folder with its CSS Module in coloxo-css mode", async () => {
    const { created } = await install("coloxo-css");
    expect(created.sort()).toEqual([
      "components/ui/button/button.module.css",
      "components/ui/button/button.tsx",
    ]);
    await expect(fs.access(path.join(dir, "components/ui/button.tsx"))).rejects.toThrow();
  });

  it("skips existing files under --yes without partially overwriting", async () => {
    await install("tailwind");
    const before = await fs.readFile(path.join(dir, "components/ui/button.tsx"), "utf8");
    const { created, skipped } = await install("tailwind");
    expect(created).toEqual([]);
    expect(skipped).toEqual(["components/ui/button.tsx"]);
    expect(await fs.readFile(path.join(dir, "components/ui/button.tsx"), "utf8")).toBe(before);
  });

  it("overwrites when overwrite is set", async () => {
    await install("tailwind");
    await fs.writeFile(path.join(dir, "components/ui/button.tsx"), "stale\n");
    const { created } = await install("tailwind", { overwrite: true, yes: true });
    expect(created).toEqual(["components/ui/button.tsx"]);
    expect(await fs.readFile(path.join(dir, "components/ui/button.tsx"), "utf8")).toContain("TW");
  });

  it("fails before writing anything when the style is unavailable", async () => {
    const legacy: RegistryItem = {
      name: "Legacy",
      slug: "legacy",
      type: "registry:ui",
      description: "legacy",
      files: [{ path: "src/css/button.tsx", target: "legacy/legacy.tsx" }],
      dependencies: [],
      registryDependencies: [],
    };
    await expect(
      installRegistryItems({
        cwd: dir,
        client: { ...client(), listItems: async () => [legacy], getItem: async () => legacy },
        items: [legacy],
        config: { ...defaultConfig(), style: "tailwind" },
        project: { hasPackageJson: true, hasTypeScript: true, hasSrcDir: false, framework: "next" },
        conflict: { overwrite: false, yes: true },
      }),
    ).rejects.toThrow(/not available for style "tailwind"/);

    await expect(fs.access(path.join(dir, "components"))).rejects.toThrow();
  });
});
