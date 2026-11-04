import { forwardRef, type ButtonHTMLAttributes, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../_internal/Spinner";
import { cx } from "../../utils/cx";
import buttonStyles from "../_internal/buttonVariants.module.css";
import styles from "./IconButton.module.css";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "secondary-brand"
  | "tertiary"
  | "primary-destructive"
  | "secondary-destructive"
  | "tertiary-destructive";

export type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type IconButtonShape = "square" | "circle";

const variantMap = {
  primary: buttonStyles.primary,
  secondary: buttonStyles.secondary,
  "secondary-brand": buttonStyles.secondaryBrand,
  tertiary: buttonStyles.tertiary,
  "primary-destructive": buttonStyles.primaryDestructive,
  "secondary-destructive": buttonStyles.secondaryDestructive,
  "tertiary-destructive": buttonStyles.tertiaryDestructive,
} as const;

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  loading?: boolean;
  tooltip?: string;
  "aria-label": string;
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = "tertiary",
    size = "md",
    shape = "square",
    loading = false,
    tooltip,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const iconSize = size === "xs" || size === "sm" ? "xs" : size === "xl" ? "md" : "sm";
  const button = (
    <button
      type={type}
      className={cx(
        buttonStyles.root,
        "cx-focusable",
        variantMap[variant],
        buttonStyles[size],
        styles.root,
        styles[size],
        shape === "circle" && styles.circle,
        variant === "tertiary" && styles.tertiaryIcon,
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
      ref={ref}
    >
      {loading ? (
        <Spinner size={size === "lg" || size === "xl" ? "md" : "sm"} />
      ) : (
        <Icon size={iconSize}>{children}</Icon>
      )}
    </button>
  );

  if (!tooltip) return button;

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{button}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className={styles.tooltip} sideOffset={6}>
            {tooltip}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
});
