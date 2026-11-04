import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  description: "m-0 max-w-[28rem] text-sm text-cx-tertiary leading-6",
  icon: "bg-cx-secondary border border-solid border-cx-secondary rounded-full w-12 h-12 inline-flex items-center justify-center mb-1",
  root: "flex flex-col items-center text-center gap-2 py-8 px-4 font-sans",
  title: "text-lg font-semibold text-cx-primary",
};

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
    <div className={cx(CX.root, className)} {...rest}>
      {icon ? (
        <div className={CX.icon}>
          <Icon size="xl">{icon}</Icon>
        </div>
      ) : null}
      <div className={CX.title}>{title}</div>
      {description ? <p className={CX.description}>{description}</p> : null}
      {action ??
        (actionLabel ? (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null)}
    </div>
  );
}
