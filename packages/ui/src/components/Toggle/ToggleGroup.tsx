"use client";

import { createContext, useContext, type ReactNode } from "react";
import * as RxToggleGroup from "@radix-ui/react-toggle-group";
import { cx } from "../../utils/cx";
import styles from "./Toggle.module.css";
import type { ToggleSize } from "./Toggle";

type ToggleGroupShared = {
  size?: ToggleSize;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
};

export type ToggleGroupSingleProps = ToggleGroupShared & {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type ToggleGroupMultipleProps = ToggleGroupShared & {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

export type ToggleGroupItemProps = {
  value: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  children?: ReactNode;
  "aria-label"?: string;
};

const sizeClassMap: Record<ToggleSize, string> = {
  sm: styles.sm ?? "",
  md: styles.md ?? "",
  lg: styles.lg ?? "",
};

const ToggleGroupSizeContext = createContext(sizeClassMap.md);

export function ToggleGroup(props: ToggleGroupProps) {
  const {
    size = "md",
    disabled,
    orientation = "horizontal",
    className,
    children,
    "aria-label": ariaLabel,
  } = props;

  const sizeClass = sizeClassMap[size];
  const content = (
    <ToggleGroupSizeContext.Provider value={sizeClass}>{children}</ToggleGroupSizeContext.Provider>
  );

  if (props.type === "multiple") {
    return (
      <RxToggleGroup.Root
        type="multiple"
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        disabled={disabled}
        orientation={orientation}
        className={cx(styles.group, className)}
        data-orientation={orientation}
        aria-label={ariaLabel}
      >
        {content}
      </RxToggleGroup.Root>
    );
  }

  return (
    <RxToggleGroup.Root
      type="single"
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      disabled={disabled}
      orientation={orientation}
      className={cx(styles.group, className)}
      data-orientation={orientation}
      aria-label={ariaLabel}
    >
      {content}
    </RxToggleGroup.Root>
  );
}

export function ToggleGroupItem({
  value,
  disabled,
  className,
  icon,
  children,
  "aria-label": ariaLabel,
}: ToggleGroupItemProps) {
  const sizeClass = useContext(ToggleGroupSizeContext);
  const iconOnly = Boolean(icon && children == null);

  return (
    <RxToggleGroup.Item
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(styles.groupItem, sizeClass, iconOnly && styles.iconOnly, className)}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden={children ? true : undefined}>
          {icon}
        </span>
      ) : null}
      {children != null ? <span className={styles.label}>{children}</span> : null}
    </RxToggleGroup.Item>
  );
}
