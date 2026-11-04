import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./DocsToc.module.css";

export type DocsTocItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
};

export type DocsTocProps = {
  title?: string;
  items: DocsTocItem[];
  footer?: ReactNode;
  className?: string;
};

export function DocsToc({
  title = "On this page",
  items,
  footer,
  className,
}: DocsTocProps) {
  return (
    <nav className={cx(styles.root, className)} aria-labelledby="docs-toc-heading">
      <h2 id="docs-toc-heading" className={styles.title}>
        {title}
      </h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              className={cx(styles.link, item.active && styles.linkActive)}
              aria-current={item.active ? "location" : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
}
