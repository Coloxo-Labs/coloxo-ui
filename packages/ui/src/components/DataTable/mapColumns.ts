import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { DataTableColumn } from "./types";

/** Resolve nested `dataIndex` paths (`"a.b"` or `["a","b"]`). */
export function getByDataIndex(row: unknown, dataIndex: string | string[]): unknown {
  const parts = Array.isArray(dataIndex) ? dataIndex : dataIndex.split(".");
  let cur: unknown = row;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function resolveColumnTitle<T>(column: DataTableColumn<T>): ReactNode {
  return typeof column.title === "function" ? column.title(column) : column.title;
}

export function mapDataTableColumns<T>(
  columns: DataTableColumn<T>[],
  options?: {
    renderCell?: (column: DataTableColumn<T>, value: unknown, record: T, index: number) => ReactNode;
  },
): ColumnDef<T>[] {
  return columns.map((column) => ({
    id: column.key,
    accessorKey: typeof column.dataIndex === "string" ? column.dataIndex : undefined,
    header: () => resolveColumnTitle(column),
    enableSorting: Boolean(column.sortable),
    size: typeof column.width === "number" ? column.width : undefined,
    minSize: typeof column.minWidth === "number" ? column.minWidth : undefined,
    meta: {
      align: column.align,
      fixed: column.fixed,
      width: column.width,
      minWidth: column.minWidth,
    },
    accessorFn: column.dataIndex
      ? (row) => getByDataIndex(row, column.dataIndex as string | string[])
      : undefined,
    cell: (info) => {
      const record = info.row.original;
      const value = info.getValue();
      const index = info.row.index;
      if (options?.renderCell) {
        return options.renderCell(column, value, record, index);
      }
      if (column.render) {
        return column.render(value, record, index);
      }
      return value as ReactNode;
    },
  }));
}
