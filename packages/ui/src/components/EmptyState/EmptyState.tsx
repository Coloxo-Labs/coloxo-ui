import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import styles from "./EmptyState.module.css";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div className={cx(styles.root, className)} {...rest}>
      {icon ? (
        <div className={styles.icon}>
          <Icon size="xl">{icon}</Icon>
        </div>
      ) : null}
      <div className={styles.title}>{title}</div>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ??
        (actionLabel ? (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
