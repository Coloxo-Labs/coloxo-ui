import { describe, expect, it } from "vitest";
import type { RegistryItem } from "./schema.js";
import { allFiles, styleShapeErrors } from "./manifest-files.js";
import { availableStyles, LEGACY_STYLE, resolveForStyle } from "./style-resolve.js";

const tailwindItem: RegistryItem = {
  name: "Button",
  slug: "button",
  type: "registry:ui",
  description: "button",
  styles: {
    tailwind: {
      files: [{ path: "src/button.tsx", target: "button.tsx" }],
      dependencies: [],
      registryDependencies: [],
    },
    "coloxo-css": {
      files: [
        { path: "src/Button.tsx", target: "button/button.tsx" },
        { path: "src/Button.module.css", target: "button/button.module.css" },
      ],
      dependencies: [],
      registryDependencies: ["utils"],
    },
  },
};

const legacyItem: RegistryItem = {
  name: "Legacy",
  slug: "legacy",
  type: "registry:ui",
  description: "legacy",
  files: [{ path: "src/Legacy.tsx", target: "legacy/legacy.tsx" }],
  dependencies: [],
  registryDependencies: [],
};

describe("resolveForStyle", () => {
  it("returns only the files for the requested style", () => {
    const tw = resolveForStyle(tailwindItem, "tailwind");
    expect(tw.files).toHaveLength(1);
    expect(tw.files[0].target).toBe("button.tsx");

    const css = resolveForStyle(tailwindItem, "coloxo-css");
    expect(css.files).toHaveLength(2);
  });

  it("keeps registryDependencies per style", () => {
    expect(resolveForStyle(tailwindItem, "tailwind").registryDependencies).toEqual([]);
    expect(resolveForStyle(tailwindItem, "coloxo-css").registryDependencies).toEqual(["utils"]);
  });

  it("throws when the style is unavailable instead of installing the wrong shape", () => {
    expect(() => resolveForStyle(
      { ...tailwindItem, styles: { tailwind: tailwindItem.styles!.tailwind } },
      "coloxo-css",
    )).toThrow(/not available for style "coloxo-css"/);
  });

  it("treats a manifest without styles as Coloxo CSS", () => {
    expect(availableStyles(legacyItem)).toEqual([LEGACY_STYLE]);
    expect(resolveForStyle(legacyItem, "coloxo-css").files).toHaveLength(1);
    expect(() => resolveForStyle(legacyItem, "tailwind")).toThrow(/not available/);
  });
});

describe("styleShapeErrors", () => {
  it("accepts a flat tailwind target and a folder coloxo-css target", () => {
    expect(styleShapeErrors(tailwindItem)).toEqual([]);
  });

  it("rejects a CSS Module in tailwind mode", () => {
    const bad: RegistryItem = {
      ...tailwindItem,
      styles: {
        ...tailwindItem.styles,
        tailwind: {
          files: [{ path: "src/button.module.css", target: "button.module.css" }],
          dependencies: [],
          registryDependencies: [],
        },
      },
    };
    expect(styleShapeErrors(bad).join()).toMatch(/must not be a CSS Module/);
  });

  it("rejects a folder-nested tailwind component", () => {
    const bad: RegistryItem = {
      ...tailwindItem,
      styles: {
        ...tailwindItem.styles,
        tailwind: {
          files: [{ path: "src/button.tsx", target: "button/button.tsx" }],
          dependencies: [],
          registryDependencies: [],
        },
      },
    };
    expect(styleShapeErrors(bad).join()).toMatch(/must be flat/);
  });
});

describe("allFiles", () => {
  it("collects files from every style plus the legacy list", () => {
    expect(allFiles(tailwindItem)).toHaveLength(3);
    expect(allFiles(legacyItem)).toHaveLength(1);
  });
});
