import {
  forwardRef,
  useId,
  type ComponentType,
  type InputHTMLAttributes,
  type ReactNode,
  type SVGProps,
} from "react";
import { cx } from "@/lib/utils";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> & {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: InputSize;
  icon?: ReactNode | ComponentType<SVGProps<SVGSVGElement>>;
  suffix?: ReactNode;
};

const SIZES: Record<InputSize, string> = {
  sm: "min-h-8 px-3 text-sm",
  md: "min-h-10 px-3.5 text-sm",
  lg: "min-h-11 px-4 text-base",
};

const ICON_PADDING: Record<InputSize, string> = {
  sm: "pl-8",
  md: "pl-9",
  lg: "pl-10",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    required,
    optional,
    description,
    hint,
    error,
    size = "md",
    icon,
    suffix,
    className,
    id,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const help = error ?? description ?? hint;
  const hasIcon = Boolean(icon);
  const IconNode = typeof icon === "function" ? icon : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className={cx(
            "text-sm font-medium text-slate-800",
            disabled && "text-slate-400",
          )}
        >
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-red-600">
              *
            </span>
          ) : null}
          {!required && optional ? (
            <span className="ml-1 font-normal text-slate-500">(optional)</span>
          ) : null}
        </label>
      ) : null}

      <div className="relative flex items-center">
        {hasIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 inline-flex size-4 items-center justify-center text-slate-400"
          >
            {IconNode ? <IconNode /> : (icon as ReactNode)}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={help ? `${inputId}-help` : undefined}
          className={cx(
            "w-full rounded-lg border bg-white text-slate-900 placeholder:text-slate-400",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            SIZES[size],
            hasIcon && ICON_PADDING[size],
            suffix && "pr-12",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-300 focus-visible:border-blue-600 focus-visible:ring-blue-600",
            className,
          )}
          {...rest}
        />

        {suffix ? (
          <span className="absolute right-3 inline-flex items-center text-sm text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>

      {help ? (
        <p
          id={`${inputId}-help`}
          className={cx("text-sm", error ? "text-red-600" : "text-slate-500")}
        >
          {help}
        </p>
      ) : null}
    </div>
  );
});
