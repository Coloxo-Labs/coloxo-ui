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
import { ChevronDownIcon, XIcon } from "../../icons";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import control from "../_internal/Control.module.css";
import styles from "./Combobox.module.css";

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

/** Editable single selection with filtered suggestions and keyboard navigation. */
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
      className={cx(styles.root, className)}
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
      {label && (
        <Label className={styles.label}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </Label>
      )}
      <div
        className={cx(
          control.surface,
          control[size],
          styles.field,
          error && control.invalid,
          disabled && control.disabled,
        )}
      >
        <Input id={id} className={styles.input} placeholder={placeholder} />
        {clearable && <ClearButton />}
        <Button className={styles.button} aria-label="Show suggestions">
          <Icon size="md">
            <ChevronDownIcon />
          </Icon>
        </Button>
      </div>
      {description && !error && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      {error && (
        <Text slot="errorMessage" className={styles.error}>
          {error}
        </Text>
      )}
      <Popover className={styles.popover} placement="bottom start" offset={4}>
        <ListBox
          className={styles.list}
          renderEmptyState={() => <div className={styles.empty}>{emptyMessage}</div>}
        >
          {(option: ComboboxOption) => (
            <ListBoxItem id={option.value} textValue={option.label} className={styles.option}>
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
      className={styles.button}
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
