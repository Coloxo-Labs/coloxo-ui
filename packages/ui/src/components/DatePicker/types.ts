import type { ReactNode } from "react";

export type ShowTimeOptions = {
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
};

export type ShowTimeConfig = boolean | ShowTimeOptions;

export type PickerMode = "date" | "week" | "month" | "quarter" | "year";

/** Trigger size; matches Input / Select (`sm` | `md` | `lg`). */
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
  /** Trigger height/typography; default `md`. Calendar popup density is fixed. */
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
