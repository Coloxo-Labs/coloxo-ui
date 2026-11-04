"use client";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/lib/icons";

import { IconButton } from "./icon-button";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  active: "bg-cx-brand font-medium hover:disabled:bg-cx-brand-hover",
  controls: "flex items-center gap-1",
  ellipsis: "py-0 px-1 text-cx-tertiary",
  meta: "min-w-[8rem]",
  page: "border border-solid border-transparent rounded-md bg-transparent text-cx-secondary cursor-pointer hover:disabled:bg-cx-primary-hover hover:disabled:text-cx-primary hover:disabled:border-cx-secondary focus-visible:outline",
  root: "flex flex-wrap items-center justify-between gap-3 font-sans text-sm text-cx-tertiary",
  select:
    "border border-solid border-cx-primary rounded-md bg-cx-primary text-cx-secondary py-0 px-2 focus-visible:outline",
  size: "inline-flex items-center gap-2",
};

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showFirstLast?: boolean;
  metaLabel?: string | ((meta: { start: number; end: number; total: number }) => string);
  className?: string;
};

function formatMetaLabel(
  metaLabel: PaginationProps["metaLabel"],
  meta: { start: number; end: number; total: number },
): string {
  if (typeof metaLabel === "function") return metaLabel(meta);
  const template = metaLabel ?? "Showing {start}–{end} of {total}";
  return template
    .replace("{start}", String(meta.start))
    .replace("{end}", String(meta.end))
    .replace("{total}", String(meta.total));
}

function pageItems(current: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);
  return items;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  showFirstLast = false,
  metaLabel,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(total, current * pageSize);

  return (
    <nav className={cx(CX.root, className)} aria-label="Pagination">
      <div className={CX.meta}>{formatMetaLabel(metaLabel, { start, end, total })}</div>
      {onPageSizeChange ? (
        <label className={CX.size}>
          Rows
          <select
            className={CX.select}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className={CX.controls}>
        {showFirstLast ? (
          <IconButton
            aria-label="First page"
            variant="secondary"
            size="sm"
            disabled={current <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeftIcon />
          </IconButton>
        ) : null}
        <IconButton
          aria-label="Previous page"
          variant="secondary"
          size="sm"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          <ChevronLeftIcon />
        </IconButton>
        {pageItems(current, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`e-${index}`} className={CX.ellipsis}>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={cx(CX.page, item === current && CX.active)}
              aria-current={item === current ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}
        <IconButton
          aria-label="Next page"
          variant="secondary"
          size="sm"
          disabled={current >= totalPages}
          onClick={() => onPageChange(current + 1)}
        >
          <ChevronRightIcon />
        </IconButton>
        {showFirstLast ? (
          <IconButton
            aria-label="Last page"
            variant="secondary"
            size="sm"
            disabled={current >= totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRightIcon />
          </IconButton>
        ) : null}
      </div>
    </nav>
  );
}
