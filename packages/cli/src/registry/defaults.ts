/**
 * Default public registry endpoints.
 * Override with --registry, COLOXO_REGISTRY_DIR/PATH, or coloxo.json.
 */
export const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/registry/registry.json";

/** Base URL for repo-root-relative source paths (packages/ui/..., registry/styles/...). */
export const DEFAULT_CONTENT_BASE_URL =
  "https://raw.githubusercontent.com/Coloxo-Labs/coloxo-ui/main/";

/**
 * Derive a content base from a registry.json raw URL when possible.
 * e.g. .../main/registry/registry.json → .../main/
 */
export function inferContentBaseFromRegistryUrl(registryUrl: string): string | undefined {
  try {
    const u = new URL(registryUrl);
    const marker = "/registry/registry.json";
    const idx = u.pathname.lastIndexOf(marker);
    if (idx === -1) return undefined;
    u.pathname = u.pathname.slice(0, idx + 1);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return undefined;
  }
}
