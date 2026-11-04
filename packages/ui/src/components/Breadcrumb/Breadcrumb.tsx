import { ChevronRightIcon } from "../../icons";
import type { ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import styles from "./Breadcrumb.module.css";

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
    <nav className={cx(styles.root, className)} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const current = item.current ?? index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {index > 0 ? (
                <span className={styles.sep} aria-hidden="true">
                  <Icon size="sm">
                    <ChevronRightIcon />
                  </Icon>
                </span>
              ) : null}
              {current || !item.href ? (
                <span className={styles.current} aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <a className={styles.link} href={item.href}>
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
