import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "@/lib/utils";

export type CardVariant = "default" | "elevated" | "outline" | "flat" | "filled" | "ghost";

export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
};

export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export type CardContentProps = HTMLAttributes<HTMLDivElement>;
export type CardActionsProps = HTMLAttributes<HTMLDivElement>;

const VARIANTS: Record<CardVariant, string> = {
  default: "bg-white border border-slate-200 shadow-sm",
  elevated: "bg-white border border-slate-200 shadow-lg",
  outline: "bg-transparent border border-dashed border-slate-300",
  flat: "bg-slate-50 border border-slate-200",
  filled: "bg-blue-50 border border-blue-100",
  ghost: "bg-white/60 border border-transparent backdrop-blur",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", padding = "md", className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("rounded-xl", VARIANTS[variant], PADDING[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
});

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { title, description, actions, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("flex items-start justify-between gap-3", className)} {...rest}>
      <div className="min-w-0">
        {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
        {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
});

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("text-sm text-slate-700", className)} {...rest} />;
});

export const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(function CardActions(
  { className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("mt-4 flex items-center justify-end gap-2", className)}
      {...rest}
    />
  );
});
