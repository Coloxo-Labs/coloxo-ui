import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installRegistryItems } from "../installer/files.js";
import { defaultConfig } from "../project/config.js";
import { LocalRegistryClient } from "./local.js";
import { resolveRegistryItems } from "./resolver.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const REGISTRY_ROOT = path.join(REPO_ROOT, "registry");

const DOCUMENTED_SLUGS = [
  "accordion",
  "combobox",
  "input-group",
  "avatar-label-group",
  "avatar-profile-photo",
] as const;

describe("documented component slugs", () => {
  it("installs accordion, combobox, input-group, and avatar variants", async () => {
    const client = new LocalRegistryClient(REGISTRY_ROOT, REPO_ROOT);
    const items = await client.listItems();
    const bySlug = new Map(items.map((item) => [item.slug, item]));
    for (const slug of DOCUMENTED_SLUGS) {
      expect(bySlug.has(slug), slug).toBe(true);
    }

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "coloxo-documented-"));
    try {
      await fs.mkdir(path.join(dir, "src"));
      const resolved = await resolveRegistryItems(client, [...DOCUMENTED_SLUGS], "coloxo-css");
      const resolvedSlugs = new Set(resolved.map((item) => item.slug));
      for (const slug of DOCUMENTED_SLUGS) expect(resolvedSlugs.has(slug)).toBe(true);

      await installRegistryItems({
        cwd: dir,
        client,
        items: resolved,
        config: { ...defaultConfig(), style: "coloxo-css" },
        project: {
          hasPackageJson: true,
          hasTypeScript: true,
          hasSrcDir: true,
          framework: "next",
        },
        conflict: { overwrite: true, yes: true },
      });

      const ui = path.join(dir, "src/components/ui");
      const accordion = await fs.readFile(path.join(ui, "accordion/accordion.tsx"), "utf8");
      const combobox = await fs.readFile(path.join(ui, "combobox/combobox.tsx"), "utf8");
      const inputGroup = await fs.readFile(path.join(ui, "input/input-group.tsx"), "utf8");
      const labelGroup = await fs.readFile(path.join(ui, "avatar/avatar-label-group.tsx"), "utf8");
      const profile = await fs.readFile(path.join(ui, "avatar/avatar-profile-photo.tsx"), "utf8");

      expect(accordion).not.toContain("lucide-react");
      expect(accordion).toContain('from "@/components/ui/icons"');
      expect(accordion).toContain('from "./accordion.module.css"');
      expect(combobox).toContain('from "@/components/ui/form-control/control.module.css"');
      expect(combobox).toContain('from "./combobox.module.css"');
      expect(inputGroup).toContain('from "./input"');
      expect(inputGroup).toContain('from "./input-group.module.css"');
      expect(labelGroup).toContain('from "./avatar"');
      expect(labelGroup).toContain('from "./avatar-label-group.module.css"');
      expect(profile).toContain('from "./avatar"');
      expect(profile).toContain('from "./avatar-profile-photo.module.css"');
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }, 20_000);

  it("installs the same slugs as flat Tailwind components", async () => {
    const client = new LocalRegistryClient(REGISTRY_ROOT, REPO_ROOT);
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "coloxo-documented-tw-"));
    try {
      await fs.mkdir(path.join(dir, "src"));
      const resolved = await resolveRegistryItems(client, [...DOCUMENTED_SLUGS], "tailwind");
      await installRegistryItems({
        cwd: dir,
        client,
        items: resolved,
        config: { ...defaultConfig(), style: "tailwind" },
        project: {
          hasPackageJson: true,
          hasTypeScript: true,
          hasSrcDir: true,
          framework: "next",
        },
        conflict: { overwrite: true, yes: true },
      });

      const ui = path.join(dir, "src/components/ui");
      const files = [
        "accordion.tsx",
        "combobox.tsx",
        "input-group.tsx",
        "avatar-label-group.tsx",
        "avatar-profile-photo.tsx",
      ];
      for (const file of files) {
        const text = await fs.readFile(path.join(ui, file), "utf8");
        expect(text, file).not.toMatch(/\.module\.css/);
      }
      expect(await fs.readFile(path.join(ui, "input-group.tsx"), "utf8")).toContain(
        'from "./input"',
      );
      expect(await fs.readFile(path.join(ui, "avatar-label-group.tsx"), "utf8")).toContain(
        'from "./avatar"',
      );
      expect(await fs.readFile(path.join(ui, "avatar-profile-photo.tsx"), "utf8")).toContain(
        'from "./avatar"',
      );
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }, 20_000);

  it("installs button-variants and picker-field in both styles", async () => {
    const client = new LocalRegistryClient(REGISTRY_ROOT, REPO_ROOT);
    const slugs = ["button-variants", "picker-field"] as const;

    for (const style of ["coloxo-css", "tailwind"] as const) {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), `coloxo-shared-${style}-`));
      try {
        await fs.mkdir(path.join(dir, "src"));
        const resolved = await resolveRegistryItems(client, [...slugs], style);
        const resolvedSlugs = new Set(resolved.map((item) => item.slug));
        for (const slug of slugs) expect(resolvedSlugs.has(slug)).toBe(true);

        await installRegistryItems({
          cwd: dir,
          client,
          items: resolved,
          config: { ...defaultConfig(), style },
          project: {
            hasPackageJson: true,
            hasTypeScript: true,
            hasSrcDir: true,
            framework: "next",
          },
          conflict: { overwrite: true, yes: true },
        });

        const ui = path.join(dir, "src/components/ui");
        if (style === "coloxo-css") {
          const variants = await fs.readFile(
            path.join(ui, "button-variants/button-variants.module.css"),
            "utf8",
          );
          const picker = await fs.readFile(path.join(ui, "picker-field/picker-field.tsx"), "utf8");
          expect(variants).toContain(".primary");
          expect(picker).toContain("PickerFieldShell");
        } else {
          const variants = await fs.readFile(path.join(ui, "button-variants.ts"), "utf8");
          const picker = await fs.readFile(path.join(ui, "picker-field.tsx"), "utf8");
          expect(variants).not.toMatch(/from ["'][^"']*\.module\.css["']/);
          expect(variants).toContain("buttonVariants");
          expect(picker).not.toMatch(/from ["'][^"']*\.module\.css["']/);
          expect(picker).toContain('from "./form-field"');
          expect(picker).toContain('from "@/lib/utils"');
          expect(resolvedSlugs.has("utils")).toBe(true);
          expect(resolvedSlugs.has("form-field")).toBe(true);
        }
      } finally {
        await fs.rm(dir, { recursive: true, force: true });
      }
    }
  }, 20_000);
});
