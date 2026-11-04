"use client";
import { CalendarIcon } from "../../icons";

import { useEffect, useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
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
import {
  PickerFieldShell,
  usePickerAria,
  usePickerFieldIds,
  usePickerOpen,
} from "../_internal/picker";
import {
  formatPickerDisplay,
  getDefaultFormat,
  normalizePickerValue,
  normalizeShowTime,
} from "./utils";
import type { DatePickerProps } from "./types";
import styles from "./DatePicker.module.css";

function DateChip({ date, displayFormat }: { date: Date; displayFormat: string }) {
  return <span className={styles.chip}>{formatPickerDisplay(date, displayFormat)}</span>;
}

export function DatePicker(props: DatePickerProps) {
  const {
    label,
    required,
    optional,
    description,
    error,
    placeholder = "Select date",
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
    picker = "date",
    showTime,
  } = props;

  const multiple = props.multiple === true;
  const showTimeOptions = multiple ? null : normalizeShowTime(showTime);
  const displayFormat = formatProp ?? getDefaultFormat(picker, showTimeOptions);
  const iconSize = getControlIconSize(size);
  const sizeClass = getControlSizeClass(size);

  const { inputId } = usePickerFieldIds(id);
  const describedBy = usePickerAria({ inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });

  const [singleSelected, setSingleSelected] = useControllableState<Date | undefined>({
    value: multiple ? undefined : props.value,
    defaultValue: multiple ? undefined : props.defaultValue,
    onChange: multiple ? undefined : props.onChange,
  });

  const [multiSelected, setMultiSelected] = useControllableState<Date[]>({
    value: multiple ? props.value : undefined,
    defaultValue: multiple ? (props.defaultValue ?? []) : [],
    onChange: multiple ? props.onChange : undefined,
  });

  const [draft, setDraft] = useState<Date>(() => singleSelected ?? new Date());

  useEffect(() => {
    if (!open || !showTimeOptions) return;
    if (singleSelected) {
      setDraft(singleSelected);
    }
  }, [open, showTimeOptions, singleSelected]);

  const commitSingle = (date: Date | undefined, close = true) => {
    setSingleSelected(date);
    if (close) setOpen(false);
  };

  const triggerLabel = (): ReactNode => {
    if (multiple) {
      if (!multiSelected.length) {
        return <span className={styles.placeholder}>{placeholder}</span>;
      }
      return (
        <span className={styles.chipRow}>
          {multiSelected.map((date) => (
            <DateChip key={date.toISOString()} date={date} displayFormat={displayFormat} />
          ))}
        </span>
      );
    }

    if (!singleSelected) {
      return <span className={styles.placeholder}>{placeholder}</span>;
    }
    return formatPickerDisplay(singleSelected, displayFormat);
  };

  const hasValue = multiple ? multiSelected.length > 0 : Boolean(singleSelected);

  const controlNode = (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={inputId}
          disabled={disabled}
          data-size={size}
          className={cx(
            control.surface,
            sizeClass,
            styles.trigger,
            multiple && styles.triggerMultiple,
            error && control.invalid,
            className,
          )}
          aria-haspopup="dialog"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        >
          <Icon size={iconSize}>
            <CalendarIcon />
          </Icon>
          <span className={cx(!hasValue && styles.placeholder)}>{triggerLabel()}</span>
          <ClearControl
            visible={allowClear && hasValue && !disabled}
            size={size}
            label="Clear date"
            onClear={() => {
              if (multiple) setMultiSelected([]);
              else commitSingle(undefined, false);
            }}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.panel}
          align="start"
          sideOffset={6}
          collisionPadding={12}
          avoidCollisions
        >
          {multiple ? (
            <CalendarPanel
              mode="multiple"
              selected={multiSelected}
              onSelect={setMultiSelected}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              picker={picker}
            />
          ) : (
            <CalendarPanel
              mode="single"
              picker={picker}
              selected={showTimeOptions ? draft : singleSelected}
              showTime={showTimeOptions ?? undefined}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
              closeOnSelect={!showTimeOptions}
              onSelect={(date) => {
                if (!date) {
                  commitSingle(undefined);
                  return;
                }
                if (showTimeOptions) {
                  setDraft((prev) => (prev.getTime() === date.getTime() ? prev : date));
                  return;
                }
                commitSingle(normalizePickerValue(date, picker));
              }}
              onCommit={() => {
                if (showTimeOptions) {
                  commitSingle(draft);
                }
              }}
            />
          )}
        </Popover.Content>
      </Popover.Portal>
      {name && !multiple ? (
        <input
          type="hidden"
          name={name}
          value={singleSelected ? format(singleSelected, "yyyy-MM-dd") : ""}
        />
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
