import {
  endOfISOWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  setHours,
  setMilliseconds,
  setMinutes,
  setMonth,
  setQuarter,
  setSeconds,
  setYear,
  startOfISOWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";
import type { DisabledDates, PickerMode, ShowTimeConfig, ShowTimeOptions } from "./types";

export function isDateDisabled(
  date: Date,
  options: {
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: DisabledDates;
  },
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

const DEFAULT_SHOW_TIME: ShowTimeOptions = {};

export function normalizeShowTime(showTime?: ShowTimeConfig): ShowTimeOptions | null {
  if (!showTime) return null;
  if (showTime === true) return DEFAULT_SHOW_TIME;
  return showTime;
}

export function getDefaultFormat(picker: PickerMode, showTime: ShowTimeOptions | null): string {
  if (showTime) {
    return showTime.format ?? "PPP HH:mm:ss";
  }
  switch (picker) {
    case "week":
      return "week";
    case "month":
      return "MMMM yyyy";
    case "quarter":
      return "quarter";
    case "year":
      return "yyyy";
    default:
      return "PPP";
  }
}

export function formatWeekLabel(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function formatQuarterLabel(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${format(date, "yyyy")} Q${quarter}`;
}

export function formatPickerDisplay(date: Date, displayFormat: string): string {
  if (displayFormat === "week") return formatWeekLabel(date);
  if (displayFormat === "quarter") return formatQuarterLabel(date);
  return format(date, displayFormat);
}

export function normalizePickerValue(date: Date, picker: PickerMode): Date {
  switch (picker) {
    case "week":
      return startOfISOWeek(date);
    case "month":
      return startOfMonth(date);
    case "quarter":
      return startOfQuarter(date);
    case "year":
      return startOfYear(date);
    default:
      return date;
  }
}

export function mergeDateAndTime(date: Date, time: Date): Date {
  let next = setHours(date, time.getHours());
  next = setMinutes(next, time.getMinutes());
  next = setSeconds(next, time.getSeconds());
  return setMilliseconds(next, 0);
}

export function applyTimeParts(
  base: Date,
  parts: { hours: number; minutes: number; seconds: number },
): Date {
  let next = setHours(base, parts.hours);
  next = setMinutes(next, parts.minutes);
  next = setSeconds(next, parts.seconds);
  return setMilliseconds(next, 0);
}

export function getTimeParts(date: Date): { hours: number; minutes: number; seconds: number } {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

export function setPickerMonth(date: Date, monthIndex: number): Date {
  return startOfMonth(setMonth(date, monthIndex));
}

export function setPickerYear(date: Date, year: number): Date {
  return startOfYear(setYear(date, year));
}

export function setPickerQuarter(date: Date, quarter: 1 | 2 | 3 | 4): Date {
  return startOfQuarter(setQuarter(date, quarter));
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameISOWeek(a: Date, b: Date): boolean {
  return getISOWeekYear(a) === getISOWeekYear(b) && getISOWeek(a) === getISOWeek(b);
}

export function getISOWeekRange(date: Date): { from: Date; to: Date } {
  return { from: startOfISOWeek(date), to: endOfISOWeek(date) };
}

export function rangeToTuple(range: {
  from?: Date;
  to?: Date;
}): [Date | undefined, Date | undefined] {
  return [range.from, range.to];
}

export function tupleToRange(tuple: [Date | undefined, Date | undefined]): {
  from: Date | undefined;
  to: Date | undefined;
} {
  return { from: tuple[0], to: tuple[1] };
}
