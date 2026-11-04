"use client";
import { ClockIcon } from "../../icons";

import { useEffect, useState } from "react";
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
import { ClearControl } from "./ClearControl";
import {
  PickerFieldShell,
  usePickerAria,
  usePickerFieldIds,
  usePickerOpen,
} from "../_internal/picker";
import { TimePanel } from "./TimePanel";
import { PickerFooter } from "./PickerFooter";
import type { TimePickerProps } from "./types";
import styles from "./DatePicker.module.css";

function baseTimeDate(): Date {
  const d = new Date();
  d.setFullYear(1970, 0, 1);
  return d;
}

export function TimePicker({
  label,
  required,
  optional,
  description,
  error,
  placeholder = "Select time",
  value,
  defaultValue,
  onChange,
  disabled,
  id,
  className,
  name,
  allowClear = true,
  size = DEFAULT_CONTROL_SIZE,
  format: formatProp = "HH:mm:ss",
  open: openProp,
  defaultOpen,
  onOpenChange,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  use12Hours = false,
}: TimePickerProps) {
  const { inputId } = usePickerFieldIds(id);
  const describedBy = usePickerAria({ inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const iconSize = getControlIconSize(size);
  const sizeClass = getControlSizeClass(size);

  const [selected, setSelected] = useControllableState<Date | undefined>({
    value,
    defaultValue,
    onChange,
  });

  const [draft, setDraft] = useState<Date>(() => selected ?? baseTimeDate());

  useEffect(() => {
    if (open) setDraft(selected ?? baseTimeDate());
  }, [open, selected]);

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
            error && control.invalid,
            className,
          )}
          aria-haspopup="dialog"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        >
          <Icon size={iconSize}>
            <ClockIcon />
          </Icon>
          <span className={cx(!selected && styles.placeholder)}>
            {selected ? format(selected, formatProp) : placeholder}
          </span>
          <ClearControl
            visible={allowClear && Boolean(selected) && !disabled}
            size={size}
            label="Clear time"
            onClear={() => setSelected(undefined)}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.panel} align="start" sideOffset={6}>
          <div className={styles.panelBody}>
            <TimePanel
              value={draft}
              onChange={setDraft}
              hourStep={hourStep}
              minuteStep={minuteStep}
              secondStep={secondStep}
              use12Hours={use12Hours}
            />
            <PickerFooter
              onNow={() => setDraft(new Date())}
              onOk={() => {
                setSelected(draft);
                setOpen(false);
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
      {name ? (
        <input type="hidden" name={name} value={selected ? format(selected, formatProp) : ""} />
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
