"use client";

import type { ReactNode } from "react";
import {
  DisclosureGroup, Disclosure, Heading, Button, DisclosurePanel,
  type DisclosureGroupProps, type DisclosureProps, type DisclosurePanelProps,
} from "react-aria-components";
import { ChevronDown } from "lucide-react";
import { cx } from "../../utils/cx";
import styles from "./Accordion.module.css";

export type AccordionProps = Omit<DisclosureGroupProps, "className"> & {
  className?: string;
  variant?: "default" | "bordered";
};
export type AccordionItemProps = Omit<DisclosureProps, "className"> & { className?: string };
export type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};
export type AccordionContentProps = Omit<DisclosurePanelProps, "className"> & { className?: string };

export function Accordion({ className, variant = "default", ...props }: AccordionProps) {
  return <DisclosureGroup {...props} className={cx(styles.root, variant === "bordered" && styles.bordered, className)} />;
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <Disclosure {...props} className={cx(styles.item, className)} />;
}

export function AccordionTrigger({ children, className, headingLevel = 3 }: AccordionTriggerProps) {
  return <Heading level={headingLevel} className={styles.heading}>
    <Button slot="trigger" className={cx(styles.trigger, className)}>
      <span>{children}</span>
      <ChevronDown size={20} strokeWidth={2} aria-hidden="true" className={styles.chevron} />
    </Button>
  </Heading>;
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return <DisclosurePanel {...props} className={cx(styles.panel, className)}>
    <div className={styles.content}>{children}</div>
  </DisclosurePanel>;
}
