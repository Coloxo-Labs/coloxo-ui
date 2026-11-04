"use client";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, XIcon } from "@/lib/icons";

import { useEffect, useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  addDays,
  addMonths,
  addYears,
  format,
  getISOWeek,
  getISOWeekYear,
  isSameDay,
  isSameMonth,
  setMonth,
  setQuarter,
  setYear,
  startOfISOWeek,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { Button } from "./button";
import { FormField, fieldDescribedBy } from "./form-field";
import { Icon } from "./icon";
import { cx, useControllableState, useId } from "@/lib/utils";

/*
 * Tailwind class map. The picker shell is inlined so this file does not
 * import the CSS-module picker-field package.
 */
const CX: Record<string, string> = {
  cell: "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm text-cx-primary hover:bg-cx-secondary",
  cellMuted: "text-cx-tertiary",
  cellSelected: "bg-cx-brand text-white hover:bg-cx-brand",
  clear: "inline-flex rounded-sm text-cx-tertiary",
  day: "grid grid-cols-7 gap-1",
  header: "flex items-center justify-between gap-2",
  nav: "inline-flex h-8 w-8 items-center justify-center rounded-md text-cx-secondary hover:bg-cx-secondary",
  panel:
    "z-50 w-[18rem] rounded-lg border border-solid border-cx-secondary bg-cx-primary p-3 shadow-lg",
  placeholder: "text-cx-placeholder",
  timeCol: "flex max-h-40 flex-col gap-1 overflow-auto",
  timeOpt: "rounded-md px-2 py-1 text-sm text-cx-secondary hover:bg-cx-secondary",
  timeSelected: "bg-cx-brand text-white hover:bg-cx-brand",
  trigger:
    "inline-flex w-full items-center gap-2 rounded-md border border-solid border-cx-primary bg-cx-primary text-left text-cx-primary shadow-sm outline-none focus-visible:border-cx-brand disabled:cursor-not-allowed disabled:opacity-50",
  weekday: "text-center text-xs font-medium text-cx-tertiary",
};

const SIZE: Record<PickerSize, string> = {
  sm: "min-h-8 px-2.5 text-sm",
  md: "min-h-10 px-3 text-sm",
  lg: "min-h-11 px-3.5 text-base",
};

export type ShowTimeOptions = {
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
};

export type ShowTimeConfig = boolean | ShowTimeOptions;
export type PickerMode = "date" | "week" | "month" | "quarter" | "year";
export type PickerSize = "sm" | "md" | "lg";

export type DateRangeValue = {
  from: Date | undefined;
  to: Date | undefined;
};

export type DisabledDates = Date[] | ((date: Date) => boolean);

export type PickerFieldProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  name?: string;
  placeholder?: string;
  allowClear?: boolean;
  size?: PickerSize;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: DisabledDates;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type DatePickerBaseProps = PickerFieldProps & {
  picker?: PickerMode;
  showTime?: ShowTimeConfig;
};

export type SingleDatePickerProps = DatePickerBaseProps & {
  multiple?: false;
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
};

export type MultipleDatePickerProps = DatePickerBaseProps & {
  multiple: true;
  showTime?: never;
  value?: Date[];
  defaultValue?: Date[];
  onChange?: (dates: Date[]) => void;
};

export type DatePickerProps = SingleDatePickerProps | MultipleDatePickerProps;

export type RangePickerProps = Omit<PickerFieldProps, "placeholder"> & {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  showTime?: ShowTimeConfig;
  placeholder?: [string, string];
  allowEmpty?: [boolean, boolean];
};

export type TimePickerProps = PickerFieldProps & {
  value?: Date;
  defaultValue?: Date;
  onChange?: (time: Date | undefined) => void;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
};

const EMPTY_RANGE: DateRangeValue = { from: undefined, to: undefined };

function usePickerOpen(options: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}): [boolean, (next: boolean) => void] {
  return useControllableState({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });
}

function PickerFieldShell({
  label,
  required,
  optional,
  description,
  error,
  inputId,
  children,
}: {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  inputId: string;
  children: ReactNode;
}) {
  if (!label && !description && !error) return children;
  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      optional={optional}
      description={description}
      error={error}
    >
      {children}
    </FormField>
  );
}

function iconBox(size: PickerSize): "sm" | "md" | "lg" {
  if (size === "sm") return "sm";
  if (size === "lg") return "lg";
  return "md";
}

function isDateDisabled(
  date: Date,
  options: { minDate?: Date; maxDate?: Date; disabledDates?: DisabledDates },
): boolean {
  const { minDate, maxDate, disabledDates } = options;
  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  if (!disabledDates) return false;
  if (typeof disabledDates === "function") return disabledDates(date);
  return disabledDates.some(
    (item) =>
      item.getFullYear() === date.getFullYear() &&
      item.getMonth() === date.getMonth() &&
      item.getDate() === date.getDate(),
  );
}

function normalizeShowTime(showTime?: ShowTimeConfig): ShowTimeOptions | null {
  if (!showTime) return null;
  if (showTime === true) return {};
  return showTime;
}

function getDefaultFormat(picker: PickerMode, showTime: ShowTimeOptions | null): string {
  if (showTime) return showTime.format ?? "PPP HH:mm:ss";
  if (picker === "week") return "week";
  if (picker === "month") return "MMMM yyyy";
  if (picker === "quarter") return "quarter";
  if (picker === "year") return "yyyy";
  return "PPP";
}

function formatWeekLabel(date: Date): string {
  return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`;
}

function formatQuarterLabel(date: Date): string {
  return `${format(date, "yyyy")} Q${Math.floor(date.getMonth() / 3) + 1}`;
}

function formatPickerDisplay(date: Date, displayFormat: string): string {
  if (displayFormat === "week") return formatWeekLabel(date);
  if (displayFormat === "quarter") return formatQuarterLabel(date);
  return format(date, displayFormat);
}

function normalizePickerValue(date: Date, picker: PickerMode): Date {
  if (picker === "week") return startOfISOWeek(date);
  if (picker === "month") return startOfMonth(date);
  if (picker === "quarter") return startOfQuarter(date);
  if (picker === "year") return startOfYear(date);
  return date;
}

function withTime(date: Date, time: Date): Date {
  const next = new Date(date);
  next.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
  return next;
}

function buildRange(step: number, max: number, min = 0): number[] {
  const values: number[] = [];
  for (let i = min; i <= max; i += step) values.push(i);
  return values;
}

function ClearButton({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span
      role="button"
      tabIndex={-1}
      className={CX.clear}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClear();
      }}
    >
      <Icon size="sm">
        <XIcon />
      </Icon>
    </span>
  );
}

function TimeColumns({
  value,
  onChange,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  use12Hours = false,
}: {
  value: Date;
  onChange: (next: Date) => void;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
}) {
  const hours24 = value.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const displayHour = use12Hours ? hours24 % 12 || 12 : hours24;

  const setHours = (next: number) => {
    const copy = new Date(value);
    copy.setHours(next);
    onChange(copy);
  };

  const columns: Array<{
    label: string;
    values: Array<number | string>;
    selected: number | string;
    onSelect: (value: number | string) => void;
  }> = [
    {
      label: use12Hours ? "Hour" : "Hours",
      values: use12Hours ? buildRange(hourStep, 12, 1) : buildRange(hourStep, 23),
      selected: displayHour,
      onSelect: (hour) => {
        const h = Number(hour);
        if (!use12Hours) {
          setHours(h);
          return;
        }
        if (h === 12) setHours(period === "PM" ? 12 : 0);
        else setHours(period === "PM" ? h + 12 : h);
      },
    },
    {
      label: "Min",
      values: buildRange(minuteStep, 59),
      selected: value.getMinutes(),
      onSelect: (minute) => {
        const copy = new Date(value);
        copy.setMinutes(Number(minute));
        onChange(copy);
      },
    },
    {
      label: "Sec",
      values: buildRange(secondStep, 59),
      selected: value.getSeconds(),
      onSelect: (second) => {
        const copy = new Date(value);
        copy.setSeconds(Number(second));
        onChange(copy);
      },
    },
  ];

  if (use12Hours) {
    columns.push({
      label: "AM/PM",
      values: ["AM", "PM"],
      selected: period,
      onSelect: (item) => {
        if (item === "AM" && hours24 >= 12) setHours(hours24 - 12);
        if (item === "PM" && hours24 < 12) setHours(hours24 + 12);
      },
    });
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {columns.map((column) => (
        <div key={column.label}>
          <div className={CX.weekday}>{column.label}</div>
          <div className={CX.timeCol} role="listbox" aria-label={column.label}>
            {column.values.map((item) => (
              <button
                key={String(item)}
                type="button"
                role="option"
                aria-selected={item === column.selected}
                className={cx(CX.timeOpt, item === column.selected && CX.timeSelected)}
                onClick={() => column.onSelect(item)}
              >
                {typeof item === "number" ? String(item).padStart(2, "0") : item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarGrid({
  view,
  picker,
  selected,
  limits,
  onSelect,
}: {
  view: Date;
  picker: PickerMode;
  selected: Date | Date[] | undefined;
  limits: { minDate?: Date; maxDate?: Date; disabledDates?: DisabledDates };
  onSelect: (date: Date) => void;
}) {
  const selectedList = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const isSelected = (date: Date) => {
    if (picker === "week") {
      return selectedList.some(
        (item) =>
          getISOWeek(item) === getISOWeek(date) && getISOWeekYear(item) === getISOWeekYear(date),
      );
    }
    return selectedList.some((item) => isSameDay(item, date));
  };

  if (picker === "month") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, month) => {
          const date = startOfMonth(setMonth(view, month));
          return (
            <button
              key={month}
              type="button"
              className={cx(CX.cell, "w-auto", isSelected(date) && CX.cellSelected)}
              onClick={() => onSelect(date)}
            >
              {format(date, "MMM")}
            </button>
          );
        })}
      </div>
    );
  }

  if (picker === "quarter") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {([1, 2, 3, 4] as const).map((quarter) => {
          const date = startOfQuarter(setQuarter(view, quarter));
          return (
            <button
              key={quarter}
              type="button"
              className={cx(CX.cell, "w-auto", isSelected(date) && CX.cellSelected)}
              onClick={() => onSelect(date)}
            >
              Q{quarter}
            </button>
          );
        })}
      </div>
    );
  }

  if (picker === "year") {
    const start = Math.floor(view.getFullYear() / 12) * 12;
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, index) => {
          const date = startOfYear(setYear(view, start + index));
          return (
            <button
              key={date.getFullYear()}
              type="button"
              className={cx(CX.cell, "w-auto", isSelected(date) && CX.cellSelected)}
              onClick={() => onSelect(date)}
            >
              {format(date, "yyyy")}
            </button>
          );
        })}
      </div>
    );
  }

  const start = startOfWeek(startOfMonth(view), { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, index) => addDays(start, index));
  return (
    <div className={CX.day}>
      {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((label) => (
        <div key={label} className={CX.weekday}>
          {label}
        </div>
      ))}
      {days.map((date) => {
        const disabled = isDateDisabled(date, limits);
        return (
          <button
            key={date.toISOString()}
            type="button"
            disabled={disabled}
            className={cx(
              CX.cell,
              !isSameMonth(date, view) && CX.cellMuted,
              isSelected(date) && CX.cellSelected,
              disabled && "cursor-not-allowed opacity-40",
            )}
            onClick={() => onSelect(picker === "week" ? startOfISOWeek(date) : date)}
          >
            {format(date, "d")}
          </button>
        );
      })}
    </div>
  );
}

function shiftView(view: Date, picker: PickerMode, direction: 1 | -1): Date {
  if (picker === "year") return addYears(view, direction * 12);
  if (picker === "month" || picker === "quarter") return addYears(view, direction);
  return addMonths(view, direction);
}

function viewLabel(view: Date, picker: PickerMode): string {
  if (picker === "year") {
    const start = Math.floor(view.getFullYear() / 12) * 12;
    return `${start} – ${start + 11}`;
  }
  if (picker === "month" || picker === "quarter") return format(view, "yyyy");
  return format(view, "MMMM yyyy");
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
    size = "md",
    format: formatProp,
    open: openProp,
    defaultOpen,
    onOpenChange,
    picker = "date",
  } = props;

  const multiple = props.multiple === true;
  const singleProps = props.multiple === true ? undefined : props;
  const multiProps = props.multiple === true ? props : undefined;
  const showTimeOptions = multiple ? null : normalizeShowTime(props.showTime);
  const displayFormat = formatProp ?? getDefaultFormat(picker, showTimeOptions);
  const inputId = useId(id);
  const describedBy = fieldDescribedBy({ id: inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const [singleSelected, setSingleSelected] = useControllableState<Date | undefined>({
    value: singleProps?.value,
    defaultValue: singleProps?.defaultValue,
    onChange: singleProps?.onChange,
  });
  const [multiSelected, setMultiSelected] = useControllableState<Date[]>({
    value: multiProps?.value,
    defaultValue: multiProps?.defaultValue ?? [],
    onChange: multiProps?.onChange,
  });
  const [draft, setDraft] = useState<Date>(() => singleSelected ?? new Date());
  const [view, setView] = useState<Date>(() => singleSelected ?? multiSelected[0] ?? new Date());

  useEffect(() => {
    if (!open || !showTimeOptions || !singleSelected) return;
    setDraft(singleSelected);
  }, [open, showTimeOptions, singleSelected]);

  const hasValue = multiple ? multiSelected.length > 0 : Boolean(singleSelected);
  const limits = { minDate, maxDate, disabledDates };

  const commitSingle = (date: Date | undefined, close = true) => {
    setSingleSelected(date);
    if (close) setOpen(false);
  };

  const onPick = (date: Date) => {
    const next = normalizePickerValue(date, picker);
    if (multiple) {
      const exists = multiSelected.some((item) => isSameDay(item, next));
      setMultiSelected(
        exists ? multiSelected.filter((item) => !isSameDay(item, next)) : [...multiSelected, next],
      );
      return;
    }
    if (showTimeOptions) {
      setDraft((prev) => withTime(next, prev));
      return;
    }
    commitSingle(next);
  };

  const triggerLabel = multiple
    ? multiSelected.length
      ? multiSelected.map((date) => formatPickerDisplay(date, displayFormat)).join(", ")
      : placeholder
    : singleSelected
      ? formatPickerDisplay(singleSelected, displayFormat)
      : placeholder;

  return (
    <PickerFieldShell
      label={label}
      required={required}
      optional={optional}
      description={description}
      error={error}
      inputId={inputId}
    >
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            id={inputId}
            disabled={disabled}
            className={cx(
              CX.trigger,
              SIZE[size],
              error && "border-cx-error",
              !hasValue && CX.placeholder,
              className,
            )}
            aria-haspopup="dialog"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-expanded={open}
          >
            <Icon size={iconBox(size)}>
              <CalendarIcon />
            </Icon>
            <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
            {allowClear && hasValue && !disabled ? (
              <ClearButton
                label="Clear date"
                onClear={() => {
                  if (multiple) setMultiSelected([]);
                  else commitSingle(undefined, false);
                }}
              />
            ) : null}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={CX.panel} align="start" sideOffset={6}>
            <div className="flex flex-col gap-3">
              <div className={CX.header}>
                <button
                  type="button"
                  className={CX.nav}
                  aria-label="Previous"
                  onClick={() => setView((current) => shiftView(current, picker, -1))}
                >
                  <Icon size="sm">
                    <ChevronLeftIcon />
                  </Icon>
                </button>
                <span className="text-sm font-medium text-cx-primary">
                  {viewLabel(view, picker)}
                </span>
                <button
                  type="button"
                  className={CX.nav}
                  aria-label="Next"
                  onClick={() => setView((current) => shiftView(current, picker, 1))}
                >
                  <Icon size="sm">
                    <ChevronRightIcon />
                  </Icon>
                </button>
              </div>
              <CalendarGrid
                view={view}
                picker={picker}
                selected={multiple ? multiSelected : showTimeOptions ? draft : singleSelected}
                limits={limits}
                onSelect={onPick}
              />
              {showTimeOptions ? (
                <>
                  <TimeColumns
                    value={draft}
                    onChange={setDraft}
                    hourStep={showTimeOptions.hourStep}
                    minuteStep={showTimeOptions.minuteStep}
                    secondStep={showTimeOptions.secondStep}
                    use12Hours={showTimeOptions.use12Hours}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setDraft(new Date())}
                    >
                      Now
                    </Button>
                    <Button type="button" size="sm" onClick={() => commitSingle(draft)}>
                      OK
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
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
    </PickerFieldShell>
  );
}

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
  size = "md",
  format: formatProp,
  open: openProp,
  defaultOpen,
  onOpenChange,
  showTime,
  allowEmpty = [true, true],
}: RangePickerProps) {
  const showTimeOptions = normalizeShowTime(showTime);
  const displayFormat = formatProp ?? getDefaultFormat("date", showTimeOptions);
  const inputId = useId(id);
  const describedBy = fieldDescribedBy({ id: inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const [range, setRange] = useControllableState<DateRangeValue>({
    value,
    defaultValue: defaultValue ?? EMPTY_RANGE,
    onChange,
  });
  const [draft, setDraft] = useState<DateRangeValue>(() => range);
  const [view, setView] = useState<Date>(() => range.from ?? new Date());

  useEffect(() => {
    if (open && showTimeOptions) setDraft(range);
  }, [open, showTimeOptions, range]);

  const shown = showTimeOptions ? draft : range;
  const hasValue = Boolean(range.from || range.to);
  const side = (date: Date | undefined, index: 0 | 1) =>
    date ? formatPickerDisplay(date, displayFormat) : placeholder[index];

  const commit = (next: DateRangeValue, close = true) => {
    setRange(next);
    if (close) setOpen(false);
  };

  const onPick = (date: Date) => {
    const base = showTimeOptions ? draft : range;
    let next: DateRangeValue;
    if (!base.from || (base.from && base.to)) next = { from: date, to: undefined };
    else next = date < base.from ? { from: date, to: base.from } : { from: base.from, to: date };
    if (showTimeOptions) {
      setDraft(next);
      return;
    }
    commit(next, Boolean(next.from && next.to));
  };

  return (
    <PickerFieldShell
      label={label}
      required={required}
      optional={optional}
      description={description}
      error={error}
      inputId={inputId}
    >
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div
            className={cx(
              CX.trigger,
              SIZE[size],
              error && "border-cx-error",
              disabled && "opacity-50",
              className,
            )}
          >
            <Icon size={iconBox(size)}>
              <CalendarIcon />
            </Icon>
            <button
              type="button"
              id={inputId}
              disabled={disabled}
              className={cx(
                "min-w-0 flex-1 bg-transparent text-left",
                !range.from && !allowEmpty[0] && CX.placeholder,
              )}
              aria-haspopup="dialog"
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              onClick={() => setOpen(true)}
            >
              {side(range.from, 0)}
            </button>
            <span aria-hidden className="text-cx-tertiary">
              →
            </span>
            <button
              type="button"
              disabled={disabled}
              className={cx(
                "min-w-0 flex-1 bg-transparent text-left",
                !range.to && !allowEmpty[1] && CX.placeholder,
              )}
              onClick={() => setOpen(true)}
            >
              {side(range.to, 1)}
            </button>
            {allowClear && hasValue && !disabled ? (
              <ClearButton label="Clear range" onClear={() => commit(EMPTY_RANGE, false)} />
            ) : null}
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content className={CX.panel} align="start" sideOffset={6}>
            <div className="flex flex-col gap-3">
              <div className={CX.header}>
                <button
                  type="button"
                  className={CX.nav}
                  aria-label="Previous"
                  onClick={() => setView((current) => addMonths(current, -1))}
                >
                  <Icon size="sm">
                    <ChevronLeftIcon />
                  </Icon>
                </button>
                <span className="text-sm font-medium text-cx-primary">
                  {format(view, "MMMM yyyy")}
                </span>
                <button
                  type="button"
                  className={CX.nav}
                  aria-label="Next"
                  onClick={() => setView((current) => addMonths(current, 1))}
                >
                  <Icon size="sm">
                    <ChevronRightIcon />
                  </Icon>
                </button>
              </div>
              <CalendarGrid
                view={view}
                picker="date"
                selected={shown.from && shown.to ? [shown.from, shown.to] : shown.from}
                limits={{ minDate, maxDate, disabledDates }}
                onSelect={onPick}
              />
              {showTimeOptions ? (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (draft.from && draft.to)
                        commit({
                          from: withTime(draft.from, draft.from),
                          to: withTime(draft.to, draft.to),
                        });
                    }}
                  >
                    OK
                  </Button>
                </div>
              ) : null}
            </div>
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
    </PickerFieldShell>
  );
}

function baseTimeDate(): Date {
  const date = new Date();
  date.setFullYear(1970, 0, 1);
  return date;
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
  size = "md",
  format: formatProp = "HH:mm:ss",
  open: openProp,
  defaultOpen,
  onOpenChange,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  use12Hours = false,
}: TimePickerProps) {
  const inputId = useId(id);
  const describedBy = fieldDescribedBy({ id: inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const [selected, setSelected] = useControllableState<Date | undefined>({
    value,
    defaultValue,
    onChange,
  });
  const [draft, setDraft] = useState<Date>(() => selected ?? baseTimeDate());

  useEffect(() => {
    if (open) setDraft(selected ?? baseTimeDate());
  }, [open, selected]);

  return (
    <PickerFieldShell
      label={label}
      required={required}
      optional={optional}
      description={description}
      error={error}
      inputId={inputId}
    >
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            id={inputId}
            disabled={disabled}
            className={cx(
              CX.trigger,
              SIZE[size],
              error && "border-cx-error",
              !selected && CX.placeholder,
              className,
            )}
            aria-haspopup="dialog"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-expanded={open}
          >
            <Icon size={iconBox(size)}>
              <ClockIcon />
            </Icon>
            <span className="min-w-0 flex-1 truncate">
              {selected ? format(selected, formatProp) : placeholder}
            </span>
            {allowClear && selected && !disabled ? (
              <ClearButton label="Clear time" onClear={() => setSelected(undefined)} />
            ) : null}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={CX.panel} align="start" sideOffset={6}>
            <div className="flex flex-col gap-3">
              <TimeColumns
                value={draft}
                onChange={setDraft}
                hourStep={hourStep}
                minuteStep={minuteStep}
                secondStep={secondStep}
                use12Hours={use12Hours}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setDraft(new Date())}
                >
                  Now
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSelected(draft);
                    setOpen(false);
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
        {name ? (
          <input type="hidden" name={name} value={selected ? format(selected, formatProp) : ""} />
        ) : null}
      </Popover.Root>
    </PickerFieldShell>
  );
}
