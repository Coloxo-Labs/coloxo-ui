"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  lg: "[--slider-control:48px] [--slider-track:8px] [--slider-thumb:24px]",
  md: "[--slider-control:40px] [--slider-track:6px] [--slider-thumb:20px]",
  range: "absolute h-full bg-cx-brand",
  root: "relative flex items-center w-full min-w-0 select-none",
  sm: "[--slider-control:32px] [--slider-track:4px] [--slider-thumb:16px]",
  thumb:
    "block border-2 border-solid border-cx-brand bg-cx-primary shadow cursor-grab active:cursor-grabbing focus-visible:outline",
  track: "relative grow overflow-hidden bg-cx-quaternary",
};

export type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  size?: "sm" | "md" | "lg";
  /** Accessible names for individual thumbs, especially range endpoints. */
  thumbLabels?: string[];
};

export const Slider = forwardRef<ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      className,
      size = "md",
      min = 0,
      max = 100,
      value,
      defaultValue,
      thumbLabels,
      "aria-label": ariaLabel,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-valuetext": valueText,
      ...props
    },
    ref,
  ) => {
    const initialValue = defaultValue ?? [min];
    const values = value ?? initialValue;
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cx(CX.root, CX[size], className)}
        min={min}
        max={max}
        value={value}
        defaultValue={initialValue}
        {...props}
      >
        <SliderPrimitive.Track className={CX.track}>
          <SliderPrimitive.Range className={CX.range} />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={CX.thumb}
            aria-label={
              thumbLabels?.[index] ??
              (ariaLabel
                ? values.length > 1
                  ? `${ariaLabel} ${index + 1}`
                  : ariaLabel
                : labelledBy
                  ? undefined
                  : values.length > 1
                    ? `Value ${index + 1}`
                    : "Value")
            }
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            aria-valuetext={valueText}
          />
        ))}
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = "Slider";
