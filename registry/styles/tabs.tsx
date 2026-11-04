"use client";

import type { ReactNode } from "react";
import * as RxTabs from "@radix-ui/react-tabs";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  content: "pt-4 text-base text-cx-secondary",
  list: "flex gap-1 hidden w-0 h-0",
  root: "font-sans",
  trigger: "appearance-none border-none bg-transparent text-cx-tertiary text-sm font-medium py-2 px-3 mb-px cursor-pointer whitespace-nowrap hover:disabled:text-cx-secondary focus:outline-none focus-visible:outline disabled:text-cx-disabled disabled:cursor-not-allowed",
};

export type TabItem = {
  value: string;
  label: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: ReactNode;
};

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const firstEnabled = items.find((item) => !item.disabled)?.value;

  return (
    <RxTabs.Root
      className={cx(CX.root, className)}
      value={value}
      defaultValue={defaultValue ?? firstEnabled}
      onValueChange={onValueChange}
    >
      <RxTabs.List className={CX.list} aria-label="Tabs">
        {items.map((item) => (
          <RxTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={CX.trigger}
          >
            {item.label}
          </RxTabs.Trigger>
        ))}
      </RxTabs.List>
      {children ??
        items.map((item) =>
          item.content != null ? (
            <RxTabs.Content key={item.value} value={item.value} className={CX.content}>
              {item.content}
            </RxTabs.Content>
          ) : null,
        )}
    </RxTabs.Root>
  );
}
