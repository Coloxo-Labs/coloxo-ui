"use client";

import { forwardRef, useContext, type ComponentPropsWithoutRef } from "react";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";
import { cx } from "@/lib/utils";
import { useControllableState } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  caret: "absolute w-px h-5 bg-currentcolor pointer-events-none",
  group: "flex items-center min-w-0",
  input: "disabled:cursor-not-allowed",
  lg: "[--otp-width:48px] [--otp-height:52px] [--otp-font-size:20px]",
  md: "[--otp-width:40px] [--otp-height:44px] [--otp-font-size:18px]",
  root: "flex items-center gap-3 max-w-full disabled:opacity-50 disabled:cursor-not-allowed",
  separator: "text-cx-tertiary",
  slot: "relative flex items-center justify-center w-10 border border-solid border-cx-primary bg-cx-primary text-cx-primary transition-colors",
  sm: "[--otp-width:32px] [--otp-height:36px] [--otp-font-size:16px]",
};

type WithControlSize<T> = T extends unknown ? Omit<T, "size"> & {
  size?: "sm" | "md" | "lg";
} : never;
export type InputOTPProps = WithControlSize<ComponentPropsWithoutRef<typeof OTPInput>>;

/** A single accessible input with visual slots for one-time verification codes. */
export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className, containerClassName, size = "md", pattern = REGEXP_ONLY_DIGITS, value, defaultValue, onChange, ...props }, ref) => {
    const [code, setCode] = useControllableState<string>({ value, defaultValue: String(defaultValue ?? ""), onChange });
    return (
      <OTPInput
        ref={ref}
        value={code}
        onChange={setCode}
        pattern={pattern}
        containerClassName={cx(CX.root, CX[size], containerClassName)}
        className={cx(CX.input, className)}
        {...props}
      />
    );
  },
);
InputOTP.displayName = "InputOTP";

export type InputOTPGroupProps = ComponentPropsWithoutRef<"div">;
export const InputOTPGroup = forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cx(CX.group, className)} {...props} />
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
        className={cx(CX.slot, className)}
        {...props}
      >
        {slot.char ?? slot.placeholderChar}
        {slot.hasFakeCaret && <span className={CX.caret} aria-hidden="true" />}
      </div>
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

export type InputOTPSeparatorProps = ComponentPropsWithoutRef<"div">;
export const InputOTPSeparator = forwardRef<HTMLDivElement, InputOTPSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} aria-hidden="true" className={cx(CX.separator, className)} {...props}>
      {children ?? "−"}
    </div>
  ),
);
InputOTPSeparator.displayName = "InputOTPSeparator";
