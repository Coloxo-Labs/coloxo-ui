"use client";
import { CalendarIcon } from "../../icons";

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Icon } from "../Icon/Icon";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import control from "../_internal/Control.module.css";
import {
  DEFAULT_CONTROL_SIZE,
  getControlIconSize,
  getControlSizeClass,
} from "../_internal/controlSize";
import { CalendarPanel } from "./CalendarPanel";
import { ClearControl } from "./ClearControl";
import { PickerFieldShell, usePickerAria, usePickerFieldIds, usePickerOpen } from "../_internal/picker";
import {
  formatPickerDisplay,
  getDefaultFormat,
  mergeDateAndTime,
  normalizeShowTime,
  tupleToRange,
} from "./utils";
import type { DateRangeValue, RangePickerProps } from "./types";
import styles from "./DatePicker.module.css";

const EMPTY_RANGE: DateRangeValue = { from: undefined, to: undefined };

export function RangePicker({
  label,
  required,
  optional,
  description,
  error,
  placeholder = ["Start date", "End date"],
  value,
  defaultValue,
  onChange,
  disabled,
  id,
  className,
  name,
  minDate,
  maxDate,
  disabledDates,
  allowClear = true,
  size = DEFAULT_CONTROL_SIZE,
  format: formatProp,
  open: openProp,
  defaultOpen,
  onOpenChange,
  showTime,
  allowEmpty = [true, true],
}: RangePickerProps) {
  const showTimeOptions = normalizeShowTime(showTime);
  const displayFormat = formatProp ?? getDefaultFormat("date", showTimeOptions);
  const iconSize = getControlIconSize(size);
  const sizeClass = getControlSizeClass(size);

  const { inputId } = usePickerFieldIds(id);
  const describedBy = usePickerAria({ inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });

  const [range, setRange] = useControllableState<DateRangeValue>({
    value,
    defaultValue: defaultValue ?? EMPTY_RANGE,
    onChange,
  });

  const [draft, setDraft] = useState<DateRange>(() => ({
    from: range.from,
    to: range.to,
  }));

  useEffect(() => {
    if (open && showTimeOptions) {
      setDraft({ from: range.from, to: range.to });
    }
  }, [open, showTimeOptions, range.from, range.to]);

  const hasValue = Boolean(range.from || range.to);

  const formatSide = (date: Date | undefined, side: 0 | 1) => {
    if (date) return formatPickerDisplay(date, displayFormat);
    return placeholder[side];
  };

  const commit = (next: DateRangeValue, close = true) => {
    setRange(next);
    if (close) setOpen(false);
  };

  const selectedRange: DateRange = {
    from: showTimeOptions ? draft.from : range.from,
    to: showTimeOptions ? draft.to : range.to,
  };

  const controlNode = (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          data-size={size}
          className={cx(
            control.surface,
            sizeClass,
            styles.rangeRoot,
            error && control.invalid,
            disabled && styles.rangeDisabled,
            className,
          )}
        >
          <Icon size={iconSize}>
            <CalendarIcon />
          </Icon>
          <button
            type="button"
            id={inputId}
            disabled={disabled}
            className={styles.rangeInput}
            aria-haspopup="dialog"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onClick={() => setOpen(true)}
          >
            <span className={cx(!range.from && !allowEmpty[0] && styles.placeholder)}>
              {formatSide(range.from, 0)}
            </span>
          </button>
          <span className={styles.rangeSeparator} aria-hidden>
            →
          </span>
          <button
            type="button"
            disabled={disabled}
            className={styles.rangeInput}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <span className={cx(!range.to && !allowEmpty[1] && styles.placeholder)}>
              {formatSide(range.to, 1)}
            </span>
          </button>
          <ClearControl
            visible={allowClear && hasValue && !disabled}
            size={size}
            label="Clear range"
            onClear={() => commit(EMPTY_RANGE, false)}
          />
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className={styles.panel}
          align="start"
          sideOffset={6}
          collisionPadding={12}
          avoidCollisions
        >
          <CalendarPanel
            mode="range"
            selected={selectedRange}
            showTime={showTimeOptions ?? undefined}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            closeOnSelect={!showTimeOptions}
            onSelect={(next) => {
              if (!next) {
                commit(EMPTY_RANGE, false);
                return;
              }
              const mapped = tupleToRange([next.from, next.to]);
              if (showTimeOptions) {
                setDraft({ from: mapped.from, to: mapped.to });
                return;
              }
              commit(mapped, Boolean(mapped.from && mapped.to));
            }}
            onCommit={() => {
              if (showTimeOptions) {
                const from = draft.from;
                const to = draft.to;
                if (from && to) {
                  commit(
                    {
                      from: mergeDateAndTime(from, from),
                      to: mergeDateAndTime(to, to),
                    },
                    true,
                  );
                }
                return;
              }
              commit(range, true);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
      {name ? (
        <>
          <input
            type="hidden"
            name={`${name}_start`}
            value={range.from ? format(range.from, "yyyy-MM-dd") : ""}
          />
          <input
            type="hidden"
            name={`${name}_end`}
            value={range.to ? format(range.to, "yyyy-MM-dd") : ""}
          />
        </>
      ) : null}
    </Popover.Root>
  );

  return (
    <PickerFieldShell
      label={label}
      required={required}
      optional={optional}
      description={description}
      error={error}
      inputId={inputId}
    >
      {controlNode}
    </PickerFieldShell>
  );
}
