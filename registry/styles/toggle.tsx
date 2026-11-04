"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import * as RxToggle from "@radix-ui/react-toggle";
import * as RxToggleGroup from "@radix-ui/react-toggle-group";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  default:
    "text-cx-secondary bg-cx-primary border-transparent hover:enabled:data-[state=off]:bg-cx-primary-hover hover:enabled:data-[state=off]:text-cx-secondary-hover data-[state=on]:text-cx-brand-secondary data-[state=on]:bg-cx-brand-soft data-[state=on]:hover:enabled:bg-cx-brand-secondary",
  group:
    "inline-flex items-stretch rounded-lg bg-cx-secondary p-0.5 gap-0.5 data-[orientation=vertical]:flex-col data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
  groupItem:
    "appearance-none inline-flex items-center justify-center m-0 gap-1.5 border border-solid border-transparent rounded-[calc(0.5rem-2px)] font-sans font-semibold whitespace-nowrap cursor-pointer select-none text-cx-tertiary bg-transparent transition-colors duration-100 ease-linear hover:enabled:data-[state=off]:text-cx-secondary hover:enabled:data-[state=off]:bg-cx-primary-hover data-[state=on]:text-cx-secondary data-[state=on]:bg-cx-primary data-[state=on]:shadow-sm data-[state=on]:border-cx-secondary focus:outline-none focus-visible:outline focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:text-cx-disabled disabled:shadow-none disabled:opacity-60 disabled:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:text-cx-disabled data-[disabled]:shadow-none data-[disabled]:opacity-60 data-[disabled]:pointer-events-none",
  icon: "inline-flex shrink-0 w-4 h-4 items-center justify-center [&_svg]:w-full [&_svg]:h-full",
  iconOnly: "!p-0 aspect-square",
  label: "inline-flex items-center min-w-0",
  lg: "min-h-11 px-3.5 text-base leading-6",
  md: "min-h-10 px-3 text-sm leading-5",
  outline:
    "text-cx-secondary bg-cx-primary border-cx-primary shadow-xs hover:enabled:data-[state=off]:bg-cx-primary-hover hover:enabled:data-[state=off]:text-cx-secondary-hover data-[state=on]:text-cx-brand-secondary data-[state=on]:bg-cx-brand-soft data-[state=on]:border-cx-brand data-[state=on]:hover:enabled:bg-cx-brand-secondary",
  root: "appearance-none inline-flex items-center justify-center m-0 gap-1.5 border border-solid rounded-lg font-sans font-semibold whitespace-nowrap cursor-pointer select-none transition-colors duration-100 ease-linear focus:outline-none focus-visible:outline focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-cx-disabled disabled:bg-cx-disabled disabled:border-cx-disabled",
  sm: "min-h-9 px-2.5 text-sm leading-5",
};

export type ToggleSize = "sm" | "md" | "lg";
export type ToggleVariant = "default" | "outline";

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Controlled pressed state */
  pressed?: boolean;
  /** Uncontrolled initial pressed state */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ToggleSize;
  variant?: ToggleVariant;
  /** Optional leading icon */
  icon?: ReactNode;
  children?: ReactNode;
};

export function Toggle({
  pressed,
  defaultPressed,
  onPressedChange,
  size = "md",
  variant = "default",
  icon,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ToggleProps) {
  const iconOnly = Boolean(icon && children == null);

  return (
    <RxToggle.Root
      type={type}
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cx(
        CX.root,
        CX[size],
        variant === "outline" ? CX.outline : CX.default,
        iconOnly && CX.iconOnly,
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className={CX.icon} aria-hidden={children ? true : undefined}>
          {icon}
        </span>
      ) : null}
      {children != null ? <span className={CX.label}>{children}</span> : null}
    </RxToggle.Root>
  );
}

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

const ToggleGroupSizeContext = createContext<ToggleSize>("md");

export function ToggleGroup(props: ToggleGroupProps) {
  const {
    size = "md",
    disabled,
    orientation = "horizontal",
    className,
    children,
    "aria-label": ariaLabel,
  } = props;

  const content = (
    <ToggleGroupSizeContext.Provider value={size}>{children}</ToggleGroupSizeContext.Provider>
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
        className={cx(CX.group, className)}
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
      className={cx(CX.group, className)}
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
  const size = useContext(ToggleGroupSizeContext);
  const iconOnly = Boolean(icon && children == null);

  return (
    <RxToggleGroup.Item
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(CX.groupItem, CX[size], iconOnly && CX.iconOnly, className)}
    >
      {icon ? (
        <span className={CX.icon} aria-hidden={children ? true : undefined}>
          {icon}
        </span>
      ) : null}
      {children != null ? <span className={CX.label}>{children}</span> : null}
    </RxToggleGroup.Item>
  );
}
