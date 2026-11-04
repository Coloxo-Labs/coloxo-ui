"use client";
import { ChevronDownIcon, CheckIcon, XIcon } from "../../icons";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import * as RxSelect from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import { FormField, fieldDescribedBy } from "../FormField/FormField";
import { Icon } from "../Icon/Icon";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import control from "../_internal/Control.module.css";
import styles from "./Select.module.css";

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type SelectSize = "sm" | "md" | "lg";

export type SelectProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  size?: SelectSize;
  clearable?: boolean;
  searchable?: boolean;
  /** Accessible name when no visible `label` (compact toolbars). */
  "aria-label"?: string;
};

function optionText(label: ReactNode): string {
  return typeof label === "string" ? label : "";
}

export function Select({
  label,
  required,
  optional,
  description,
  error,
  placeholder = "Select…",
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
  disabled,
  name,
  id,
  className,
  size = "md",
  clearable,
  searchable,
  "aria-label": ariaLabel,
}: SelectProps) {
  const selectId = useId(id);
  const describedBy = fieldDescribedBy({ id: selectId, description, error });
  const handleChange = (next: string) => {
    onValueChange?.(next);
    onChange?.(next);
  };

  const trigger = searchable ? (
    <SearchableSelect
      selectId={selectId}
      describedBy={describedBy}
      required={required}
      error={Boolean(error)}
      placeholder={placeholder}
      options={options}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={disabled}
      name={name}
      className={className}
      size={size}
      clearable={clearable}
      ariaLabel={ariaLabel}
    />
  ) : (
    <RxSelect.Root
      value={value || undefined}
      defaultValue={defaultValue}
      onValueChange={handleChange}
      disabled={disabled}
      name={name}
    >
      <RxSelect.Trigger
        id={selectId}
        className={cx(
          control.surface,
          control[size],
          styles.trigger,
          error && control.invalid,
          className,
        )}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
      >
        <RxSelect.Value placeholder={placeholder} />
        <span className={styles.actions}>
          {clearable && value ? (
            <span
              role="button"
              tabIndex={-1}
              className={styles.clear}
              aria-label="Clear selection"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleChange("");
              }}
            >
              <Icon size="sm">
                <XIcon />
              </Icon>
            </span>
          ) : null}
          <RxSelect.Icon className={styles.chevron}>
            <Icon size="md">
              <ChevronDownIcon />
            </Icon>
          </RxSelect.Icon>
        </span>
      </RxSelect.Trigger>
      <RxSelect.Portal>
        <RxSelect.Content className={styles.content} position="popper" sideOffset={4}>
          <RxSelect.Viewport className={styles.viewport}>
            {options.map((option) => (
              <RxSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={styles.item}
              >
                <RxSelect.ItemText>{option.label}</RxSelect.ItemText>
                <RxSelect.ItemIndicator className={styles.check}>
                  <Icon size="sm">
                    <CheckIcon />
                  </Icon>
                </RxSelect.ItemIndicator>
              </RxSelect.Item>
            ))}
          </RxSelect.Viewport>
        </RxSelect.Content>
      </RxSelect.Portal>
    </RxSelect.Root>
  );

  if (!label && !description && !error) return trigger;

  return (
    <FormField
      label={label}
      htmlFor={selectId}
      required={required}
      optional={optional}
      description={description}
      error={error}
    >
      {trigger}
    </FormField>
  );
}

function SearchableSelect({
  selectId,
  describedBy,
  required,
  error,
  placeholder,
  options,
  value,
  defaultValue,
  onChange,
  disabled,
  name,
  className,
  size,
  clearable,
  ariaLabel,
}: {
  selectId: string;
  describedBy?: string;
  required?: boolean;
  error: boolean;
  placeholder: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
  size: SelectSize;
  clearable?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const selected = value ?? uncontrolled;
  const selectedOption = options.find((option) => option.value === selected);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => optionText(option.label).toLowerCase().includes(q) || option.value.toLowerCase().includes(q));
  }, [options, query]);

  const [active, setActive] = useState(0);

  const choose = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, filtered.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[active];
      if (option && !option.disabled) choose(option.value);
    }
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          className={cx(control.surface, control[size], styles.trigger, error && control.invalid, className)}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          aria-required={required}
        >
          <span className={cx(!selectedOption && styles.trigger)}>{selectedOption?.label ?? placeholder}</span>
          <span className={styles.actions}>
            {clearable && selected ? (
              <span
                role="button"
                tabIndex={-1}
                className={styles.clear}
                aria-label="Clear selection"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  choose("");
                }}
              >
                <Icon size="sm">
                  <XIcon />
                </Icon>
              </span>
            ) : null}
            <Icon size="md">
              <ChevronDownIcon />
            </Icon>
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.content} align="start" sideOffset={4}>
          <input
            className={styles.search}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search"
            aria-label="Search options"
            autoFocus
          />
          <ul className={styles.listbox} role="listbox">
            {filtered.length === 0 ? (
              <li className={styles.empty}>No options</li>
            ) : (
              filtered.map((option, index) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === selected}
                    disabled={option.disabled}
                    className={styles.item}
                    data-active={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(option.value)}
                  >
                    {option.label}
                    {option.value === selected ? (
                      <span className={styles.check}>
                        <Icon size="sm">
                          <CheckIcon />
                        </Icon>
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
    </Popover.Root>
  );
}
