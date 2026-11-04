"use client";

import type { ReactNode } from "react";
import * as RxTabs from "@radix-ui/react-tabs";
import { cx } from "../../utils/cx";
import styles from "./Tabs.module.css";

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
      className={cx(styles.root, className)}
      value={value}
      defaultValue={defaultValue ?? firstEnabled}
      onValueChange={onValueChange}
    >
      <RxTabs.List className={styles.list} aria-label="Tabs">
        {items.map((item) => (
          <RxTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={styles.trigger}
          >
            {item.label}
          </RxTabs.Trigger>
        ))}
      </RxTabs.List>
      {children ??
        items.map((item) =>
          item.content != null ? (
            <RxTabs.Content key={item.value} value={item.value} className={styles.content}>
              {item.content}
            </RxTabs.Content>
          ) : null,
        )}
    </RxTabs.Root>
  );
}
