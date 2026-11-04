import { describe, expect, it, vi, afterEach } from "vitest";
import { RemoteRegistryClient } from "./remote.js";
import { inferContentBaseFromRegistryUrl } from "./defaults.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("inferContentBaseFromRegistryUrl", () => {
  it("strips registry/registry.json to the repo root raw base", () => {
    expect(
      inferContentBaseFromRegistryUrl(
        "https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/registry/registry.json",
      ),
    ).toBe("https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/");
  });
});

describe("RemoteRegistryClient", () => {
  it("lists items from a remote registry.json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).endsWith("registry.json")) {
          return {
            ok: true,
            json: async () => ({
              $schema: "./schema.json",
              name: "coloxo",
              version: "1",
              items: [
                {
                  name: "Utils",
                  slug: "utils",
                  type: "registry:lib",
                  description: "utils",
                  status: "stable",
                  version: "1.0.0",
                  styles: {
                    tailwind: {
                      files: [{ path: "registry/styles/utils.ts", target: "utils/utils.ts" }],
                    },
                  },
                },
              ],
            }),
          };
        }
        return { ok: false, status: 404, statusText: "Not Found" };
      }),
    );

    const client = new RemoteRegistryClient(
      "https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/registry/registry.json",
    );
    const items = await client.listItems();
    expect(items).toHaveLength(1);
    expect(items[0]?.slug).toBe("utils");
    expect(await client.getSourceRoot()).toBeUndefined();
  });

  it("fetches source files from the content base", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("registry/styles/button.tsx")) {
          return { ok: true, text: async () => "export function Button() {}" };
        }
        return { ok: false, status: 404, statusText: "Not Found" };
      }),
    );

    const client = new RemoteRegistryClient(
      "https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/registry/registry.json",
    );
    const source = await client.readSource("registry/styles/button.tsx");
    expect(source).toBe("export function Button() {}");
  });

  it("rejects path traversal", async () => {
    const client = new RemoteRegistryClient(
      "https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/registry/registry.json",
    );
    await expect(client.readSource("../secret")).rejects.toThrow(/traversal/i);
  });
});
