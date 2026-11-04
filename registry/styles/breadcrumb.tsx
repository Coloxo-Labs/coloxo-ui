import { ChevronRightIcon } from "@/lib/icons";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  current: "text-cx-primary font-medium overflow-hidden whitespace-nowrap",
  item: "inline-flex items-center gap-1 min-w-0",
  link: "text-cx-tertiary hover:text-cx-brand-secondary hover:underline focus-visible:outline focus-visible:rounded-sm",
  list: "flex flex-wrap items-center gap-1 m-0 p-0",
  root: "font-sans text-sm",
  sep: "inline-flex",
};

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
  current?: boolean;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cx(CX.root, className)} aria-label="Breadcrumb">
      <ol className={CX.list}>
        {items.map((item, index) => {
          const current = item.current ?? index === items.length - 1;
          return (
            <li key={index} className={CX.item}>
              {index > 0 ? (
                <span className={CX.sep} aria-hidden="true">
                  <Icon size="sm">
                    <ChevronRightIcon />
                  </Icon>
                </span>
              ) : null}
              {current || !item.href ? (
                <span className={CX.current} aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <a className={CX.link} href={item.href}>
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
