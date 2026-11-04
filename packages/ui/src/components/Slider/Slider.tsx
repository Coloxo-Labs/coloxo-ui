"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cx } from "../../utils/cx";
import styles from "./Slider.module.css";

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
        className={cx(styles.root, styles[size], className)}
        min={min}
        max={max}
        value={value}
        defaultValue={initialValue}
        {...props}
      >
        <SliderPrimitive.Track className={styles.track}>
          <SliderPrimitive.Range className={styles.range} />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={styles.thumb}
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
