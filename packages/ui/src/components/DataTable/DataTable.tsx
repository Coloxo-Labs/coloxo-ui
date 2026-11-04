"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EmptyState } from "../EmptyState/EmptyState";
import { Pagination } from "../Pagination/Pagination";
import { Button } from "../Button/Button";
import { cx } from "../../utils/cx";
import { useControllableState } from "../../utils/useControllableState";
import { DataTableBody } from "./Body";
import { DataTableGrid } from "./Grid";
import { DataTableToolbar } from "./Toolbar";
import { upsertQueryFilter } from "./filters";
import { applyClientPipeline, DEFAULT_QUERY, withPageReset } from "./query";
import type {
  DataTableColumnVisibility,
  DataTableEmptyConfig,
  DataTableErrorConfig,
  DataTableFilterValue,
  DataTablePaginationConfig,
  DataTableProps,
  DataTableQuery,
  DataTableSearchConfig,
  DataTableViewMode,
} from "./types";
import styles from "./DataTable.module.css";

const DEFAULT_SEARCH_CONFIG: DataTableSearchConfig = {
  placeholder: "Search",
  debounceMs: 300,
};

const DEFAULT_PAGINATION_CONFIG: DataTablePaginationConfig = {};

function resolveSearchConfig(
  search: DataTableProps<unknown>["search"],
): DataTableSearchConfig | undefined {
  if (!search) return undefined;
  if (search === true) return DEFAULT_SEARCH_CONFIG;
  return search;
}

function resolvePaginationConfig(
  pagination: DataTableProps<unknown>["pagination"],
): DataTablePaginationConfig | undefined {
  if (!pagination) return undefined;
  if (pagination === true) return DEFAULT_PAGINATION_CONFIG;
  return pagination;
}

function emptyStateTitle(value: ReactNode | undefined, fallback: string): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function resolveEmptyNode(empty: DataTableProps<unknown>["empty"]): ReactNode | undefined {
  if (!empty) return undefined;
  if (typeof empty === "object" && empty !== null && "title" in empty) {
    const config = empty as DataTableEmptyConfig;
    return (
      <EmptyState
        icon={config.icon}
        title={emptyStateTitle(config.title, "No data")}
        description={
          typeof config.description === "string" || config.description == null
            ? config.description
            : undefined
        }
        action={config.action}
      />
    );
  }
  return empty as ReactNode;
}

function resolveErrorNode(
  error: DataTableProps<unknown>["error"],
  errorConfig?: DataTableErrorConfig,
): ReactNode | undefined {
  if (!error) return undefined;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "boolean"
        ? "Something went wrong"
        : typeof error === "string"
          ? error
          : "Something went wrong";
  return (
    <EmptyState
      title={emptyStateTitle(errorConfig?.title, "Unable to load data")}
      description={typeof errorConfig?.description === "string" ? errorConfig.description : message}
      action={
        errorConfig?.onRetry ? (
          <Button size="sm" onClick={errorConfig.onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    />
  );
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
  const searchConfig = useMemo(() => resolveSearchConfig(search), [search]);
  const paginationConfig = useMemo(() => resolvePaginationConfig(pagination), [pagination]);
  const searchDebounceMs = searchConfig?.debounceMs ?? 300;

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
    }, searchDebounceMs);
    return () => window.clearTimeout(handle);
  }, [searchDraft, searchConfig, searchDebounceMs, resetPageOn, setQuery]);

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
    if (visibilityConfig?.hiddenColumnKeys) {
      setHiddenColumnKeys(new Set(visibilityConfig.hiddenColumnKeys));
    }
  }, [visibilityConfig?.hiddenColumnKeys]);

  const [selectedRowKeys, setSelectedRowKeys] = useControllableState<string[]>({
    value: rowSelection?.selectedRowKeys,
    defaultValue: rowSelection?.defaultSelectedRowKeys ?? [],
    onChange: (keys) => {
      if (!rowSelection?.onChange) return;
      const rows = data.filter((row, index) => keys.includes(resolveRowId(row, index, getRowId)));
      rowSelection.onChange(keys, rows);
    },
  });

  const [expandedRowKeys, setExpandedRowKeys] = useControllableState<string[]>({
    value: expandable?.expandedRowKeys,
    defaultValue: expandable?.defaultExpandedRowKeys ?? [],
    onChange: expandable?.onChange,
  });

  const resolveRowIdFn = (record: T, index: number) => resolveRowId(record, index, getRowId);

  const pipeline = useMemo(() => {
    if (mode === "server") {
      return { rows: data, total: total ?? data.length };
    }
    return applyClientPipeline(data, columns, query, {
      getRowId: resolveRowIdFn,
      searchFields: searchConfig?.fields,
    });
  }, [mode, data, columns, query, total, searchConfig?.fields, getRowId]);

  const emptyNode = resolveEmptyNode(empty);
  const errorNode = resolveErrorNode(error, errorConfig);

  const showToolbar =
    Boolean(searchConfig) ||
    columns.some((col) => col.filter) ||
    Boolean(columnVisibility) ||
    Boolean(renderGridItem);

  const updateQuery = (patch: Partial<DataTableQuery>) => {
    setQuery(withPageReset(query, patch, resetPageOn));
  };

  const handleFilterChange = (
    field: string,
    value: Omit<DataTableFilterValue, "field"> | undefined,
  ) => {
    updateQuery({ filters: upsertQueryFilter(query.filters, field, value) });
  };

  const toggleColumn = (key: string) => {
    setHiddenColumnKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      visibilityConfig?.onChange?.([...next]);
      return next;
    });
  };

  return (
    <div className={cx(styles.root, className)} data-testid="data-table" data-density={rowDensity}>
      <div className={styles.panel}>
        {showToolbar ? (
          <DataTableToolbar
            columns={columns}
            search={searchConfig}
            searchValue={searchDraft}
            onSearchChange={setSearchDraft}
            filters={query.filters}
            onFilterChange={handleFilterChange}
            onFiltersChange={(next) => updateQuery({ filters: next })}
            onClearFilters={() => updateQuery({ filters: undefined })}
            hiddenColumnKeys={hiddenColumnKeys}
            onToggleColumn={toggleColumn}
            columnVisibilityEnabled={Boolean(columnVisibility)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showViewToggle={Boolean(renderGridItem)}
            selectionCount={selectedRowKeys.length || undefined}
          />
        ) : null}

        {selectedRowKeys.length > 0 ? (
          <div className={styles.selectionBar} aria-live="polite">
            {selectedRowKeys.length} row{selectedRowKeys.length === 1 ? "" : "s"} selected
          </div>
        ) : null}

        {errorNode ? (
          <div className={styles.errorWrap} role="alert">
            {errorNode}
          </div>
        ) : viewMode === "grid" ? (
          <DataTableGrid
            rows={loading ? [] : pipeline.rows}
            renderGridItem={renderGridItem}
            empty={loading ? null : emptyNode}
          />
        ) : (
          <DataTableBody
            columns={columns}
            rows={pipeline.rows}
            loading={loading}
            empty={emptyNode}
            caption={caption}
            stickyHeader={stickyHeader}
            getRowId={resolveRowIdFn}
            sort={query.sort}
            onSortChange={(next) => updateQuery({ sort: next })}
            selectedRowKeys={rowSelection ? selectedRowKeys : undefined}
            onSelectionChange={rowSelection ? setSelectedRowKeys : undefined}
            getCheckboxProps={rowSelection?.getCheckboxProps}
            expandedRowKeys={expandable ? expandedRowKeys : undefined}
            onExpandedChange={expandable ? setExpandedRowKeys : undefined}
            renderExpandedRow={expandable?.renderExpandedRow}
            rowExpandable={expandable?.rowExpandable}
            rowActions={rowActions}
            hiddenColumnKeys={hiddenColumnKeys}
          />
        )}

        {paginationConfig && !errorNode ? (
          <div className={styles.footer}>
            <Pagination
              page={query.page}
              pageSize={query.pageSize}
              total={pipeline.total}
              onPageChange={(page) => updateQuery({ page })}
              onPageSizeChange={
                paginationConfig.showSizeChanger === false
                  ? undefined
                  : (pageSize) => updateQuery({ pageSize })
              }
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

function resolveRowId<T>(
  record: T,
  index: number,
  getRowId?: (record: T, index: number) => string,
): string {
  if (getRowId) return getRowId(record, index);
  const candidate = (record as { id?: string }).id;
  return candidate != null ? String(candidate) : String(index);
}
