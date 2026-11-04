"use client";

import { useContext, type ReactNode } from "react";
import {
  ComboBox,
  ComboBoxStateContext,
  Input,
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
} from "react-aria-components";
import { ChevronDownIcon, XIcon } from "@/lib/icons";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

const CX = {
  root: "flex w-full flex-col gap-2 font-sans",
  label: "text-sm font-medium text-cx-secondary",
  field: "flex items-center gap-2 px-3",
  surface:
    "relative w-full rounded-lg bg-cx-primary font-sans text-cx-primary shadow-xs after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_var(--cx-color-border-primary)] focus-within:after:shadow-[inset_0_0_0_2px_var(--cx-color-border-brand)]",
  invalid:
    "after:shadow-[inset_0_0_0_1px_var(--cx-color-border-error-subtle)] focus-within:after:shadow-[inset_0_0_0_2px_var(--cx-color-border-error)]",
  disabled: "cursor-not-allowed opacity-50",
  sm: "min-h-8 text-sm",
  md: "min-h-10 text-base",
  lg: "min-h-11 text-base",
  input:
    "min-w-0 w-full flex-1 border-0 bg-transparent py-2.5 font-[inherit] text-inherit outline-none placeholder:text-cx-placeholder",
  button:
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-1 text-cx-tertiary data-[disabled]:cursor-not-allowed data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-[var(--cx-color-border-brand)]",
  popover:
    "z-[var(--cx-z-dropdown)] w-[var(--trigger-width)] rounded-lg border border-solid border-cx-secondary bg-cx-primary text-cx-primary shadow-lg",
  list: "max-h-80 overflow-auto p-1 outline-none",
  option:
    "cursor-pointer rounded-md p-2.5 font-sans text-base outline-none data-[disabled]:cursor-not-allowed data-[disabled]:text-cx-disabled data-[focused]:bg-[var(--cx-color-bg-primary-hover)] data-[selected]:bg-[var(--cx-color-bg-active)] data-[selected]:font-medium",
  description: "text-sm text-cx-tertiary",
  error: "text-sm text-cx-error",
  empty: "p-3 text-sm text-cx-tertiary",
};

export type ComboboxOption = { value: string; label: string; disabled?: boolean };
export type ComboboxSize = "sm" | "md" | "lg";
export type ComboboxProps = {
  options: ComboboxOption[];
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  size?: ComboboxSize;
  name?: string;
  id?: string;
  className?: string;
  emptyMessage?: string;
  "aria-label"?: string;
};

export function Combobox({
  options,
  label,
  description,
  error,
  placeholder = "Search options...",
  value,
  defaultValue,
  onValueChange,
  disabled,
  required,
  clearable = true,
  size = "md",
  name,
  id,
  className,
  emptyMessage = "No options found",
  "aria-label": ariaLabel,
}: ComboboxProps) {
  return (
    <ComboBox
      className={cx(CX.root, className)}
      defaultItems={options}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => onValueChange?.(key === null ? null : String(key))}
      disabledKeys={options.filter((option) => option.disabled).map((option) => option.value)}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={Boolean(error)}
      validationBehavior="aria"
      name={name}
      menuTrigger="focus"
      allowsEmptyCollection
      aria-label={ariaLabel}
    >
      {label ? (
        <Label className={CX.label}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </Label>
      ) : null}
      <div
        className={cx(CX.surface, CX[size], CX.field, error && CX.invalid, disabled && CX.disabled)}
      >
        <Input id={id} className={CX.input} placeholder={placeholder} />
        {clearable ? <ClearButton /> : null}
        <Button className={CX.button} aria-label="Show suggestions">
          <Icon size="md">
            <ChevronDownIcon />
          </Icon>
        </Button>
      </div>
      {description && !error ? (
        <Text slot="description" className={CX.description}>
          {description}
        </Text>
      ) : null}
      {error ? (
        <Text slot="errorMessage" className={CX.error}>
          {error}
        </Text>
      ) : null}
      <Popover className={CX.popover} placement="bottom start" offset={4}>
        <ListBox
          className={CX.list}
          renderEmptyState={() => <div className={CX.empty}>{emptyMessage}</div>}
        >
          {(option: ComboboxOption) => (
            <ListBoxItem id={option.value} textValue={option.label} className={CX.option}>
              {option.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

function ClearButton() {
  const state = useContext(ComboBoxStateContext);
  if (!state || (!state.inputValue && state.selectedKey === null)) return null;
  return (
    <Button
      slot={null}
      className={CX.button}
      aria-label="Clear selection"
      onPress={() => {
        state.setSelectedKey(null);
        state.setInputValue("");
      }}
    >
      <Icon size="sm">
        <XIcon />
      </Icon>
    </Button>
  );
}
