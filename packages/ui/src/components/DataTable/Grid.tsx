"use client";

import type { ReactNode } from "react";
import { EmptyState } from "../EmptyState/EmptyState";
import { cx } from "../../utils/cx";
import styles from "./DataTable.module.css";

export type DataTableGridProps<T> = {
  rows: T[];
  renderGridItem?: (record: T, index: number) => ReactNode;
  empty?: ReactNode;
  className?: string;
};

export function DataTableGrid<T>({ rows, renderGridItem, empty, className }: DataTableGridProps<T>) {
  if (rows.length === 0) {
    return (
      <div className={cx(styles.gridEmpty, className)}>
        {empty ?? (
          <EmptyState title="No data" description="There are no rows to display." />
        )}
      </div>
    );
  }

  return (
    <div className={cx(styles.grid, className)} role="list">
      {rows.map((record, index) => (
        <div key={index} role="listitem">
          {renderGridItem ? renderGridItem(record, index) : String(record)}
        </div>
      ))}
    </div>
  );
}
