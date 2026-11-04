import type { RegistryItem } from "./schema.js";

export interface RegistryClient {
  /** Load all registry items. */
  listItems(): Promise<RegistryItem[]>;
  /** Fetch a single item by slug. */
  getItem(slug: string): Promise<RegistryItem | undefined>;
  /**
   * Absolute path to the repo root when using a local registry (for resolving source paths).
   * Remote clients return undefined and implement `readSource` instead.
   */
  getSourceRoot(): Promise<string | undefined>;
  /**
   * Read a registry file path (repo-root-relative, e.g. packages/ui/src/...).
   * Local clients read from disk; remote clients fetch over HTTP.
   */
  readSource(filePath: string): Promise<string | Buffer>;
}
