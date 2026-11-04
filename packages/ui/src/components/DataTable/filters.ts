import type { DataTableFilterOperator, DataTableFilterValue, DataTableSort } from "./types";

function normalizeFilter(
  filter: DataTableFilterValue | undefined,
): DataTableFilterValue | undefined {
  if (!filter) return undefined;
  if (filter.operator === "isNull" || filter.operator === "isNotNull") return filter;
  if (filter.value === undefined || filter.value === null || filter.value === "") return undefined;
  if (Array.isArray(filter.value) && filter.value.length === 0) return undefined;
  return filter;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function matchOperator(cell: unknown, filter: DataTableFilterValue): boolean {
  const operator: DataTableFilterOperator = filter.operator ?? "eq";
  const raw = filter.value;

  if (operator === "isNull") return cell == null || cell === "";
  if (operator === "isNotNull") return cell != null && cell !== "";

  if (operator === "between" && raw && typeof raw === "object" && "from" in raw && "to" in raw) {
    const range = raw as { from?: unknown; to?: unknown };
    const num = Number(cell);
    const from = range.from != null ? Number(range.from) : undefined;
    const to = range.to != null ? Number(range.to) : undefined;
    if (Number.isNaN(num)) return false;
    if (from != null && !Number.isNaN(from) && num < from) return false;
    if (to != null && !Number.isNaN(to) && num > to) return false;
    return true;
  }

  const cellStr = cell == null ? "" : String(cell).toLowerCase();
  const valueStr = raw == null ? "" : String(raw).toLowerCase();

  switch (operator) {
    case "eq":
      return cellStr === valueStr || cell === raw;
    case "neq":
      return cellStr !== valueStr && cell !== raw;
    case "contains":
      return cellStr.includes(valueStr);
    case "startsWith":
      return cellStr.startsWith(valueStr);
    case "endsWith":
      return cellStr.endsWith(valueStr);
    case "gt":
      return compareValues(cell, raw) > 0;
    case "gte":
      return compareValues(cell, raw) >= 0;
    case "lt":
      return compareValues(cell, raw) < 0;
    case "lte":
      return compareValues(cell, raw) <= 0;
    case "in": {
      const list = Array.isArray(raw) ? raw : [raw];
      return list.some((item) => String(item) === String(cell));
    }
    case "notIn": {
      const list = Array.isArray(raw) ? raw : [raw];
      return !list.some((item) => String(item) === String(cell));
    }
    default:
      return true;
  }
}

export function getQueryFilter(
  filters: DataTableFilterValue[] | undefined,
  field: string,
): DataTableFilterValue | undefined {
  return filters?.find((item) => item.field === field);
}

export function upsertQueryFilter(
  filters: DataTableFilterValue[] | undefined,
  field: string,
  next: Omit<DataTableFilterValue, "field"> | undefined,
): DataTableFilterValue[] | undefined {
  const rest = (filters ?? []).filter((item) => item.field !== field);
  if (next === undefined) {
    return rest.length > 0 ? rest : undefined;
  }
  return [...rest, { field, ...next }];
}

export function applyFilters<T>(
  rows: T[],
  filters: DataTableFilterValue[] | undefined,
  getValue: (row: T, field: string) => unknown,
): T[] {
  if (!filters?.length) return rows;
  const entries = filters
    .map((filter) => [filter.field, normalizeFilter(filter)] as const)
    .filter(([, value]) => value != null);
  if (entries.length === 0) return rows;

  return rows.filter((row) =>
    entries.every(([field, filter]) => matchOperator(getValue(row, field), filter!)),
  );
}

export function applySearch<T>(
  rows: T[],
  search: string | undefined,
  getSearchText: (row: T) => string,
): T[] {
  const term = search?.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) => getSearchText(row).toLowerCase().includes(term));
}

export function normalizeSort(
  sort: DataTableSort | DataTableSort[] | undefined,
): DataTableSort[] | undefined {
  if (!sort) return undefined;
  const list = Array.isArray(sort) ? sort : [sort];
  return list.length > 0 ? list : undefined;
}

export function applySort<T>(
  rows: T[],
  sort: DataTableSort[] | undefined,
  getValue: (row: T, field: string) => unknown,
  getCompare?: (field: string) => ((a: T, b: T) => number) | undefined,
): T[] {
  const sorts = normalizeSort(sort);
  if (!sorts?.length) return rows;

  const next = [...rows];
  next.sort((a, b) => {
    for (const item of sorts) {
      const custom = getCompare?.(item.field);
      const cmp = custom
        ? custom(a, b)
        : compareValues(getValue(a, item.field), getValue(b, item.field));
      if (cmp !== 0) {
        return item.order === "desc" ? -cmp : cmp;
      }
    }
    return 0;
  });
  return next;
}

export function applyPagination<T>(rows: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
