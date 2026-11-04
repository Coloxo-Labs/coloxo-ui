"use client";

import type { ReactNode } from "react";
import * as RxSwitch from "@radix-ui/react-switch";
import { useId } from "@/lib/utils";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  copy: "flex flex-col gap-0.5",
  description: "m-0 text-sm leading-5 text-cx-tertiary",
  label: "text-sm font-medium leading-5 text-cx-secondary cursor-pointer",
  root: "inline-flex items-start gap-2 font-sans",
  switch: "w-11 h-6 mt-0.5 shrink-0 p-0 border border-solid rounded-full bg-cx-quaternary relative cursor-pointer transition-colors hover:disabled:bg-cx-tertiary focus:outline-none focus-visible:outline disabled:bg-cx-disabled disabled:cursor-not-allowed",
  thumb: "block w-5 h-5 bg-cx-primary rounded-full shadow transition-transform",
};

export type SwitchProps = {
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
};

export function Switch({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  id,
  className,
  required,
}: SwitchProps) {
  const inputId = useId(id);
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className={cx(CX.root, className)}>
      <RxSwitch.Root
        id={inputId}
        className={CX.switch}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        name={name}
        required={required}
        aria-describedby={descriptionId}
      >
        <RxSwitch.Thumb className={CX.thumb} />
      </RxSwitch.Root>
      {label || description ? (
        <div className={CX.copy}>
          {label ? (
            <label htmlFor={inputId} className={CX.label}>
              {label}
            </label>
          ) : null}
          {description ? (
            <p id={descriptionId} className={CX.description}>
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
