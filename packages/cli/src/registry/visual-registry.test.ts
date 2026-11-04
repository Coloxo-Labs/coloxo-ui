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

/** Documented `npx coloxo add <slug>` targets for the shader and canvas visuals. */
const VISUAL_SLUGS = [
  "aurora-mesh-gradient",
  "bioluminescent-particles",
  "chromatic-aberration-text",
  "dimensional-portal",
  "dimensional-rift-scanner",
  "energy-vortex",
  "force-field-membrane",
  "generative-ribbon-field",
  "gravitational-lens",
  "gyroscopic-core",
  "holographic-liquid-orb",
  "interactive-field-distortion",
  "interactive-ripple-field",
  "kinetic-grid-warp",
  "liquid-metal-morph",
  "living-wireframe-terrain",
  "magnetic-field-visualizer",
  "parametric-sculpture",
  "particle-disintegration",
  "particle-shape-transition",
  "particle-typography",
  "refraction-lens",
  "refractive-glass-cube",
  "self-drawing-geometry",
  "soft-body-physics",
  "spatial-glass-layers",
  "spatial-glitch-distortion",
  "spatial-object-gallery",
  "spring-motion-trails",
  "volumetric-light-tunnel",
] as const;

const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s+)?["']([^"']+)["']/g;

function resolveAlias(spec: string, hasSrcDir: boolean): string | undefined {
  if (spec.startsWith("@/")) {
    const rel = spec.slice(2);
    return hasSrcDir ? path.join("src", rel) : rel;
  }
  return undefined;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveModule(
  fromFile: string,
  spec: string,
  cwd: string,
): Promise<string | undefined> {
  const aliased = resolveAlias(spec, true);
  const base = aliased
    ? path.join(cwd, aliased)
    : spec.startsWith(".")
      ? path.resolve(path.dirname(fromFile), spec)
      : undefined;
  if (!base) return "external";

  const ext = path.extname(base);
  const candidates = ext
    ? [base]
    : [
        `${base}.ts`,
        `${base}.tsx`,
        `${base}.js`,
        `${base}.css`,
        path.join(base, "index.ts"),
        path.join(base, "index.tsx"),
      ];
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return undefined;
}

describe("shader visual registry", () => {
  it("registers all 30 documented visuals with installable shared runtimes", async () => {
    const client = new LocalRegistryClient(REGISTRY_ROOT, REPO_ROOT);
    const items = await client.listItems();
    const bySlug = new Map(items.map((item) => [item.slug, item]));

    expect(bySlug.has("visual-runtime")).toBe(true);
    expect(bySlug.has("visual-shared")).toBe(true);
    expect(VISUAL_SLUGS).toHaveLength(30);

    for (const slug of VISUAL_SLUGS) {
      const item = bySlug.get(slug);
      expect(item, slug).toBeDefined();
      expect(item?.registryDependencies).toEqual(
        expect.arrayContaining(["visual-runtime", "visual-shared"]),
      );
      expect(item?.files?.some((file) => file.target === `${slug}/${slug}.tsx`)).toBe(true);
    }

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "coloxo-visuals-"));
    try {
      await fs.mkdir(path.join(dir, "src"));
      const resolved = await resolveRegistryItems(client, [...VISUAL_SLUGS], "coloxo-css");
      const resolvedSlugs = new Set(resolved.map((item) => item.slug));
      for (const slug of VISUAL_SLUGS) expect(resolvedSlugs.has(slug)).toBe(true);
      expect(resolvedSlugs.has("visual-runtime")).toBe(true);
      expect(resolvedSlugs.has("visual-shared")).toBe(true);
      expect(resolvedSlugs.has("utils")).toBe(true);

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

      const installed: string[] = [];
      async function walk(current: string) {
        for (const entry of await fs.readdir(current, { withFileTypes: true })) {
          const abs = path.join(current, entry.name);
          if (entry.isDirectory()) await walk(abs);
          else if (/\.(tsx?|css)$/.test(entry.name)) installed.push(abs);
        }
      }
      await walk(path.join(dir, "src"));

      const missing: string[] = [];
      for (const file of installed) {
        if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
        const text = await fs.readFile(file, "utf8");
        expect(text).not.toMatch(/_internal\/visuals\//);
        expect(text).not.toMatch(/Visuals\/_shared\//);
        for (const match of text.matchAll(IMPORT_RE)) {
          const spec = match[1];
          if (!spec) continue;
          const found = await resolveModule(file, spec, dir);
          if (!found) missing.push(`${path.relative(dir, file)} -> ${spec}`);
        }
      }

      expect(missing).toEqual([]);
      await expect(
        fs.access(
          path.join(dir, "src/components/ui/aurora-mesh-gradient/aurora-mesh-gradient.tsx"),
        ),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(dir, "src/components/ui/holographic-liquid-orb/orbEngine.ts")),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(dir, "src/components/ui/visual-shared/GlslVisual.tsx")),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(dir, "src/components/ui/visual-runtime/VisualSurface.tsx")),
      ).resolves.toBeUndefined();
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }, 20_000);
});
