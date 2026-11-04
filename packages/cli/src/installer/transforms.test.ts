import { describe, expect, it } from "vitest";
import { defaultConfig } from "../project/config.js";
import { transformFileContent } from "./transforms.js";

describe("transformFileContent", () => {
  it("rewrites utils cx import to aliases.utils barrel", () => {
    const config = defaultConfig();
    const src = `import { cx } from "../../utils/cx";`;
    const out = transformFileContent(src, "packages/ui/src/components/Button/Button.tsx", {
      config,
      items: [],
    });
    expect(out).toBe(`import { cx } from "@/lib/utils";`);
  });

  it("rewrites useId import to utils barrel", () => {
    const config = defaultConfig();
    const src = `import { useId } from "../../utils/useId";`;
    const out = transformFileContent(src, "Input.tsx", { config, items: [] });
    expect(out).toContain(`from "@/lib/utils"`);
  });

  it("rewrites theme style imports", () => {
    const config = defaultConfig();
    const src = `import "../styles/tokens.css";\nimport "../styles/primitives.css";`;
    const out = transformFileContent(src, "ThemeProvider.tsx", { config, items: [] });
    expect(out).toContain(`"@/styles/coloxo-tokens.css"`);
    expect(out).toContain(`"@/styles/coloxo-primitives.css"`);
  });

  it("rewrites same-folder basenames when targets are kebab-cased", () => {
    const config = defaultConfig();
    const src = `import styles from "./Button.module.css";\nexport { Button } from "./Button";`;
    const out = transformFileContent(src, "packages/ui/src/components/Button/index.ts", {
      config,
      items: [],
      siblingRenames: {
        "Button.module.css": "button.module.css",
        "Button.tsx": "button.tsx",
      },
    });
    expect(out).toContain(`"./button.module.css"`);
    expect(out).toContain(`"./button"`);
  });

  it("rewrites internal icons imports to installed icons package", () => {
    const config = defaultConfig();
    const src = `import { CheckIcon, XIcon } from "../../icons";\nimport { createIcon } from "../../icons/createIcon";`;
    const out = transformFileContent(src, "packages/ui/src/components/Select/Select.tsx", {
      config,
      items: [],
    });
    expect(out).toContain(`from "@/components/ui/icons"`);
    expect(out).toContain(`from "@/components/ui/icons/create-icon"`);
  });
});
