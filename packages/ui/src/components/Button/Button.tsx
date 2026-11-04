import { forwardRef, type ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../_internal/Spinner";
import { cx } from "../../utils/cx";
import variants from "../_internal/buttonVariants.module.css";
import styles from "./Button.module.css";

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

const variantClass = {
  primary: variants.primary,
  secondary: variants.secondary,
  "secondary-brand": variants.secondaryBrand,
  tertiary: variants.tertiary,
  "primary-destructive": variants.primaryDestructive,
  "secondary-destructive": variants.secondaryDestructive,
  "tertiary-destructive": variants.tertiaryDestructive,
  "link-color": styles.linkColor,
  "link-gray": styles.linkGray,
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
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
}, ref) {
  const isDisabled = Boolean(disabled);
  const isLink = variant === "link-color" || variant === "link-gray";
  const iconSize = size === "xs" || size === "sm" ? "xs" : size === "xl" ? "md" : "sm";
  const isDestructive =
    variant === "primary-destructive" ||
    variant === "secondary-destructive" ||
    variant === "tertiary-destructive";

  return (
    <button
      type={type}
      className={cx(
        variants.root,
        "cx-focusable",
        variantClass[variant],
        !isLink && variants[size],
        isLink && styles.linkBase,
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        isDestructive && variants.destructiveFocus,
        className,
      )}
      disabled={isDisabled || loading}
      aria-busy={loading || undefined}
      {...rest}
      ref={ref}
    >
      {loading ? (
        <span className={styles.spinner}>
          <Spinner size={size === "xs" ? "sm" : "md"} />
        </span>
      ) : null}
      {icon && iconPosition === "left" && !loading ? (
        <Icon size={iconSize}>{icon}</Icon>
      ) : null}
      {children ? <span className={cx(styles.label, "cx-truncate")}>{children}</span> : null}
      {icon && iconPosition === "right" && !loading ? (
        <Icon size={iconSize}>{icon}</Icon>
      ) : null}
    </button>
  );
});
  