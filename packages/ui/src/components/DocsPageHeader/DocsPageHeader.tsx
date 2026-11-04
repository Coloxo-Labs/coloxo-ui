import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "../Breadcrumb/Breadcrumb";
import { cx } from "../../utils/cx";
import styles from "./DocsPageHeader.module.css";

export type DocsPageHeaderProps = {
  breadcrumb?: BreadcrumbItem[];
  title: ReactNode;
  description?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function DocsPageHeader({
  breadcrumb,
  title,
  description,
  badges,
  actions,
  className,
}: DocsPageHeaderProps) {
  return (
    <header className={cx(styles.root, className)}>
      {breadcrumb && breadcrumb.length > 0 ? (
        <div className={styles.breadcrumb}>
          <Breadcrumb items={breadcrumb} />
        </div>
      ) : null}
      <div className={styles.main}>
        <div className={styles.text}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {badges ? <div className={styles.badges}>{badges}</div> : null}
          </div>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}
