"use client";

import type { ReactNode } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { cx } from "../../utils/cx";
import styles from "./Dropdown.module.css";

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
        <Menu.Content className={cx(styles.content, className)} align={align} sideOffset={6}>
          {items
            ? items.map((entry, index) =>
                entry.type === "separator" ? (
                  <Menu.Separator key={entry.key ?? `sep-${index}`} className={styles.separator} />
                ) : (
                  <Menu.Item
                    key={entry.key}
                    className={cx(styles.item, entry.destructive && styles.destructive)}
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
