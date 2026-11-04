import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "secondary-brand"
  | "tertiary"
  | "primary-destructive"
  | "secondary-destructive"
  | "tertiary-destructive"
  | "link-color"
  | "link-gray";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonIconPosition = "left" | "right";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
};

/*
 * Class maps, not a variant library. This keeps the installed file
 * dependency-free apart from React, which matters because the component is
 * copied into the consumer's repo and they own it from then on.
 */
const BASE =
  "relative inline-flex cursor-pointer items-center justify-center border border-transparent font-medium whitespace-nowrap no-underline select-none " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white border-blue-700 shadow-sm hover:bg-blue-700 active:bg-blue-800",
  secondary:
    "bg-white text-slate-800 border-slate-300 shadow-sm hover:bg-slate-50 active:bg-slate-100",
  "secondary-brand":
    "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 active:bg-blue-200",
  tertiary:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200",
  "primary-destructive":
    "bg-red-600 text-white border-red-700 shadow-sm hover:bg-red-700 active:bg-red-800",
  "secondary-destructive": "bg-white text-red-600 border-red-200 hover:bg-red-50 active:bg-red-100",
  "tertiary-destructive": "bg-transparent text-red-600 hover:bg-red-50 active:bg-red-100",
  "link-color":
    "bg-transparent text-blue-700 hover:text-blue-800 hover:underline active:text-blue-900",
  "link-gray":
    "bg-transparent text-slate-600 hover:text-slate-700 hover:underline active:text-slate-800",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "min-h-7 gap-1 rounded-md px-2.5 text-sm",
  sm: "min-h-8 gap-1.5 rounded-md px-3 text-sm",
  md: "min-h-10 gap-1.5 rounded-lg px-4 text-sm",
  lg: "min-h-11 gap-2 rounded-lg px-5 text-base",
  xl: "min-h-12 gap-2 rounded-[10px] px-6 text-base",
};

const LINK_SIZES = "h-auto min-h-0 gap-1 rounded-md px-0 py-0.5 text-sm";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = "left",
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const isLink = variant === "link-color" || variant === "link-gray";
  const classes = [
    BASE,
    VARIANTS[variant],
    isLink ? LINK_SIZES : SIZES[size],
    fullWidth ? "w-full" : "",
    loading ? "pointer-events-none" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      {icon && iconPosition === "left" && !loading ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children ? <span className="inline-flex items-center truncate">{children}</span> : null}
      {icon && iconPosition === "right" && !loading ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </button>
  );
});
