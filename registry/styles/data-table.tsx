"use client";
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, Columns3Icon, LayoutGridIcon, SearchIcon, TableIcon } from "@/lib/icons";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { Icon } from "./icon";
import { Pagination } from "./pagination";
import { cx, useControllableState } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  panel: "overflow-hidden rounded-xl border border-solid border-cx-secondary bg-cx-primary",
  search: "min-w-0 flex-1 rounded-md border border-solid border-cx-primary bg-cx-primary px-3 py-2 text-sm text-cx-primary outline-none focus:border-cx-brand",
  table: "w-full border-collapse text-sm",
  td: "border-t border-solid border-cx-secondary px-3 text-cx-secondary align-middle",
  th: "bg-cx-secondary px-3 py-2 text-left text-xs font-medium text-cx-tertiary",
  toolbar: "flex flex-wrap items-center gap-2 border-b border-solid border-cx-secondary p-3",
};

export type DataTableFilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "notIn"
  | "between"
  | "isNull"
  | "isNotNull";

export type DataTableFilterType =
  | "text"
  | "select"
  | "multi-select"
  | "checkbox"
  | "radio"
  | "date"
  | "date-range"
  | "number"
  | "number-range"
  | "boolean"
  | "search-select"
  | "tree-select"
  | "custom";

export type DataTableFilterOption = { label: ReactNode; value: string };

export type DataTableColumnFilter = {
  type: DataTableFilterType;
  label?: string;
  placeholder?: string;
  options?: DataTableFilterOption[];
  defaultOperator?: DataTableFilterOperator;
  applyMode?: "instant" | "manual";
  render?: (ctx: {
    value: Omit<DataTableFilterValue, "field"> | undefined;
    onChange: (value: Omit<DataTableFilterValue, "field"> | undefined) => void;
    onApply: () => void;
    onClear: () => void;
  }) => ReactNode;
};

export type DataTableFilterValue = {
  field: string;
  operator?: DataTableFilterOperator;
  value?: unknown;
};

export type DataTableSort = { field: string; order: "asc" | "desc" };

export type DataTableQuery = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: DataTableSort[];
  filters?: DataTableFilterValue[];
};

export type DataTableColumnSortConfig<T> = {
  multi?: boolean;
  compare?: (a: T, b: T) => number;
};

export type DataTableColumn<T> = {
  key: string;
  title: ReactNode | ((column: DataTableColumn<T>) => ReactNode);
  dataIndex?: (keyof T & string) | string | string[];
  width?: number | string;
  minWidth?: number | string;
  sortable?: boolean | DataTableColumnSortConfig<T>;
  filter?: DataTableColumnFilter;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  hidden?: boolean;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
};

export type DataTableRowDensity = "compact" | "standard" | "comfortable";
export type DataTableMode = "client" | "server";

export type DataTablePaginationConfig = {
  pageSize?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showFirstLast?: boolean;
  metaLabel?: string | ((meta: { start: number; end: number; total: number }) => string);
};

export type DataTableSearchConfig = {
  placeholder?: string;
  debounceMs?: number;
  fields?: string[];
};

export type DataTableResetPageOn = Partial<{
  search: boolean;
  filter: boolean;
  pageSize: boolean;
  sort: boolean;
}>;

export type DataTableRowSelection<T> = {
  selectedRowKeys?: string[];
  defaultSelectedRowKeys?: string[];
  onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
};

export type DataTableColumnVisibility = {
  hiddenColumnKeys?: string[];
  defaultHiddenColumnKeys?: string[];
  onChange?: (hiddenColumnKeys: string[]) => void;
};

export type DataTableExpandable<T> = {
  expandedRowKeys?: string[];
  defaultExpandedRowKeys?: string[];
  onChange?: (expandedRowKeys: string[]) => void;
  renderExpandedRow?: (record: T, index: number) => ReactNode;
  rowExpandable?: (record: T) => boolean;
};

export type DataTableEmptyConfig = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};

export type DataTableErrorConfig = {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
};

export type DataTableViewMode = "list" | "grid";

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  mode?: DataTableMode;
  query?: DataTableQuery;
  defaultQuery?: Partial<DataTableQuery>;
  onQueryChange?: (query: DataTableQuery) => void;
  total?: number;
  loading?: boolean;
  error?: boolean | Error | ReactNode;
  getRowId?: (record: T, index: number) => string;
  search?: boolean | DataTableSearchConfig;
  pagination?: boolean | DataTablePaginationConfig;
  resetPageOn?: DataTableResetPageOn;
  rowSelection?: DataTableRowSelection<T>;
  columnVisibility?: boolean | DataTableColumnVisibility;
  expandable?: DataTableExpandable<T>;
  empty?: DataTableEmptyConfig | ReactNode;
  errorConfig?: DataTableErrorConfig;
  viewMode?: DataTableViewMode;
  defaultViewMode?: DataTableViewMode;
  onViewModeChange?: (viewMode: DataTableViewMode) => void;
  renderGridItem?: (record: T, index: number) => ReactNode;
  stickyHeader?: boolean;
  rowDensity?: DataTableRowDensity;
  rowActions?: (record: T, index: number) => ReactNode;
  className?: string;
  caption?: string;
};

export type DataTablePagination = { page: number; pageSize: number; total: number };

function normalizeFilter(filter: DataTableFilterValue | undefined): DataTableFilterValue | undefined {
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
    case "in":
      return (Array.isArray(raw) ? raw : [raw]).some((item) => String(item) === String(cell));
    case "notIn":
      return !(Array.isArray(raw) ? raw : [raw]).some((item) => String(item) === String(cell));
    default:
      return true;
  }
}

export function getQueryFilter(filters: DataTableFilterValue[] | undefined, field: string) {
  return filters?.find((item) => item.field === field);
}

export function upsertQueryFilter(
  filters: DataTableFilterValue[] | undefined,
  field: string,
  next: Omit<DataTableFilterValue, "field"> | undefined,
): DataTableFilterValue[] | undefined {
  const rest = (filters ?? []).filter((item) => item.field !== field);
  if (next === undefined) return rest.length > 0 ? rest : undefined;
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
    .filter((entry): entry is readonly [string, DataTableFilterValue] => entry[1] != null);
  if (entries.length === 0) return rows;
  return rows.filter((row) => entries.every(([field, filter]) => matchOperator(getValue(row, field), filter)));
}

export function applySearch<T>(rows: T[], search: string | undefined, getSearchText: (row: T) => string): T[] {
  const term = search?.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) => getSearchText(row).toLowerCase().includes(term));
}

export function normalizeSort(sort: DataTableSort | DataTableSort[] | undefined): DataTableSort[] | undefined {
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
  return [...rows].sort((a, b) => {
    for (const item of sorts) {
      const custom = getCompare?.(item.field);
      const cmp = custom ? custom(a, b) : compareValues(getValue(a, item.field), getValue(b, item.field));
      if (cmp !== 0) return item.order === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

export function applyPagination<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (Math.max(1, page) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export const DEFAULT_QUERY: DataTableQuery = { page: 1, pageSize: 10 };

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

function shouldResetPage(prev: DataTableQuery, patch: Partial<DataTableQuery>, resetOn: DataTableResetPageOn): boolean {
  const cfg = { ...DEFAULT_RESET_PAGE_ON, ...resetOn };
  if (cfg.search && patch.search !== undefined && patch.search !== prev.search) return true;
  if (cfg.filter && patch.filters !== undefined && JSON.stringify(patch.filters) !== JSON.stringify(prev.filters)) return true;
  if (cfg.pageSize && patch.pageSize !== undefined && patch.pageSize !== prev.pageSize) return true;
  if (cfg.sort && patch.sort !== undefined && JSON.stringify(patch.sort) !== JSON.stringify(prev.sort)) return true;
  return false;
}

export function withPageReset(prev: DataTableQuery, patch: Partial<DataTableQuery>, resetOn?: DataTableResetPageOn): DataTableQuery {
  const next = mergeQuery(prev, patch);
  if (shouldResetPage(prev, patch, resetOn ?? {})) next.page = 1;
  return next;
}

function getByDataIndex(row: unknown, dataIndex: string | string[]): unknown {
  const parts = Array.isArray(dataIndex) ? dataIndex : dataIndex.split(".");
  let cur: unknown = row;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function dataIndexMatches(dataIndex: DataTableColumn<unknown>["dataIndex"], field: string): boolean {
  if (dataIndex == null) return false;
  if (Array.isArray(dataIndex)) return dataIndex.join(".") === field;
  return String(dataIndex) === field;
}

function getCellValue<T>(row: T, field: string, columns: DataTableColumn<T>[]): unknown {
  const column = columns.find((col) => col.key === field || dataIndexMatches(col.dataIndex, field));
  if (column?.dataIndex) return getByDataIndex(row, column.dataIndex as string | string[]);
  if (column) return (row as Record<string, unknown>)[column.key];
  return (row as Record<string, unknown>)[field];
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
  const searchText = (row: T) => {
    const fields = options?.searchFields;
    if (fields?.length) return fields.map((field) => String(getValue(row, field) ?? "")).join(" ");
    return columns
      .filter((col) => !col.hidden)
      .map((col) => String(getCellValue(row, col.key, columns) ?? ""))
      .concat(
        Object.values(row as Record<string, unknown>)
          .filter((value) => typeof value === "string" || typeof value === "number")
          .map(String),
      )
      .join(" ");
  };
  let rows = applySearch(data, query.search, searchText);
  rows = applyFilters(rows, query.filters, getValue);
  rows = applySort(rows, query.sort, getValue, (field) => {
    const column = columns.find((col) => col.key === field || dataIndexMatches(col.dataIndex, field));
    return column && typeof column.sortable === "object" ? column.sortable.compare : undefined;
  });
  const total = rows.length;
  return { rows: applyPagination(rows, query.page, query.pageSize), total };
}

function parseSort(raw: string | null): DataTableSort[] | undefined {
  if (!raw) return undefined;
  try {
    return normalizeSort(JSON.parse(raw) as DataTableSort | DataTableSort[]);
  } catch {
    const [field, order] = raw.split(":");
    if (!field) return undefined;
    return [{ field, order: order === "desc" ? "desc" : "asc" }];
  }
}

function parseFilters(raw: string | null): DataTableFilterValue[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as DataTableFilterValue[] | Record<string, Omit<DataTableFilterValue, "field">>;
    if (Array.isArray(parsed)) return parsed.length > 0 ? parsed : undefined;
    if (parsed && typeof parsed === "object") {
      const legacy = Object.entries(parsed).map(([field, value]) => ({ field, ...value }));
      return legacy.length > 0 ? legacy : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function parseDataTableQuery(params: URLSearchParams | Record<string, string> | string): DataTableQuery {
  const searchParams =
    typeof params === "string"
      ? new URLSearchParams(params.startsWith("?") ? params.slice(1) : params)
      : params instanceof URLSearchParams
        ? params
        : new URLSearchParams(params);
  const page = Number(searchParams.get("page") ?? DEFAULT_QUERY.page);
  const pageSize = Number(searchParams.get("pageSize") ?? DEFAULT_QUERY.pageSize);
  const search = searchParams.get("search") ?? undefined;
  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_QUERY.page,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : DEFAULT_QUERY.pageSize,
    search: search || undefined,
    sort: parseSort(searchParams.get("sort")),
    filters: parseFilters(searchParams.get("filters")),
  };
}

export function serializeDataTableQuery(query: DataTableQuery): Record<string, string> {
  const out: Record<string, string> = { page: String(query.page), pageSize: String(query.pageSize) };
  if (query.search) out.search = query.search;
  if (query.sort?.length) out.sort = JSON.stringify(query.sort);
  if (query.filters?.length) out.filters = JSON.stringify(query.filters);
  return out;
}

export function serializeDataTableQueryToURLSearchParams(query: DataTableQuery): URLSearchParams {
  return new URLSearchParams(serializeDataTableQuery(query));
}

const DENSITY: Record<DataTableRowDensity, string> = {
  compact: "py-1",
  standard: "py-2.5",
  comfortable: "py-4",
};

function columnTitle<T>(column: DataTableColumn<T>): ReactNode {
  return typeof column.title === "function" ? column.title(column) : column.title;
}

function textTitle<T>(column: DataTableColumn<T>): string {
  const title = columnTitle(column);
  return typeof title === "string" || typeof title === "number" ? String(title) : column.key;
}

function resolveRowId<T>(record: T, index: number, getRowId?: (record: T, index: number) => string): string {
  if (getRowId) return getRowId(record, index);
  const candidate = (record as { id?: string | number }).id;
  return candidate != null ? String(candidate) : String(index);
}

function emptyTitle(value: ReactNode | undefined, fallback: string): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return fallback;
}

export function DataTable<T>({
  columns,
  data,
  mode = "client",
  query: queryProp,
  defaultQuery,
  onQueryChange,
  total,
  loading,
  error,
  getRowId,
  search,
  pagination,
  resetPageOn,
  rowSelection,
  columnVisibility,
  expandable,
  empty,
  errorConfig,
  viewMode: viewModeProp,
  defaultViewMode = "list",
  onViewModeChange,
  renderGridItem,
  stickyHeader,
  rowDensity = "standard",
  rowActions,
  className,
  caption,
}: DataTableProps<T>) {
  const searchConfig = useMemo(() => {
    if (search === true) return { placeholder: "Search", debounceMs: 300 };
    return search || undefined;
  }, [search]);
  const paginationConfig = useMemo(() => {
    if (pagination === true) return {};
    return pagination || undefined;
  }, [pagination]);
  const initialQuery: DataTableQuery = {
    ...DEFAULT_QUERY,
    pageSize: paginationConfig?.pageSize ?? DEFAULT_QUERY.pageSize,
    ...defaultQuery,
  };
  const [query, setQuery] = useControllableState<DataTableQuery>({
    value: queryProp,
    defaultValue: initialQuery,
    onChange: onQueryChange,
  });
  const [searchDraft, setSearchDraft] = useState(query.search ?? "");
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    setSearchDraft(query.search ?? "");
  }, [query.search]);

  useEffect(() => {
    if (!searchConfig) return;
    const handle = window.setTimeout(() => {
      const current = queryRef.current;
      const nextSearch = searchDraft.trim() ? searchDraft : undefined;
      if (nextSearch === (current.search || undefined)) return;
      setQuery(withPageReset(current, { search: nextSearch }, resetPageOn));
    }, searchConfig.debounceMs ?? 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft, searchConfig, resetPageOn, setQuery]);

  const [viewMode, setViewMode] = useControllableState<DataTableViewMode>({
    value: viewModeProp,
    defaultValue: defaultViewMode,
    onChange: onViewModeChange,
  });
  const visibilityConfig: DataTableColumnVisibility | undefined =
    columnVisibility === true ? {} : columnVisibility || undefined;
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<Set<string>>(
    () => new Set(visibilityConfig?.defaultHiddenColumnKeys ?? []),
  );
  useEffect(() => {
    if (visibilityConfig?.hiddenColumnKeys) setHiddenColumnKeys(new Set(visibilityConfig.hiddenColumnKeys));
  }, [visibilityConfig?.hiddenColumnKeys]);

  const [selectedRowKeys, setSelectedRowKeys] = useControllableState<string[]>({
    value: rowSelection?.selectedRowKeys,
    defaultValue: rowSelection?.defaultSelectedRowKeys ?? [],
    onChange: (keys) => {
      rowSelection?.onChange?.(
        keys,
        data.filter((row, index) => keys.includes(resolveRowId(row, index, getRowId))),
      );
    },
  });
  const [expandedRowKeys, setExpandedRowKeys] = useControllableState<string[]>({
    value: expandable?.expandedRowKeys,
    defaultValue: expandable?.defaultExpandedRowKeys ?? [],
    onChange: expandable?.onChange,
  });

  const pipeline = useMemo(() => {
    if (mode === "server") return { rows: data, total: total ?? data.length };
    return applyClientPipeline(data, columns, query, { searchFields: searchConfig?.fields });
  }, [mode, data, columns, query, total, searchConfig?.fields]);

  const visible = columns.filter((column) => !column.hidden && !hiddenColumnKeys.has(column.key));
  const updateQuery = (patch: Partial<DataTableQuery>) => setQuery(withPageReset(query, patch, resetPageOn));
  const alignClass = (align?: "left" | "center" | "right") =>
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const emptyNode =
    empty && typeof empty === "object" && empty !== null && "title" in empty ? (
      <EmptyState
        icon={(empty as DataTableEmptyConfig).icon}
        title={emptyTitle((empty as DataTableEmptyConfig).title, "No data")}
        description={
          typeof (empty as DataTableEmptyConfig).description === "string"
            ? (empty as DataTableEmptyConfig).description
            : undefined
        }
        action={(empty as DataTableEmptyConfig).action}
      />
    ) : (
      (empty as ReactNode)
    );

  const errorNode = !error
    ? undefined
    : (
        <EmptyState
          title={emptyTitle(errorConfig?.title, "Unable to load data")}
          description={
            typeof errorConfig?.description === "string"
              ? errorConfig.description
              : error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : "Something went wrong"
          }
          action={
            errorConfig?.onRetry ? (
              <Button size="sm" onClick={errorConfig.onRetry}>
                Retry
              </Button>
            ) : undefined
          }
        />
      );

  const pageIds = pipeline.rows.map((row, index) => resolveRowId(row, index, getRowId));
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedRowKeys.includes(id));

  return (
    <div className={cx("font-sans", className)} data-testid="data-table" data-density={rowDensity}>
      <div className={CX.panel}>
        {searchConfig || columns.some((column) => column.filter) || columnVisibility || renderGridItem ? (
          <div className={CX.toolbar}>
            {searchConfig ? (
              <label className="flex min-w-48 flex-1 items-center gap-2">
                <Icon size="sm"><SearchIcon /></Icon>
                <input
                  className={CX.search}
                  aria-label="Search table"
                  placeholder={searchConfig.placeholder ?? "Search"}
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                />
              </label>
            ) : null}
            {columns
              .filter((column) => column.filter)
              .map((column) => {
                const current = getQueryFilter(query.filters, column.key);
                const filter = column.filter!;
                const change = (value: Omit<DataTableFilterValue, "field"> | undefined) =>
                  updateQuery({ filters: upsertQueryFilter(query.filters, column.key, value) });
                if (filter.render) {
                  return (
                    <div key={column.key}>
                      {filter.render({ value: current, onChange: change, onApply: () => undefined, onClear: () => change(undefined) })}
                    </div>
                  );
                }
                if (filter.options?.length) {
                  return (
                    <select
                      key={column.key}
                      className={CX.search}
                      aria-label={filter.label ?? textTitle(column)}
                      value={current?.value == null ? "" : String(current.value)}
                      onChange={(event) =>
                        change(event.target.value ? { operator: filter.defaultOperator ?? "eq", value: event.target.value } : undefined)
                      }
                    >
                      <option value="">{filter.placeholder ?? textTitle(column)}</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {typeof option.label === "string" ? option.label : option.value}
                        </option>
                      ))}
                    </select>
                  );
                }
                return (
                  <input
                    key={column.key}
                    className={CX.search}
                    aria-label={filter.label ?? textTitle(column)}
                    placeholder={filter.placeholder ?? textTitle(column)}
                    value={current?.value == null ? "" : String(current.value)}
                    onChange={(event) =>
                      change(
                        event.target.value
                          ? { operator: filter.defaultOperator ?? "contains", value: event.target.value }
                          : undefined,
                      )
                    }
                  />
                );
              })}
            {columnVisibility ? (
              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md border border-solid border-cx-primary px-2 py-2 text-sm">
                  <Icon size="sm"><Columns3Icon /></Icon>
                  Columns
                </summary>
                <div className="absolute right-0 z-10 mt-1 flex min-w-40 flex-col gap-1 rounded-md border border-solid border-cx-secondary bg-cx-primary p-2 shadow-lg">
                  {columns.map((column) => (
                    <label key={column.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!hiddenColumnKeys.has(column.key)}
                        onChange={() => {
                          setHiddenColumnKeys((prev) => {
                            const next = new Set(prev);
                            if (next.has(column.key)) next.delete(column.key);
                            else next.add(column.key);
                            visibilityConfig?.onChange?.([...next]);
                            return next;
                          });
                        }}
                      />
                      {textTitle(column)}
                    </label>
                  ))}
                </div>
              </details>
            ) : null}
            {renderGridItem ? (
              <div className="inline-flex overflow-hidden rounded-md border border-solid border-cx-primary">
                <button type="button" className={cx("px-2 py-2", viewMode === "list" && "bg-cx-secondary")} aria-label="List view" onClick={() => setViewMode("list")}>
                  <Icon size="sm"><TableIcon /></Icon>
                </button>
                <button type="button" className={cx("px-2 py-2", viewMode === "grid" && "bg-cx-secondary")} aria-label="Grid view" onClick={() => setViewMode("grid")}>
                  <Icon size="sm"><LayoutGridIcon /></Icon>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {selectedRowKeys.length > 0 ? (
          <div className="px-3 py-2 text-sm text-cx-secondary" aria-live="polite">
            {selectedRowKeys.length} row{selectedRowKeys.length === 1 ? "" : "s"} selected
          </div>
        ) : null}

        {errorNode ? (
          <div role="alert">{errorNode}</div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 p-3">
            {pipeline.rows.length === 0 ? emptyNode : pipeline.rows.map((row, index) => (
              <div key={resolveRowId(row, index, getRowId)}>{renderGridItem?.(row, index)}</div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className={CX.table}>
              {caption ? <caption className="px-3 py-2 text-left font-semibold">{caption}</caption> : null}
              <thead>
                <tr>
                  {expandable ? <th className={CX.th} /> : null}
                  {rowSelection ? (
                    <th className={CX.th}>
                      <input
                        type="checkbox"
                        aria-label="Select all rows"
                        checked={allSelected}
                        onChange={() => {
                          if (allSelected) setSelectedRowKeys(selectedRowKeys.filter((id) => !pageIds.includes(id)));
                          else setSelectedRowKeys([...new Set([...selectedRowKeys, ...pageIds])]);
                        }}
                      />
                    </th>
                  ) : null}
                  {visible.map((column) => {
                    const sort = query.sort?.find((item) => item.field === column.key);
                    const multi = typeof column.sortable === "object" && Boolean(column.sortable.multi);
                    return (
                      <th key={column.key} className={cx(CX.th, stickyHeader && "sticky top-0", alignClass(column.align))} style={{ width: column.width, minWidth: column.minWidth }}>
                        {column.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                            onClick={() => {
                              const order = !sort ? "asc" : sort.order === "asc" ? "desc" : undefined;
                              const rest = multi ? (query.sort ?? []).filter((item) => item.field !== column.key) : [];
                              updateQuery({ sort: order ? [...rest, { field: column.key, order }] : rest.length ? rest : undefined });
                            }}
                          >
                            {columnTitle(column)}
                            {sort?.order === "asc" ? <ChevronUpIcon /> : sort?.order === "desc" ? <ChevronDownIcon /> : null}
                          </button>
                        ) : (
                          columnTitle(column)
                        )}
                      </th>
                    );
                  })}
                  {rowActions ? <th className={CX.th} /> : null}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className={cx(CX.td, DENSITY[rowDensity])} colSpan={visible.length + 3}>
                      Loading…
                    </td>
                  </tr>
                ) : pipeline.rows.length === 0 ? (
                  <tr>
                    <td className={CX.td} colSpan={visible.length + 3}>
                      {emptyNode}
                    </td>
                  </tr>
                ) : (
                  pipeline.rows.map((row, index) => {
                    const id = resolveRowId(row, index, getRowId);
                    const expanded = expandedRowKeys.includes(id);
                    const canExpand = expandable ? (expandable.rowExpandable?.(row) ?? true) : false;
                    return (
                      <Fragment key={id}>
                        <tr>
                          {expandable ? (
                            <td className={cx(CX.td, DENSITY[rowDensity])}>
                              {canExpand ? (
                                <button
                                  type="button"
                                  aria-expanded={expanded}
                                  aria-label={expanded ? "Collapse row" : "Expand row"}
                                  onClick={() =>
                                    setExpandedRowKeys(
                                      expanded ? expandedRowKeys.filter((key) => key !== id) : [...expandedRowKeys, id],
                                    )
                                  }
                                >
                                  <Icon size="sm">
                                    <ChevronRightIcon className={expanded ? "rotate-90" : undefined} />
                                  </Icon>
                                </button>
                              ) : null}
                            </td>
                          ) : null}
                          {rowSelection ? (
                            <td className={cx(CX.td, DENSITY[rowDensity])}>
                              <input
                                type="checkbox"
                                aria-label={`Select row ${id}`}
                                checked={selectedRowKeys.includes(id)}
                                disabled={rowSelection.getCheckboxProps?.(row)?.disabled}
                                onChange={() =>
                                  setSelectedRowKeys(
                                    selectedRowKeys.includes(id)
                                      ? selectedRowKeys.filter((key) => key !== id)
                                      : [...selectedRowKeys, id],
                                  )
                                }
                              />
                            </td>
                          ) : null}
                          {visible.map((column) => {
                            const value = column.dataIndex
                              ? getByDataIndex(row, column.dataIndex as string | string[])
                              : (row as Record<string, unknown>)[column.key];
                            return (
                              <td key={column.key} className={cx(CX.td, DENSITY[rowDensity], alignClass(column.align))}>
                                {column.render ? column.render(value, row, index) : (value as ReactNode)}
                              </td>
                            );
                          })}
                          {rowActions ? <td className={cx(CX.td, DENSITY[rowDensity])}>{rowActions(row, index)}</td> : null}
                        </tr>
                        {expanded && expandable?.renderExpandedRow ? (
                          <tr key={`${id}-expanded`}>
                            <td className={CX.td} colSpan={visible.length + 3}>
                              {expandable.renderExpandedRow(row, index)}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {paginationConfig && !errorNode ? (
          <div className="border-t border-solid border-cx-secondary p-3">
            <Pagination
              page={query.page}
              pageSize={query.pageSize}
              total={pipeline.total}
              onPageChange={(page) => updateQuery({ page })}
              onPageSizeChange={paginationConfig.showSizeChanger === false ? undefined : (pageSize) => updateQuery({ pageSize })}
              pageSizeOptions={paginationConfig.pageSizeOptions}
              showFirstLast={paginationConfig.showFirstLast}
              metaLabel={paginationConfig.metaLabel}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
