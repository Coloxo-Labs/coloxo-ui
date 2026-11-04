"use client";

import { forwardRef, useContext, type ComponentPropsWithoutRef } from "react";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";
import { cx } from "../../utils/cx";
import { useControllableState } from "../../utils/useControllableState";
import styles from "./InputOTP.module.css";

type WithControlSize<T> = T extends unknown
  ? Omit<T, "size"> & {
      size?: "sm" | "md" | "lg";
    }
  : never;
export type InputOTPProps = WithControlSize<ComponentPropsWithoutRef<typeof OTPInput>>;

/** A single accessible input with visual slots for one-time verification codes. */
export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(
  (
    {
      className,
      containerClassName,
      size = "md",
      pattern = REGEXP_ONLY_DIGITS,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [code, setCode] = useControllableState<string>({
      value,
      defaultValue: String(defaultValue ?? ""),
      onChange,
    });
    return (
      <OTPInput
        ref={ref}
        value={code}
        onChange={setCode}
        pattern={pattern}
        containerClassName={cx(styles.root, styles[size], containerClassName)}
        className={cx(styles.input, className)}
        {...props}
      />
    );
  },
);
InputOTP.displayName = "InputOTP";

export type InputOTPGroupProps = ComponentPropsWithoutRef<"div">;
export const InputOTPGroup = forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cx(styles.group, className)} {...props} />
  ),
);
InputOTPGroup.displayName = "InputOTPGroup";

export type InputOTPSlotProps = ComponentPropsWithoutRef<"div"> & { index: number };
export const InputOTPSlot = forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const context = useContext(OTPInputContext);
    if (!context) throw new Error("InputOTPSlot must be rendered inside InputOTP.");
    const slot = context.slots[index];
    if (!slot) throw new Error("InputOTPSlot index must be within InputOTP maxLength.");
    return (
      <div
        ref={ref}
        data-active={slot.isActive || undefined}
        className={cx(styles.slot, className)}
        {...props}
      >
        {slot.char ?? slot.placeholderChar}
        {slot.hasFakeCaret && <span className={styles.caret} aria-hidden="true" />}
      </div>
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

export type InputOTPSeparatorProps = ComponentPropsWithoutRef<"div">;
export const InputOTPSeparator = forwardRef<HTMLDivElement, InputOTPSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} aria-hidden="true" className={cx(styles.separator, className)} {...props}>
      {children ?? "−"}
    </div>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";
