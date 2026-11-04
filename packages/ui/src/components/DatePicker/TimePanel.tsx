"use client";

import { useEffect, useRef } from "react";
import { cx } from "../../utils/cx";
import styles from "./DatePicker.module.css";

export type TimePanelProps = {
  value: Date;
  onChange: (next: Date) => void;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
  className?: string;
};

function buildRange(step: number, max: number): number[] {
  const values: number[] = [];
  for (let i = 0; i <= max; i += step) {
    values.push(i);
  }
  return values;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

type ColumnProps = {
  label: string;
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
};

function TimeColumn({ label, values, selected, onSelect }: ColumnProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const node = list.querySelector(`[data-value="${selected}"]`);
    if (!(node instanceof HTMLElement)) return;
    const listRect = list.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const visible =
      nodeRect.top >= listRect.top - 1 && nodeRect.bottom <= listRect.bottom + 1;
    if (!visible) {
      node.scrollIntoView({ block: "nearest" });
    }
  }, [selected]);

  return (
    <div className={styles.timeColumn}>
      <div className={styles.timeColumnHeader}>{label}</div>
      <ul ref={listRef} className={styles.timeColumnList} role="listbox" aria-label={label}>
        {values.map((value) => (
          <li key={value} role="none">
            <button
              type="button"
              role="option"
              aria-selected={value === selected}
              data-value={value}
              className={cx(styles.timeOption, value === selected && styles.timeOptionSelected)}
              onClick={() => onSelect(value)}
            >
              {pad(value)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TimePanel({
  value,
  onChange,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  use12Hours = false,
  className,
}: TimePanelProps) {
  const hours24 = value.getHours();
  const minutes = value.getMinutes();
  const seconds = value.getSeconds();

  const setHours24 = (next: number) => {
    const copy = new Date(value);
    copy.setHours(next);
    onChange(copy);
  };

  const setMinutes = (next: number) => {
    const copy = new Date(value);
    copy.setMinutes(next);
    onChange(copy);
  };

  const setSeconds = (next: number) => {
    const copy = new Date(value);
    copy.setSeconds(next);
    onChange(copy);
  };

  const hourValues = use12Hours
    ? buildRange(hourStep, 12).filter((h) => h >= 1)
    : buildRange(hourStep, 23);

  const displayHour = use12Hours ? ((hours24 % 12) || 12) : hours24;
  const period = hours24 >= 12 ? "PM" : "AM";

  return (
    <div className={cx(styles.timePanel, className)}>
      <div className={styles.timePanelSpacer} aria-hidden="true" />
      <div className={styles.timePanelColumns}>
        <TimeColumn
          label={use12Hours ? "Hour" : "Hours"}
          values={hourValues}
          selected={displayHour}
          onSelect={(h) => {
            if (use12Hours) {
              if (h === 12) setHours24(period === "PM" ? 12 : 0);
              else setHours24(period === "PM" ? h + 12 : h);
            } else {
              setHours24(h);
            }
          }}
        />
        <TimeColumn
          label="Min"
          values={buildRange(minuteStep, 59)}
          selected={minutes}
          onSelect={setMinutes}
        />
        <TimeColumn
          label="Sec"
          values={buildRange(secondStep, 59)}
          selected={seconds}
          onSelect={setSeconds}
        />
        {use12Hours ? (
          <div className={styles.timeColumn}>
            <div className={styles.timeColumnHeader}>AM/PM</div>
            <ul className={styles.timeColumnList} role="listbox" aria-label="AM or PM">
              {(["AM", "PM"] as const).map((item) => (
                <li key={item} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={period === item}
                    className={cx(
                      styles.timeOption,
                      period === item && styles.timeOptionSelected,
                    )}
                    onClick={() => {
                      if (item === "AM" && hours24 >= 12) setHours24(hours24 - 12);
                      if (item === "PM" && hours24 < 12) setHours24(hours24 + 12);
                    }}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
