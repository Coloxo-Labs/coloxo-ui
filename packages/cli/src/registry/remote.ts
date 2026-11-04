import type { RegistryClient } from "./client.js";
import { RegistrySchema, type RegistryItem } from "./schema.js";
import { DEFAULT_CONTENT_BASE_URL, inferContentBaseFromRegistryUrl } from "./defaults.js";

export class RemoteRegistryClient implements RegistryClient {
  private items: RegistryItem[] | undefined;
  private readonly contentBase: string;

  constructor(
    private readonly url: string,
    contentBaseUrl?: string,
  ) {
    const inferred = inferContentBaseFromRegistryUrl(url);
    const base = contentBaseUrl ?? inferred ?? DEFAULT_CONTENT_BASE_URL;
    this.contentBase = base.endsWith("/") ? base : `${base}/`;
  }

  async getSourceRoot(): Promise<string | undefined> {
    return undefined;
  }

  async readSource(filePath: string): Promise<string | Buffer> {
    const normalized = filePath.replace(/\\/g, "/").replace(/^\/+/, "");
    if (normalized.includes("..")) {
      throw new Error(`Refusing path traversal in registry source: ${filePath}`);
    }
    const url = new URL(normalized, this.contentBase).toString();
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch source ${normalized} from ${url}: ${res.status} ${res.statusText}`,
      );
    }
    const isBinary =
      normalized.endsWith(".png") || normalized.endsWith(".jpg") || normalized.endsWith(".webp");
    if (isBinary) {
      return Buffer.from(await res.arrayBuffer());
    }
    return res.text();
  }

  async listItems(): Promise<RegistryItem[]> {
    if (this.items) return this.items;
    const res = await fetch(this.url);
    if (!res.ok) {
      throw new Error(`Failed to fetch registry from ${this.url}: ${res.status} ${res.statusText}`);
    }
    const json: unknown = await res.json();
    const parsed = RegistrySchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Invalid registry JSON from ${this.url}: ${parsed.error.message}`);
    }
    this.items = parsed.data.items;
    return this.items;
  }

  async getItem(slug: string): Promise<RegistryItem | undefined> {
    const items = await this.listItems();
    return items.find((i) => i.slug === slug);
  }
}
