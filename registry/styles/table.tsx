"use client";
import { ChevronDownIcon, ChevronUpIcon } from "@/lib/icons";

import { useMemo, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./skeleton";
import { Checkbox } from "./checkbox";
import { cx } from "@/lib/utils";
import { useControllableState } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  caption: "text-left py-3 px-4 font-semibold",
  empty: "p-0",
  sort: "inline-flex items-center gap-1 border-none bg-none text-inherit cursor-pointer p-0 focus-visible:outline focus-visible:rounded-sm",
  table: "w-full font-sans text-sm",
  td: "py-3 px-4 text-cx-secondary align-middle",
  th: "text-left font-medium text-cx-tertiary bg-cx-secondary py-3 px-4 whitespace-nowrap",
  wrap: "w-full border border-solid border-cx-secondary rounded-lg bg-cx-primary",
};

export type TableColumn<T> = {
  id: string;
  header: ReactNode;
  accessor?: keyof T | ((row: T) => unknown);
  cell?: (ctx: { row: T; value: unknown }) => ReactNode;
  sortable?: boolean;
  width?: number | string;
};

export type TableSorting = {
  id: string;
  desc: boolean;
} | null;

export type TableSelection = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  empty?: ReactNode;
  getRowId?: (row: T, index: number) => string;
  selection?: TableSelection;
  sorting?: TableSorting;
  defaultSorting?: TableSorting;
  onSortingChange?: (sorting: TableSorting) => void;
  className?: string;
  caption?: string;
};

function toTanstackSorting(sorting: TableSorting): SortingState {
  return sorting ? [{ id: sorting.id, desc: sorting.desc }] : [];
}

export function Table<T>({
  columns,
  data,
  loading,
  empty,
  getRowId,
  selection,
  sorting,
  defaultSorting = null,
  onSortingChange,
  className,
  caption,
}: TableProps<T>) {
  const [sort, setSort] = useControllableState<TableSorting>({
    value: sorting,
    defaultValue: defaultSorting,
    onChange: onSortingChange,
  });

  const columnDefs = useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = columns.map((column) => ({
      id: column.id,
      header: () => column.header,
      enableSorting: Boolean(column.sortable),
      size: typeof column.width === "number" ? column.width : undefined,
      accessorFn: (row) => {
        if (typeof column.accessor === "function") return column.accessor(row);
        if (column.accessor) return row[column.accessor];
        return undefined;
      },
      cell: (info) =>
        column.cell
          ? column.cell({ row: info.row.original, value: info.getValue() })
          : (info.getValue() as ReactNode),
    }));

    if (selection) {
      defs.unshift({
        id: "__select",
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
            aria-label="Select all rows"
            label={undefined}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(checked)}
            aria-label="Select row"
          />
        ),
      });
    }

    return defs;
  }, [columns, selection]);

  // Keep sorting stable across TanStack's own state updates. A fresh array
  // invalidates the sorted row model and can continuously queue page resets.
  const sortingState = useMemo(() => toTanstackSorting(sort), [sort]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // This primitive renders all rows and has no pagination to reset.
    autoResetPageIndex: false,
    enableRowSelection: Boolean(selection),
    getRowId: getRowId
      ? (row, index) => getRowId(row, index)
      : (row, index) => String((row as { id?: string }).id ?? index),
    state: {
      sorting: sortingState,
      rowSelection: selection
        ? Object.fromEntries(selection.selectedIds.map((id) => [id, true]))
        : {},
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sortingState) : updater;
      const first = next[0];
      setSort(first ? { id: first.id, desc: first.desc } : null);
    },
    onRowSelectionChange: (updater) => {
      if (!selection) return;
      const current = Object.fromEntries(selection.selectedIds.map((id) => [id, true]));
      const next = typeof updater === "function" ? updater(current) : updater;
      selection.onChange(Object.keys(next).filter((key) => next[key]));
    },
  });

  return (
    <div className={cx(CX.wrap, className)}>
      <table className={CX.table}>
        {caption ? <caption className={CX.caption}>{caption}</caption> : null}
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const canSort = header.column.getCanSort();
                return (
                  <th
                    key={header.id}
                    className={CX.th}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : canSort
                            ? "none"
                            : undefined
                    }
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className={CX.sort}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUpIcon />
                        ) : header.column.getIsSorted() === "desc" ? (
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
            Array.from({ length: 5 }, (_, index) => (
              <tr key={`skeleton-${index}`}>
                {columnDefs.map((column) => (
                  <td key={column.id} className={CX.td}>
                    <Skeleton />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td className={CX.empty} colSpan={columnDefs.length}>
                {empty ?? <EmptyState title="No data" description="There are no rows to display." />}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={CX.tr} data-selected={row.getIsSelected() || undefined}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={CX.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
