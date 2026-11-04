"use client";

import type { ReactNode } from "react";
import {
  DisclosureGroup,
  Disclosure,
  Heading,
  Button,
  DisclosurePanel,
  type DisclosureGroupProps,
  type DisclosureProps,
  type DisclosurePanelProps,
} from "react-aria-components";
import { ChevronDownIcon } from "@/lib/icons";
import { cx } from "@/lib/utils";

const CX = {
  root: "w-full font-sans text-cx-primary",
  bordered: "rounded-lg border border-solid border-cx-secondary bg-cx-primary px-4",
  item: "border-b border-solid border-cx-secondary last:border-b-0",
  heading: "m-0 font-[inherit]",
  trigger:
    "group flex w-full cursor-pointer items-center justify-between gap-4 rounded-sm border-0 bg-transparent py-4 text-start font-[inherit] font-medium text-inherit data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-[3px] data-[focus-visible]:outline-[var(--cx-color-border-brand)] data-[hovered]:[&>span]:underline data-[hovered]:[&>span]:underline-offset-4",
  chevron: "shrink-0 text-cx-tertiary transition-transform duration-150 ease-linear motion-reduce:transition-none group-aria-expanded:rotate-180",
  panel: "overflow-hidden",
  content: "pb-4 text-sm leading-5 text-cx-secondary",
};

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
  return (
    <DisclosureGroup
      {...props}
      className={cx(CX.root, variant === "bordered" && CX.bordered, className)}
    />
  );
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <Disclosure {...props} className={cx(CX.item, className)} />;
}

export function AccordionTrigger({ children, className, headingLevel = 3 }: AccordionTriggerProps) {
  return (
    <Heading level={headingLevel} className={CX.heading}>
      <Button slot="trigger" className={cx(CX.trigger, className)}>
        <span>{children}</span>
        <ChevronDownIcon size={20} className={CX.chevron} />
      </Button>
    </Heading>
  );
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <DisclosurePanel {...props} className={cx(CX.panel, className)}>
      <div className={CX.content}>{children}</div>
    </DisclosurePanel>
  );
}
