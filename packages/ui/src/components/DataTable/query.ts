import type { DataTableColumn, DataTableQuery, DataTableResetPageOn } from "./types";
import { applyFilters, applyPagination, applySearch, applySort } from "./filters";
import { getByDataIndex } from "./mapColumns";

export const DEFAULT_QUERY: DataTableQuery = {
  page: 1,
  pageSize: 10,
};

export const DEFAULT_RESET_PAGE_ON: Required<DataTableResetPageOn> = {
  search: true,
  filter: true,
  pageSize: true,
  sort: true,
};

export function mergeQuery(base: DataTableQuery, patch: Partial<DataTableQuery>): DataTableQuery {
  return {
    ...base,
    ...patch,
    filters: patch.filters !== undefined ? patch.filters : base.filters,
    sort: patch.sort !== undefined ? patch.sort : base.sort,
  };
}

function shouldResetPage(
  prev: DataTableQuery,
  patch: Partial<DataTableQuery>,
  resetOn: DataTableResetPageOn,
): boolean {
  const cfg = { ...DEFAULT_RESET_PAGE_ON, ...resetOn };
  if (cfg.search && patch.search !== undefined && patch.search !== prev.search) return true;
  if (
    cfg.filter &&
    patch.filters !== undefined &&
    JSON.stringify(patch.filters) !== JSON.stringify(prev.filters)
  ) {
    return true;
  }
  if (cfg.pageSize && patch.pageSize !== undefined && patch.pageSize !== prev.pageSize) return true;
  if (
    cfg.sort &&
    patch.sort !== undefined &&
    JSON.stringify(patch.sort) !== JSON.stringify(prev.sort)
  ) {
    return true;
  }
  return false;
}

export function withPageReset(
  prev: DataTableQuery,
  patch: Partial<DataTableQuery>,
  resetOn?: DataTableResetPageOn,
): DataTableQuery {
  const next = mergeQuery(prev, patch);
  if (shouldResetPage(prev, patch, resetOn ?? {})) {
    next.page = 1;
  }
  return next;
}

function dataIndexMatches(dataIndex: DataTableColumn<unknown>["dataIndex"], field: string): boolean {
  if (dataIndex == null) return false;
  if (Array.isArray(dataIndex)) return dataIndex.join(".") === field;
  return String(dataIndex) === field;
}

function getCellValue<T>(row: T, field: string, columns: DataTableColumn<T>[]): unknown {
  const column = columns.find(
    (col) => col.key === field || dataIndexMatches(col.dataIndex, field),
  );
  if (column?.dataIndex) {
    return getByDataIndex(row, column.dataIndex as string | string[]);
  }
  if (column) {
    return (row as Record<string, unknown>)[column.key];
  }
  return (row as Record<string, unknown>)[field];
}

function resolveColumnCompare<T>(
  columns: DataTableColumn<T>[],
  field: string,
): ((a: T, b: T) => number) | undefined {
  const column = columns.find(
    (col) => col.key === field || dataIndexMatches(col.dataIndex, field),
  );
  if (!column || typeof column.sortable !== "object") return undefined;
  return column.sortable.compare;
}

function buildSearchText<T>(
  row: T,
  columns: DataTableColumn<T>[],
  searchFields?: string[],
): string {
  const getValue = (field: string) => getCellValue(row, field, columns);

  if (searchFields?.length) {
    return searchFields
      .map((field) => {
        const value = getValue(field);
        return value == null ? "" : String(value);
      })
      .join(" ");
  }

  const fromColumns = columns
    .filter((col) => !col.hidden)
    .map((col) => {
      const value = getCellValue(row, col.key, columns);
      return value == null ? "" : String(value);
    });

  // Include remaining primitive row fields so custom keys / ids still match
  const fromRow = Object.values(row as Record<string, unknown>)
    .filter((value) => value != null && (typeof value === "string" || typeof value === "number"))
    .map(String);

  return [...fromColumns, ...fromRow].join(" ");
}

export function applyClientPipeline<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  query: DataTableQuery,
  options?: {
    getRowId?: (record: T, index: number) => string;
    searchFields?: string[];
  },
): { rows: T[]; total: number } {
  const getValue = (row: T, field: string) => getCellValue(row, field, columns);

  let rows = applySearch(data, query.search, (row) =>
    buildSearchText(row, columns, options?.searchFields),
  );
  rows = applyFilters(rows, query.filters, getValue);
  rows = applySort(rows, query.sort, getValue, (field) => resolveColumnCompare(columns, field));
  const total = rows.length;
  rows = applyPagination(rows, query.page, query.pageSize);
  return { rows, total };
}
