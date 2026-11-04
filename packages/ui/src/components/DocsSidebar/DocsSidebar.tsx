import type { ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./DocsSidebar.module.css";

export type DocsSidebarItem = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export type DocsSidebarGroup = {
  label: string;
  items: DocsSidebarItem[];
};

export type DocsSidebarProps = {
  groups: DocsSidebarGroup[];
  footer?: ReactNode;
  className?: string;
};

export function DocsSidebar({ groups, footer, className }: DocsSidebarProps) {
  return (
    <nav className={cx(styles.root, className)} aria-label="Documentation">
      <div className={styles.groups}>
        {groups.map((group) => (
          <section key={group.label} className={styles.group}>
            <h2 className={styles.groupLabel}>{group.label}</h2>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={cx(styles.link, item.active && styles.linkActive)}
                      aria-current={item.active ? "page" : undefined}
                      onClick={item.onClick}
                    >
                      {item.icon ? (
                        <span className={styles.icon} aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : null}
                      <span className={styles.linkLabel}>{item.label}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={cx(styles.link, item.active && styles.linkActive)}
                      aria-current={item.active ? "page" : undefined}
                      onClick={item.onClick}
                    >
                      {item.icon ? (
                        <span className={styles.icon} aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : null}
                      <span className={styles.linkLabel}>{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
}
