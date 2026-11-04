import type { ReactNode } from "react";

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

export type DataTableFilterOption = {
  label: ReactNode;
  value: string;
};

export type DataTableColumnFilter = {
  type: DataTableFilterType;
  label?: string;
  placeholder?: string;
  options?: DataTableFilterOption[];
  defaultOperator?: DataTableFilterOperator;
  /** instant applies on change; manual uses Apply / Clear in the popover */
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

export type DataTableSort = {
  field: string;
  order: "asc" | "desc";
};

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
  /** Nested object accessor path (e.g. `"network.ingress.ip"` or `["network","ingress","ip"]`). */
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
  /** Row vertical rhythm. Maps to `--cx-datatable-row-height` (32 / 40 / 48). */
  rowDensity?: DataTableRowDensity;
  rowActions?: (record: T, index: number) => ReactNode;
  className?: string;
  caption?: string;
};

/** Snapshot of pagination state (distinct from UI config) */
export type DataTablePagination = {
  page: number;
  pageSize: number;
  total: number;
};
