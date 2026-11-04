import { describe, expect, it } from "vitest";
import type { RegistryClient } from "./client.js";
import type { RegistryItem } from "./schema.js";
import { dedupeBySlug, resolveRegistryItems } from "./resolver.js";

const mockItems: RegistryItem[] = [
  {
    name: "Utils",
    slug: "utils",
    type: "registry:lib",
    description: "utils",
    files: [{ path: "a", target: "a" }],
    dependencies: [],
    registryDependencies: [],
  },
  {
    name: "Button",
    slug: "button",
    type: "registry:ui",
    description: "button",
    files: [{ path: "b", target: "b" }],
    dependencies: [],
    registryDependencies: ["utils"],
  },
];

const mockClient: RegistryClient = {
  listItems: async () => mockItems,
  getItem: async (slug) => mockItems.find((i) => i.slug === slug),
  getSourceRoot: async () => undefined,
};

describe("dedupeBySlug", () => {
  it("removes duplicate slugs keeping first occurrence", () => {
    const dup = [mockItems[0], mockItems[1], mockItems[0]];
    expect(dedupeBySlug(dup).map((i) => i.slug)).toEqual(["utils", "button"]);
  });
});

describe("resolveRegistryItems", () => {
  it("includes dependencies before dependents", async () => {
    const resolved = await resolveRegistryItems(mockClient, ["button"]);
    expect(resolved.map((i) => i.slug)).toEqual(["utils", "button"]);
  });

  it("dedupes when same slug requested twice", async () => {
    const resolved = await resolveRegistryItems(mockClient, ["button", "button"]);
    expect(resolved.map((i) => i.slug)).toEqual(["utils", "button"]);
  });
});
