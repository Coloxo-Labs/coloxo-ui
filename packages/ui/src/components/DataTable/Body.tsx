"use client";
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from "../../icons";

import { Fragment, useMemo, type ReactNode } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../Checkbox/Checkbox";
import { EmptyState } from "../EmptyState/EmptyState";
import { Skeleton } from "../Skeleton/Skeleton";
import { cx } from "../../utils/cx";
import { mapDataTableColumns } from "./mapColumns";
import type { DataTableColumn, DataTableSort } from "./types";
import styles from "./DataTable.module.css";

export type DataTableBodyProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  empty?: ReactNode;
  caption?: string;
  stickyHeader?: boolean;
  getRowId: (record: T, index: number) => string;
  sort?: DataTableSort[];
  onSortChange?: (sort: DataTableSort[] | undefined) => void;
  selectedRowKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  expandedRowKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  renderExpandedRow?: (record: T, index: number) => ReactNode;
  rowExpandable?: (record: T) => boolean;
  rowActions?: (record: T, index: number) => ReactNode;
  hiddenColumnKeys?: Set<string>;
  skeletonRowCount?: number;
};

function sortForColumn(sort: DataTableSort[] | undefined, columnKey: string) {
  return sort?.find((item) => item.field === columnKey);
}

export function DataTableBody<T>({
  columns,
  rows,
  loading,
  empty,
  caption,
  stickyHeader,
  getRowId,
  sort,
  onSortChange,
  selectedRowKeys,
  onSelectionChange,
  getCheckboxProps,
  expandedRowKeys,
  onExpandedChange,
  renderExpandedRow,
  rowExpandable,
  rowActions,
  hiddenColumnKeys,
  skeletonRowCount = 5,
}: DataTableBodyProps<T>) {
  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden && !hiddenColumnKeys?.has(col.key)),
    [columns, hiddenColumnKeys],
  );

  const columnDefs = useMemo(() => {
    const defs = mapDataTableColumns(visibleColumns);
    const extra: ColumnDef<T>[] = [];

    if (onExpandedChange && renderExpandedRow) {
      extra.push({
        id: "__expand",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => {
          const record = row.original;
          const id = row.id;
          const canExpand = rowExpandable ? rowExpandable(record) : true;
          if (!canExpand) return null;
          const expanded = expandedRowKeys?.includes(id) ?? false;
          return (
            <button
              type="button"
              className={styles.expandButton}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse row" : "Expand row"}
              onClick={() => {
                const current = expandedRowKeys ?? [];
                const next = expanded ? current.filter((key) => key !== id) : [...current, id];
                onExpandedChange(next);
              }}
            >
              {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </button>
          );
        },
      });
    }

    if (onSelectionChange) {
      extra.unshift({
        id: "__select",
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
            aria-label="Select all rows on page"
            label={undefined}
          />
        ),
        cell: ({ row }) => {
          const props = getCheckboxProps?.(row.original) ?? {};
          return (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={props.disabled}
              onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
              aria-label="Select row"
            />
          );
        },
      });
    }

    if (rowActions) {
      extra.push({
        id: "__actions",
        enableSorting: false,
        header: () => "Actions",
        cell: ({ row }) => rowActions(row.original, row.index),
      });
    }

    return [...extra, ...defs];
  }, [
    visibleColumns,
    onSelectionChange,
    getCheckboxProps,
    onExpandedChange,
    renderExpandedRow,
    expandedRowKeys,
    rowExpandable,
    rowActions,
  ]);

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: Boolean(onSelectionChange),
    getRowId: (row, index) => getRowId(row, index),
    state: {
      rowSelection: Object.fromEntries((selectedRowKeys ?? []).map((id) => [id, true])),
    },
    onRowSelectionChange: (updater) => {
      if (!onSelectionChange) return;
      const current = Object.fromEntries((selectedRowKeys ?? []).map((id) => [id, true]));
      const next = typeof updater === "function" ? updater(current) : updater;
      onSelectionChange(Object.keys(next).filter((key) => next[key]));
    },
  });

  const colSpan = columnDefs.length;

  return (
    <div className={styles.scroll}>
      <table className={cx(styles.table, stickyHeader && styles.tableSticky)}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const columnKey = header.column.id;
                const meta = header.column.columnDef.meta as
                  { align?: string; fixed?: string } | undefined;
                const columnSort = sortForColumn(sort, columnKey);
                const canSort = header.column.getCanSort();
                return (
                  <th
                    key={header.id}
                    className={cx(
                      styles.th,
                      meta?.align === "center" && styles.thCenter,
                      meta?.align === "right" && styles.thRight,
                      meta?.fixed === "left" && styles.thFixedLeft,
                      meta?.fixed === "right" && styles.thFixedRight,
                      header.column.id === "__expand" && styles.expandCell,
                    )}
                    style={{
                      width:
                        typeof header.column.columnDef.size === "number"
                          ? header.column.columnDef.size
                          : undefined,
                      minWidth:
                        typeof header.column.columnDef.minSize === "number"
                          ? header.column.columnDef.minSize
                          : undefined,
                    }}
                    aria-sort={
                      columnSort?.order === "asc"
                        ? "ascending"
                        : columnSort?.order === "desc"
                          ? "descending"
                          : canSort
                            ? "none"
                            : undefined
                    }
                  >
                    {canSort && onSortChange ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={() => {
                          const current = sortForColumn(sort, columnKey);
                          const next: DataTableSort[] | undefined = !current
                            ? [{ field: columnKey, order: "asc" }]
                            : current.order === "asc"
                              ? [{ field: columnKey, order: "desc" }]
                              : undefined;
                          onSortChange(next);
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {columnSort?.order === "asc" ? (
                          <ChevronUpIcon />
                        ) : columnSort?.order === "desc" ? (
                          <ChevronDownIcon />
                        ) : null}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRowCount }, (_, index) => (
              <tr key={`skeleton-${index}`}>
                {columnDefs.map((column) => (
                  <td key={column.id} className={styles.td}>
                    <Skeleton />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td className={styles.emptyCell} colSpan={colSpan}>
                {empty ?? (
                  <EmptyState title="No data" description="There are no rows to display." />
                )}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const expanded = expandedRowKeys?.includes(row.id) ?? false;
              return (
                <Fragment key={row.id}>
                  <tr className={styles.tr} data-selected={row.getIsSelected() || undefined}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        { align?: string; fixed?: string } | undefined;
                      return (
                        <td
                          key={cell.id}
                          className={cx(
                            styles.td,
                            meta?.align === "center" && styles.tdCenter,
                            meta?.align === "right" && styles.tdRight,
                            meta?.fixed === "left" && styles.tdFixedLeft,
                            meta?.fixed === "right" && styles.tdFixedRight,
                            cell.column.id === "__expand" && styles.expandCell,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                  {expanded && renderExpandedRow ? (
                    <tr key={`${row.id}-expanded`} className={styles.expandedRow}>
                      <td colSpan={colSpan}>{renderExpandedRow(row.original, row.index)}</td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
