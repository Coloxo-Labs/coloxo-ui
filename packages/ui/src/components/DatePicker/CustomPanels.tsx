"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";

import { format } from "date-fns";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import { setPickerMonth, setPickerQuarter, setPickerYear } from "./utils";
import styles from "./DatePicker.module.css";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type NavProps = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
};

function PanelNav({ label, onPrev, onNext }: NavProps) {
  return (
    <div className={styles.panelNav}>
      <button type="button" className={styles.navButton} aria-label="Previous" onClick={onPrev}>
        <Icon size="sm">
          <ChevronLeftIcon />
        </Icon>
      </button>
      <span className={styles.panelNavLabel}>{label}</span>
      <button type="button" className={styles.navButton} aria-label="Next" onClick={onNext}>
        <Icon size="sm">
          <ChevronRightIcon />
        </Icon>
      </button>
    </div>
  );
}

export type MonthPanelProps = {
  viewDate: Date;
  selected?: Date;
  onViewChange: (date: Date) => void;
  onSelect: (date: Date) => void;
};

export function MonthPanel({ viewDate, selected, onViewChange, onSelect }: MonthPanelProps) {
  const year = viewDate.getFullYear();

  return (
    <div className={styles.customPanel}>
      <PanelNav
        label={String(year)}
        onPrev={() => onViewChange(setPickerYear(viewDate, year - 1))}
        onNext={() => onViewChange(setPickerYear(viewDate, year + 1))}
      />
      <div className={styles.grid12} role="grid" aria-label={`Months in ${year}`}>
        {MONTHS.map((label, index) => {
          const cellDate = setPickerMonth(viewDate, index);
          const isSelected =
            selected &&
            selected.getFullYear() === cellDate.getFullYear() &&
            selected.getMonth() === cellDate.getMonth();
          return (
            <button
              key={label}
              type="button"
              role="gridcell"
              className={cx(styles.gridCell, isSelected && styles.gridCellSelected)}
              onClick={() => onSelect(cellDate)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type QuarterPanelProps = {
  viewDate: Date;
  selected?: Date;
  onViewChange: (date: Date) => void;
  onSelect: (date: Date) => void;
};

export function QuarterPanel({ viewDate, selected, onViewChange, onSelect }: QuarterPanelProps) {
  const year = viewDate.getFullYear();

  return (
    <div className={styles.customPanel}>
      <PanelNav
        label={String(year)}
        onPrev={() => onViewChange(setPickerYear(viewDate, year - 1))}
        onNext={() => onViewChange(setPickerYear(viewDate, year + 1))}
      />
      <div className={styles.grid4} role="grid" aria-label={`Quarters in ${year}`}>
        {([1, 2, 3, 4] as const).map((quarter) => {
          const cellDate = setPickerQuarter(viewDate, quarter);
          const isSelected =
            selected &&
            selected.getFullYear() === cellDate.getFullYear() &&
            Math.floor(selected.getMonth() / 3) === quarter - 1;
          return (
            <button
              key={quarter}
              type="button"
              role="gridcell"
              className={cx(styles.gridCell, isSelected && styles.gridCellSelected)}
              onClick={() => onSelect(cellDate)}
            >
              Q{quarter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type YearPanelProps = {
  viewDate: Date;
  selected?: Date;
  onViewChange: (date: Date) => void;
  onSelect: (date: Date) => void;
};

export function YearPanel({ viewDate, selected, onViewChange, onSelect }: YearPanelProps) {
  const startDecade = Math.floor(viewDate.getFullYear() / 10) * 10;
  const years = Array.from({ length: 12 }, (_, i) => startDecade - 1 + i);

  return (
    <div className={styles.customPanel}>
      <PanelNav
        label={`${startDecade} – ${startDecade + 9}`}
        onPrev={() => onViewChange(setPickerYear(viewDate, startDecade - 10))}
        onNext={() => onViewChange(setPickerYear(viewDate, startDecade + 10))}
      />
      <div className={styles.grid12} role="grid" aria-label="Years">
        {years.map((year) => {
          const cellDate = setPickerYear(viewDate, year);
          const isSelected = selected && selected.getFullYear() === year;
          const isOutside = year < startDecade || year > startDecade + 9;
          return (
            <button
              key={year}
              type="button"
              role="gridcell"
              className={cx(
                styles.gridCell,
                isSelected && styles.gridCellSelected,
                isOutside && styles.gridCellMuted,
              )}
              onClick={() => onSelect(cellDate)}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type WeekPanelHeaderProps = {
  viewDate: Date;
};

export function weekPanelCaption(viewDate: Date): string {
  return format(viewDate, "MMMM yyyy");
}
