"use client";

import { addMonths } from "date-fns";
import { useEffect, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { MonthPanel, QuarterPanel, YearPanel } from "./CustomPanels";
import { TimePanel } from "./TimePanel";
import { PickerFooter } from "./PickerFooter";
import { isDateDisabled, mergeDateAndTime, normalizePickerValue, normalizeShowTime } from "./utils";
import type { DisabledDates, PickerMode, ShowTimeConfig } from "./types";
import { cx } from "../../utils/cx";
import styles from "./DatePicker.module.css";

type BaseCalendarProps = {
  picker?: PickerMode;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: DisabledDates;
  className?: string;
  showTime?: ShowTimeConfig;
  onCommit?: () => void;
};

export type SingleCalendarPanelProps = BaseCalendarProps & {
  mode: "single";
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  closeOnSelect?: boolean;
};

export type MultipleCalendarPanelProps = BaseCalendarProps & {
  mode: "multiple";
  selected?: Date[];
  onSelect: (dates: Date[]) => void;
};

export type RangeCalendarPanelProps = BaseCalendarProps & {
  mode: "range";
  selected?: DateRange;
  onSelect: (range: DateRange | undefined) => void;
  closeOnSelect?: boolean;
};

export type CalendarPanelProps =
  SingleCalendarPanelProps | MultipleCalendarPanelProps | RangeCalendarPanelProps;

function disabledMatcher(minDate?: Date, maxDate?: Date, disabledDates?: DisabledDates) {
  return (date: Date) => isDateDisabled(date, { minDate, maxDate, disabledDates });
}

export function CalendarPanel(props: CalendarPanelProps) {
  const { picker = "date", minDate, maxDate, disabledDates, className, showTime } = props;

  const showTimeOptions = normalizeShowTime(showTime);
  const needsFooter = Boolean(showTimeOptions);

  const anchor =
    props.mode === "single"
      ? props.selected
      : props.mode === "range"
        ? props.selected?.from
        : props.selected?.[0];

  const [viewDate, setViewDate] = useState(anchor ?? new Date());
  const [pendingTime, setPendingTime] = useState(anchor ?? new Date());
  const [rangeStartMonth, setRangeStartMonth] = useState(() => anchor ?? new Date());
  const [rangeEndMonth, setRangeEndMonth] = useState(() => addMonths(anchor ?? new Date(), 1));

  useEffect(() => {
    if (!anchor) return;
    setPendingTime((prev) =>
      prev.getTime() === anchor.getTime() ? prev : new Date(anchor.getTime()),
    );
  }, [anchor?.getTime()]);

  const dayPickerDisabled = disabledMatcher(minDate, maxDate, disabledDates);

  const finishSingle = (date: Date | undefined) => {
    if (props.mode !== "single") return;
    props.onSelect(date);
    if (!showTimeOptions && props.closeOnSelect !== false) {
      props.onCommit?.();
    }
  };

  const renderDayPicker = (mode: "single" | "multiple" | "range") => {
    const common = {
      disabled: dayPickerDisabled,
      className: cx(styles.calendar, className),
      showWeekNumber: picker === "week",
      fixedWeeks: true as const,
    };

    if (mode === "single") {
      const { selected, onSelect } = props as SingleCalendarPanelProps;
      return (
        <DayPicker
          {...common}
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onSelect(undefined);
              return;
            }
            const normalized = normalizePickerValue(date, picker);
            if (showTimeOptions) {
              const merged = mergeDateAndTime(normalized, pendingTime);
              setPendingTime(merged);
              onSelect(merged);
              return;
            }
            finishSingle(normalized);
          }}
        />
      );
    }

    if (mode === "multiple") {
      const { selected, onSelect } = props as MultipleCalendarPanelProps;
      return (
        <DayPicker
          {...common}
          mode="multiple"
          selected={selected}
          onSelect={(dates) => onSelect(dates ?? [])}
        />
      );
    }

    const { selected, onSelect, closeOnSelect } = props as RangeCalendarPanelProps;

    const applyRangeSelect = (range: DateRange | undefined) => {
      if (!range) {
        onSelect(undefined);
        return;
      }
      const timeFrom = selected?.from ?? pendingTime;
      const timeTo = selected?.to ?? selected?.from ?? pendingTime;
      const next: DateRange = {
        from: range.from
          ? mergeDateAndTime(normalizePickerValue(range.from, picker), timeFrom)
          : undefined,
        to: range.to ? mergeDateAndTime(normalizePickerValue(range.to, picker), timeTo) : undefined,
      };
      onSelect(next);
      if (!showTimeOptions && closeOnSelect !== false && next.from && next.to) {
        props.onCommit?.();
      }
    };

    if (showTimeOptions) {
      const handleStartMonthChange = (month: Date) => {
        setRangeStartMonth(month);
        setRangeEndMonth(addMonths(month, 1));
      };

      const rangeCalendar = (month: Date, onMonthChange: (month: Date) => void) => (
        <DayPicker
          {...common}
          mode="range"
          numberOfMonths={1}
          month={month}
          onMonthChange={onMonthChange}
          selected={selected}
          onSelect={applyRangeSelect}
        />
      );

      return (
        <div className={styles.rangeWithTime}>
          <div className={styles.rangeSide}>
            {rangeCalendar(rangeStartMonth, handleStartMonthChange)}
            <TimePanel
              value={selected?.from ?? pendingTime}
              onChange={(next) => {
                const fromDay = selected?.from ?? new Date();
                onSelect({
                  from: mergeDateAndTime(fromDay, next),
                  to: selected?.to,
                });
              }}
              hourStep={showTimeOptions.hourStep}
              minuteStep={showTimeOptions.minuteStep}
              secondStep={showTimeOptions.secondStep}
              use12Hours={showTimeOptions.use12Hours}
            />
          </div>
          <div className={styles.rangeSide}>
            {rangeCalendar(rangeEndMonth, setRangeEndMonth)}
            <TimePanel
              value={selected?.to ?? selected?.from ?? pendingTime}
              onChange={(next) => {
                const toDay = selected?.to ?? selected?.from ?? new Date();
                onSelect({
                  from: selected?.from,
                  to: mergeDateAndTime(toDay, next),
                });
              }}
              hourStep={showTimeOptions.hourStep}
              minuteStep={showTimeOptions.minuteStep}
              secondStep={showTimeOptions.secondStep}
              use12Hours={showTimeOptions.use12Hours}
            />
          </div>
        </div>
      );
    }

    return (
      <DayPicker
        {...common}
        mode="range"
        numberOfMonths={2}
        selected={selected}
        onSelect={(range) => {
          if (!range) {
            onSelect(undefined);
            return;
          }
          const next: DateRange = {
            from: range.from ? normalizePickerValue(range.from, picker) : undefined,
            to: range.to ? normalizePickerValue(range.to, picker) : undefined,
          };
          onSelect(next);
          if (closeOnSelect !== false && next.from && next.to) {
            props.onCommit?.();
          }
        }}
      />
    );
  };

  const renderCustomPicker = () => {
    if (props.mode !== "single") return null;
    const { selected, onSelect } = props;

    const handleSelect = (date: Date) => {
      onSelect(date);
      if (!showTimeOptions) props.onCommit?.();
    };

    if (picker === "month") {
      return (
        <MonthPanel
          viewDate={viewDate}
          selected={selected}
          onViewChange={setViewDate}
          onSelect={handleSelect}
        />
      );
    }
    if (picker === "quarter") {
      return (
        <QuarterPanel
          viewDate={viewDate}
          selected={selected}
          onViewChange={setViewDate}
          onSelect={handleSelect}
        />
      );
    }
    if (picker === "year") {
      return (
        <YearPanel
          viewDate={viewDate}
          selected={selected}
          onViewChange={setViewDate}
          onSelect={handleSelect}
        />
      );
    }
    return null;
  };

  const showDayPicker =
    picker === "date" || picker === "week" || props.mode === "multiple" || props.mode === "range";

  return (
    <div className={styles.panelBody}>
      <div
        className={cx(
          showTimeOptions && (props.mode !== "range" ? styles.panelWithTime : undefined),
        )}
      >
        {showDayPicker ? renderDayPicker(props.mode) : renderCustomPicker()}
        {showTimeOptions && props.mode === "single" ? (
          <TimePanel
            value={pendingTime}
            onChange={(next) => {
              setPendingTime(next);
              props.onSelect(next);
            }}
            hourStep={showTimeOptions.hourStep}
            minuteStep={showTimeOptions.minuteStep}
            secondStep={showTimeOptions.secondStep}
            use12Hours={showTimeOptions.use12Hours}
          />
        ) : null}
      </div>
      {needsFooter ? (
        <PickerFooter
          onNow={() => {
            const now = new Date();
            setPendingTime(now);
            if (props.mode === "single") {
              props.onSelect(now);
              return;
            }
            if (props.mode === "range") {
              const from = props.selected?.from ?? now;
              const to = props.selected?.to ?? now;
              props.onSelect({
                from: mergeDateAndTime(from, now),
                to: mergeDateAndTime(to, now),
              });
            }
          }}
          onOk={() => props.onCommit?.()}
        />
      ) : null}
    </div>
  );
}
