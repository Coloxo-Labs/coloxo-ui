"use client";
import {
  FunnelIcon,
  SearchIcon,
  LayoutGridIcon,
  TableIcon,
  Columns3Icon,
  XIcon,
} from "../../icons";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Dropdown } from "../Dropdown/Dropdown";
import { IconButton } from "../IconButton/IconButton";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";
import type {
  DataTableColumn,
  DataTableFilterValue,
  DataTableSearchConfig,
  DataTableViewMode,
} from "./types";
import { resolveColumnTitle } from "./mapColumns";
import styles from "./DataTable.module.css";

function columnLabelText<T>(column: DataTableColumn<T> | undefined): string {
  if (!column) return "";
  const title = resolveColumnTitle(column);
  if (typeof title === "string" || typeof title === "number") return String(title);
  return column.key;
}

export type DataTableToolbarProps<T> = {
  columns: DataTableColumn<T>[];
  search?: DataTableSearchConfig;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: DataTableFilterValue[];
  onFilterChange: (field: string, value: Omit<DataTableFilterValue, "field"> | undefined) => void;
  onFiltersChange: (filters: DataTableFilterValue[] | undefined) => void;
  onClearFilters: () => void;
  hiddenColumnKeys: Set<string>;
  onToggleColumn: (key: string) => void;
  columnVisibilityEnabled?: boolean;
  viewMode?: DataTableViewMode;
  onViewModeChange?: (mode: DataTableViewMode) => void;
  showViewToggle?: boolean;
  selectionCount?: number;
  toolbarExtra?: ReactNode;
};

type FilterDraftMap = Record<string, Omit<DataTableFilterValue, "field"> | undefined>;

function defaultOperatorForType(type: string): DataTableFilterValue["operator"] {
  switch (type) {
    case "text":
      return "contains";
    case "multi-select":
    case "checkbox":
      return "in";
    case "number":
    case "number-range":
      return "eq";
    case "date-range":
      return "between";
    case "boolean":
      return "eq";
    default:
      return "eq";
  }
}

function filtersToDraft(filters: DataTableFilterValue[] | undefined): FilterDraftMap {
  const draft: FilterDraftMap = {};
  for (const item of filters ?? []) {
    draft[item.field] = { operator: item.operator, value: item.value };
  }
  return draft;
}

function draftToFilters(draft: FilterDraftMap): DataTableFilterValue[] {
  return Object.entries(draft)
    .filter(([, value]) => {
      if (!value) return false;
      if (value.operator === "isNull" || value.operator === "isNotNull") return true;
      if (value.value === undefined || value.value === null || value.value === "") return false;
      if (Array.isArray(value.value) && value.value.length === 0) return false;
      return true;
    })
    .map(([field, value]) => ({
      field,
      operator: value!.operator,
      value: value!.value,
    }));
}

function formatChipValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function FilterRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.filterRow}>
      <label className={styles.filterRowLabel} htmlFor={htmlFor}>
        {label}
      </label>
      <div className={styles.filterRowControl}>{children}</div>
    </div>
  );
}

function FilterField<T>({
  column,
  draft,
  onChange,
}: {
  column: DataTableColumn<T>;
  draft: Omit<DataTableFilterValue, "field"> | undefined;
  onChange: (next: Omit<DataTableFilterValue, "field"> | undefined) => void;
}) {
  const filter = column.filter!;
  const label = filter.label ?? columnLabelText(column);
  const controlId = `dt-filter-${column.key}`;

  if (filter.render) {
    return (
      <FilterRow label={label}>
        {filter.render({
          value: draft,
          onChange,
          onApply: () => onChange(draft),
          onClear: () => onChange(undefined),
        })}
      </FilterRow>
    );
  }

  if (filter.type === "text" || filter.type === "number") {
    return (
      <FilterRow label={label} htmlFor={controlId}>
        <Input
          id={controlId}
          aria-label={label}
          placeholder={filter.placeholder}
          type={filter.type === "number" ? "number" : "text"}
          size="sm"
          value={draft?.value == null ? "" : String(draft.value)}
          onChange={(event) =>
            onChange({
              operator: filter.defaultOperator ?? defaultOperatorForType(filter.type),
              value: event.target.value,
            })
          }
        />
      </FilterRow>
    );
  }

  if ((filter.type === "select" || filter.type === "radio") && filter.options) {
    return (
      <FilterRow label={label}>
        <Select
          aria-label={label}
          size="sm"
          placeholder={filter.placeholder ?? "Select"}
          options={filter.options.map((opt) => ({ value: opt.value, label: opt.label }))}
          value={draft?.value == null ? undefined : String(draft.value)}
          onValueChange={(next) =>
            onChange({
              operator: filter.defaultOperator ?? "eq",
              value: next,
            })
          }
          clearable
        />
      </FilterRow>
    );
  }

  if (filter.type === "multi-select" && filter.options) {
    return (
      <FilterRow label={label}>
        <div className={styles.filterOptionListInline}>
          {filter.options.map((opt) => {
            const selected = Array.isArray(draft?.value)
              ? (draft.value as string[]).includes(opt.value)
              : false;
            return (
              <Checkbox
                key={opt.value}
                label={opt.label}
                checked={selected}
                onCheckedChange={(checked) => {
                  const current = Array.isArray(draft?.value) ? [...(draft.value as string[])] : [];
                  const next = checked
                    ? [...current, opt.value]
                    : current.filter((item) => item !== opt.value);
                  onChange({ operator: "in", value: next });
                }}
              />
            );
          })}
        </div>
      </FilterRow>
    );
  }

  if (filter.type === "boolean" || filter.type === "checkbox") {
    return (
      <FilterRow label={label}>
        <Checkbox
          aria-label={label}
          checked={Boolean(draft?.value)}
          onCheckedChange={(checked) => onChange({ operator: "eq", value: Boolean(checked) })}
        />
      </FilterRow>
    );
  }

  if (filter.type === "date" || filter.type === "date-range") {
    return (
      <FilterRow label={label} htmlFor={controlId}>
        <Input
          id={controlId}
          aria-label={label}
          size="sm"
          type={filter.type === "date-range" ? "text" : "date"}
          placeholder={
            filter.placeholder ??
            (filter.type === "date-range" ? "YYYY-MM-DD – YYYY-MM-DD" : undefined)
          }
          value={draft?.value == null ? "" : String(draft.value)}
          onChange={(event) =>
            onChange({
              operator: filter.defaultOperator ?? (filter.type === "date-range" ? "between" : "eq"),
              value: event.target.value,
            })
          }
        />
      </FilterRow>
    );
  }

  return (
    <FilterRow label={label} htmlFor={controlId}>
      <Input
        id={controlId}
        aria-label={label}
        size="sm"
        placeholder={filter.placeholder}
        value={draft?.value == null ? "" : String(draft.value)}
        onChange={(event) =>
          onChange({
            operator: filter.defaultOperator ?? "contains",
            value: event.target.value,
          })
        }
      />
    </FilterRow>
  );
}

function FiltersDropdown<T>({
  open,
  onOpenChange,
  columns,
  filters,
  onApply,
  onClearAll,
  activeCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: DataTableColumn<T>[];
  filters?: DataTableFilterValue[];
  onApply: (next: DataTableFilterValue[] | undefined) => void;
  onClearAll: () => void;
  activeCount: number;
}) {
  const [draft, setDraft] = useState<FilterDraftMap>(() => filtersToDraft(filters));

  useEffect(() => {
    if (open) setDraft(filtersToDraft(filters));
  }, [open, filters]);

  return (
    <span className={styles.toolbarIconWrap}>
      <Popover.Root open={open} onOpenChange={onOpenChange} modal={false}>
        <Popover.Trigger asChild>
          <IconButton
            variant="tertiary"
            size="sm"
            aria-label="Filters"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <FunnelIcon />
          </IconButton>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className={styles.filterDropdown}
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={12}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              const target = event.target as HTMLElement | null;
              if (
                target?.closest?.(
                  '[data-radix-select-content], [data-radix-popper-content-wrapper], [role="listbox"]',
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <div className={styles.filterDropdownBody}>
              {columns.map((column) => (
                <FilterField
                  key={column.key}
                  column={column}
                  draft={draft[column.key]}
                  onChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      [column.key]: next,
                    }))
                  }
                />
              ))}
            </div>
            <div className={styles.filterActions}>
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => {
                  setDraft({});
                  onClearAll();
                  onOpenChange(false);
                }}
              >
                Clear all
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const next = draftToFilters(draft);
                  onApply(next.length ? next : undefined);
                  onOpenChange(false);
                }}
              >
                Apply
              </Button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {activeCount > 0 ? (
        <span className={styles.filterBadge} aria-hidden>
          {activeCount}
        </span>
      ) : null}
    </span>
  );
}

export function DataTableToolbar<T>({
  columns,
  search,
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  onFiltersChange,
  onClearFilters,
  hiddenColumnKeys,
  onToggleColumn,
  columnVisibilityEnabled,
  viewMode,
  onViewModeChange,
  showViewToggle,
  selectionCount,
  toolbarExtra,
}: DataTableToolbarProps<T>) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterColumns = useMemo(
    () => columns.filter((column) => column.filter && !column.hidden),
    [columns],
  );

  const activeFilterEntries = useMemo(
    () =>
      (filters ?? []).filter(
        (item) =>
          item.operator === "isNull" ||
          item.operator === "isNotNull" ||
          (item.value !== undefined && item.value !== "" && item.value !== null),
      ),
    [filters],
  );

  const visibilityItems = columns
    .filter((col) => !col.hidden)
    .map((col) => ({
      key: col.key,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Checkbox
            checked={!hiddenColumnKeys.has(col.key)}
            onCheckedChange={() => onToggleColumn(col.key)}
            label={resolveColumnTitle(col)}
          />
        </span>
      ),
      onSelect: () => {},
    }));

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarStart}>
        {search ? (
          <div className={styles.search}>
            <Input
              aria-label="Search table"
              placeholder={search.placeholder ?? "Search"}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              icon={<SearchIcon />}
              size="sm"
              type="search"
              autoComplete="off"
            />
          </div>
        ) : null}
        {filterColumns.length > 0 ? (
          <FiltersDropdown
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            columns={filterColumns}
            filters={filters}
            onApply={onFiltersChange}
            onClearAll={onClearFilters}
            activeCount={activeFilterEntries.length}
          />
        ) : null}
        {toolbarExtra}
      </div>
      <div className={styles.toolbarEnd}>
        {selectionCount ? <span>{selectionCount} selected</span> : null}
        {columnVisibilityEnabled ? (
          <Dropdown
            trigger={
              <IconButton variant="tertiary" size="sm" aria-label="Columns">
                <Columns3Icon />
              </IconButton>
            }
            items={visibilityItems}
          />
        ) : null}
        {showViewToggle && viewMode && onViewModeChange ? (
          <div className={styles.viewToggle} role="group" aria-label="View mode">
            <button
              type="button"
              data-active={viewMode === "list" ? true : undefined}
              aria-pressed={viewMode === "list"}
              aria-label="List view"
              onClick={() => onViewModeChange("list")}
            >
              <TableIcon aria-hidden />
            </button>
            <button
              type="button"
              data-active={viewMode === "grid" ? true : undefined}
              aria-pressed={viewMode === "grid"}
              aria-label="Grid view"
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGridIcon aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
      {activeFilterEntries.length > 0 ? (
        <div className={styles.chips}>
          {activeFilterEntries.map((filterValue) => {
            const column = columns.find((col) => col.key === filterValue.field);
            return (
              <span key={filterValue.field} className={styles.chip}>
                {column ? resolveColumnTitle(column) : filterValue.field}:{" "}
                {formatChipValue(filterValue.value)}
                <button
                  type="button"
                  className={styles.chipButton}
                  aria-label={`Remove ${columnLabelText(column) || filterValue.field} filter`}
                  onClick={() => onFilterChange(filterValue.field, undefined)}
                >
                  <XIcon />
                </button>
              </span>
            );
          })}
          <Button variant="link-gray" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
