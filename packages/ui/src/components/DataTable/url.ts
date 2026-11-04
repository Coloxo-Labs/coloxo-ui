import type { DataTableFilterValue, DataTableQuery, DataTableSort } from "./types";
import { normalizeSort } from "./filters";
import { DEFAULT_QUERY } from "./query";

const PAGE_KEY = "page";
const PAGE_SIZE_KEY = "pageSize";
const SEARCH_KEY = "search";
const SORT_KEY = "sort";
const FILTERS_KEY = "filters";

function toURLSearchParams(
  params: URLSearchParams | Record<string, string> | string,
): URLSearchParams {
  if (typeof params === "string") {
    const trimmed = params.startsWith("?") ? params.slice(1) : params;
    return new URLSearchParams(trimmed);
  }
  if (params instanceof URLSearchParams) return params;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value);
  }
  return search;
}

function parseSort(raw: string | null): DataTableSort[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as DataTableSort | DataTableSort[];
    return normalizeSort(parsed);
  } catch {
    const [field, order] = raw.split(":");
    if (!field) return undefined;
    return [{ field, order: order === "desc" ? "desc" : "asc" }];
  }
}

function parseFilters(raw: string | null): DataTableFilterValue[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as
      DataTableFilterValue[] | Record<string, Omit<DataTableFilterValue, "field">>;
    if (Array.isArray(parsed)) {
      return parsed.length > 0 ? parsed : undefined;
    }
    if (parsed && typeof parsed === "object") {
      const legacy = Object.entries(parsed).map(([field, value]) => ({
        field,
        ...value,
      }));
      return legacy.length > 0 ? legacy : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function parseDataTableQuery(
  params: URLSearchParams | Record<string, string> | string,
): DataTableQuery {
  const searchParams = toURLSearchParams(params);
  const page = Number(searchParams.get(PAGE_KEY) ?? DEFAULT_QUERY.page);
  const pageSize = Number(searchParams.get(PAGE_SIZE_KEY) ?? DEFAULT_QUERY.pageSize);
  const search = searchParams.get(SEARCH_KEY) ?? undefined;
  const sort = parseSort(searchParams.get(SORT_KEY));
  const filters = parseFilters(searchParams.get(FILTERS_KEY));

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_QUERY.page,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : DEFAULT_QUERY.pageSize,
    search: search || undefined,
    sort,
    filters,
  };
}

export function serializeDataTableQuery(query: DataTableQuery): Record<string, string> {
  const out: Record<string, string> = {
    [PAGE_KEY]: String(query.page),
    [PAGE_SIZE_KEY]: String(query.pageSize),
  };

  if (query.search) {
    out[SEARCH_KEY] = query.search;
  }

  if (query.sort?.length) {
    out[SORT_KEY] = JSON.stringify(query.sort);
  }

  if (query.filters?.length) {
    out[FILTERS_KEY] = JSON.stringify(query.filters);
  }

  return out;
}

export function serializeDataTableQueryToURLSearchParams(query: DataTableQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(serializeDataTableQuery(query))) {
    params.set(key, value);
  }
  return params;
}
