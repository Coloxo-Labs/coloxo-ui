"use client";

import type { ReactNode } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  content: "min-w-[12rem] bg-cx-primary border border-solid border-cx-secondary rounded-lg shadow-lg p-1 font-sans",
  destructive: "text-cx-error",
  item: "flex items-center gap-2 p-2 rounded-md text-sm text-cx-secondary cursor-pointer outline-none",
  separator: "h-px my-1 mx-0",
};

export type DropdownItem = {
  type?: "item";
  key: string;
  label: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
  icon?: ReactNode;
};

export type DropdownSeparator = {
  type: "separator";
  key?: string;
};

export type DropdownEntry = DropdownItem | DropdownSeparator;

export type DropdownProps = {
  trigger: ReactNode;
  items?: DropdownEntry[];
  children?: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
};

export function Dropdown({ trigger, items, children, align = "start", className }: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className={cx(CX.content, className)} align={align} sideOffset={6}>
          {items
            ? items.map((entry, index) =>
                entry.type === "separator" ? (
                  <Menu.Separator key={entry.key ?? `sep-${index}`} className={CX.separator} />
                ) : (
                  <Menu.Item
                    key={entry.key}
                    className={cx(CX.item, entry.destructive && CX.destructive)}
                    disabled={entry.disabled}
                    onSelect={entry.onSelect}
                  >
                    {entry.icon}
                    {entry.label}
                  </Menu.Item>
                ),
              )
            : children}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

export const DropdownItem = Menu.Item;
export const DropdownSeparator = Menu.Separator;
