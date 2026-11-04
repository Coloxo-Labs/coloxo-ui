"use client";
import { EyeIcon, EyeOffIcon, CircleHelpIcon, CircleAlertIcon } from "../../icons";

import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type ComponentType,
  type SVGProps,
} from "react";
import { FormField, fieldDescribedBy } from "../FormField/FormField";
import { Icon } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import control from "../_internal/Control.module.css";
import styles from "./Input.module.css";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> & {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  /** Helper text below the field (Untitled `hint`). */
  description?: ReactNode;
  /** Alias for `description` (Untitled API). */
  hint?: ReactNode;
  error?: ReactNode;
  size?: InputSize;
  /** Leading icon (Untitled `icon`). Accepts a ReactNode or icon component. */
  icon?: ReactNode | ComponentType<SVGProps<SVGSVGElement>>;
  /** Trailing custom node (non-tooltip). */
  suffix?: ReactNode;
  /** Help tooltip on trailing question icon. */
  tooltip?: string;
  /** Keyboard shortcut badge (`true` → ⌘K). */
  shortcut?: string | boolean;
  /** Inline leading text inside the field (e.g. https://). */
  leadingText?: string;
  /** When true, surface has no own ring (used inside InputGroup). */
  groupFlat?: boolean;
  groupFlatLeading?: boolean;
  groupFlatTrailing?: boolean;
};

function renderLeadingIcon(
  icon: InputProps["icon"],
  size: InputSize,
): ReactNode {
  if (!icon) return null;
  if (typeof icon === "function") {
    const Comp = icon;
    return (
      <Icon size={size === "sm" ? "sm" : "md"}>
        <Comp />
      </Icon>
    );
  }
  return <Icon size={size === "sm" ? "sm" : "md"}>{icon}</Icon>;
}

export function Input({
  label,
  required,
  optional,
  description,
  hint,
  error,
  size = "md",
  icon,
  suffix,
  tooltip,
  shortcut,
  leadingText,
  groupFlat,
  groupFlatLeading,
  groupFlatTrailing,
  disabled,
  readOnly,
  className,
  id,
  type = "text",
  ...rest
}: InputProps) {
  const inputId = useId(id);
  const help = hint ?? description;
  const describedBy = fieldDescribedBy({ id: inputId, description: help, error });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const isInvalid = Boolean(error);

  const leadingIconNode = renderLeadingIcon(icon, size);
  const hasLeadingIcon = Boolean(leadingIconNode);
  const hasLeadingText = Boolean(leadingText);
  const hasTrailingIcon =
    (!isPassword && (Boolean(tooltip) || isInvalid)) || isPassword;
  const hasShortcut = Boolean(shortcut) && !isPassword;

  const field = (
    <div
      className={cx(
        control.surface,
        control[size],
        styles.root,
        size === "sm" && styles.rootSizeSm,
        size === "md" && styles.rootSizeMd,
        size === "lg" && styles.rootSizeLg,
        isInvalid && control.invalid,
        isInvalid && styles.invalid,
        disabled && control.disabled,
        readOnly && !disabled && control.readOnly,
        groupFlat && styles.groupFlat,
        groupFlatLeading && styles.groupFlatLeading,
        groupFlatTrailing && styles.groupFlatTrailing,
        hasLeadingText && styles.withLeadingText,
        className,
      )}
      data-disabled={disabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      {leadingIconNode ? (
        <span className={styles.leadingIcon} aria-hidden="true">
          {leadingIconNode}
        </span>
      ) : null}

      {hasLeadingText ? <span className={styles.leadingText}>{leadingText}</span> : null}

      <input
        id={inputId}
        className={cx(
          styles.input,
          styles[size],
          hasLeadingIcon && styles.hasLeading,
          (hasTrailingIcon || Boolean(suffix)) && !hasShortcut && styles.hasTrailing,
          hasShortcut && styles.hasShortcut,
        )}
        disabled={disabled}
        readOnly={readOnly}
        type={isPassword && passwordVisible ? "text" : type}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        {...rest}
      />

      {suffix && !isPassword && !tooltip && !isInvalid ? (
        <span className={styles.suffixAffix}>
          <Icon size={size === "sm" ? "sm" : "md"}>{suffix}</Icon>
        </span>
      ) : null}

      {!isPassword && tooltip && !isInvalid ? (
        <span className={styles.trailingSlot}>
          <Tooltip content={tooltip} side="top">
            <button
              type="button"
              className={styles.helpButton}
              aria-label="More information"
              tabIndex={-1}
            >
              <Icon size="sm">
                <CircleHelpIcon />
              </Icon>
            </button>
          </Tooltip>
        </span>
      ) : null}

      {!isPassword ? (
        <span className={cx(styles.trailingSlot, styles.invalidIcon)} aria-hidden="true">
          <Icon size="sm">
            <CircleAlertIcon />
          </Icon>
        </span>
      ) : null}

      {isPassword ? (
        <span className={styles.trailingSlot}>
          <button
            type="button"
            className={styles.passwordToggle}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            onClick={() => setPasswordVisible((v) => !v)}
            tabIndex={-1}
          >
            <Icon size="sm">{passwordVisible ? <EyeOffIcon /> : <EyeIcon />}</Icon>
          </button>
        </span>
      ) : null}

      {hasShortcut ? (
        <div className={styles.shortcutWrap} aria-hidden="true">
          <span className={styles.shortcut}>
            {typeof shortcut === "string" ? shortcut : "⌘K"}
          </span>
        </div>
      ) : null}
    </div>
  );

  if (!label && !help && !error) return field;

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      optional={optional}
      description={help}
      error={error}
    >
      {field}
    </FormField>
  );
}
