/**
 * Writes registry manifests for the 30 shader/canvas visuals and their
 * shared runtime. Run from coloxo-ui: node scripts/gen-visual-registry.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const VISUALS = path.join(ROOT, "packages/ui/src/components/Visuals");
const RUNTIME = path.join(ROOT, "packages/ui/src/components/_internal/visuals");
const DOCS = path.resolve(ROOT, "../ui-playground/content/visuals.ts");

async function walk(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await walk(path.join(dir, entry.name), rel)));
    else files.push(rel.replace(/\\/g, "/"));
  }
  return files.sort();
}

function manifest(item) {
  return JSON.stringify(item, null, 2) + "\n";
}

const docsSrc = await readFile(DOCS, "utf8");
const docs = [];
const re =
  /slug: "([^"]+)",\s*component: "([^"]+)",\s*name: "([^"]+)",\s*kind: "[^"]+",\s*description: "([^"]+)"/g;
for (const match of docsSrc.matchAll(re)) {
  docs.push({
    slug: match[1],
    component: match[2],
    name: match[3],
    description: match[4],
  });
}

if (docs.length !== 30) {
  throw new Error(`Expected 30 visual docs, found ${docs.length}`);
}

const runtimeFiles = (await readdir(RUNTIME))
  .filter((name) => !name.startsWith("."))
  .sort()
  .map((name) => ({
    path: `packages/ui/src/components/_internal/visuals/${name}`,
    target: `visual-runtime/${name}`,
  }));

await writeFile(
  path.join(ROOT, "registry/base/visual-runtime.json"),
  manifest({
    name: "Visual Runtime",
    slug: "visual-runtime",
    type: "registry:lib",
    description:
      "Shared canvas and WebGL surface used by Coloxo visual effects: engine loop, GLSL helpers, and the DOM shell.",
    status: "stable",
    version: "1.0.0",
    files: runtimeFiles,
    dependencies: [],
    registryDependencies: ["utils"],
  }),
);

const sharedFiles = (await walk(path.join(VISUALS, "_shared"))).map((rel) => ({
  path: `packages/ui/src/components/Visuals/_shared/${rel}`,
  target: `visual-shared/${rel}`,
}));

await writeFile(
  path.join(ROOT, "registry/base/visual-shared.json"),
  manifest({
    name: "Visual Shared",
    slug: "visual-shared",
    type: "registry:lib",
    description:
      "Shared shader sources, canvas engines, and helpers used by Coloxo visual effects.",
    status: "stable",
    version: "1.0.0",
    files: sharedFiles,
    dependencies: [],
    registryDependencies: ["visual-runtime"],
  }),
);

for (const doc of docs) {
  const dir = path.join(VISUALS, doc.component);
  const names = (await readdir(dir)).sort();
  const files = names.map((name) => {
    const base =
      name === `${doc.component}.tsx`
        ? `${doc.slug}.tsx`
        : name === `${doc.component}.module.css`
          ? `${doc.slug}.module.css`
          : name;
    return {
      path: `packages/ui/src/components/Visuals/${doc.component}/${name}`,
      target: `${doc.slug}/${base}`,
    };
  });

  await writeFile(
    path.join(ROOT, "registry/components", `${doc.slug}.json`),
    manifest({
      name: doc.name,
      slug: doc.slug,
      type: "registry:ui",
      category: "General",
      description: doc.description,
      status: "stable",
      version: "1.0.0",
      files,
      dependencies: [],
      registryDependencies: ["visual-runtime", "visual-shared"],
      accessibility: {
        aria: true,
        notes:
          "Canvas is aria-hidden so the effect stays out of the reading order. Children remain in the DOM. Respects prefers-reduced-motion when enabled.",
      },
      docs: {
        usage: `<${doc.component} />`,
      },
    }),
  );
}

console.log(`Wrote visual-runtime, visual-shared, and ${docs.length} visual manifests`);
