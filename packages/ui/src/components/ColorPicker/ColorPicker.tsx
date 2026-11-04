"use client";
import { ChevronDownIcon } from "../../icons";

import { useMemo, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ColorPicker as AriaColorPicker, type Color } from "react-aria-components";
import { useControllableState } from "../../utils/useControllableState";
import { cx } from "../../utils/cx";
import control from "../_internal/Control.module.css";
import {
  DEFAULT_CONTROL_SIZE,
  getControlSizeClass,
  type ControlSize,
} from "../_internal/controlSize";
import { PickerFieldShell, usePickerAria, usePickerFieldIds, usePickerOpen } from "../_internal/picker";
import {
  ColorAlphaSliderControl,
  ColorAreaControl,
  ColorFormatFields,
  ColorHueSliderControl,
  ColorPreviewSwatch,
  serializeColor,
  type ColorFormat,
  PaletteGrid,
  SwatchGrid,
  toColor,
} from "./ColorParts";
import {
  BRAND_SWATCHES,
  COLOR_PALETTE,
  DEFAULT_SWATCHES,
  GRAY_SWATCHES,
} from "./presets";
import styles from "./ColorPicker.module.css";

export type ColorPickerVariant =
  | "solid"
  | "minimal"
  | "swatches"
  | "brand"
  | "gray"
  | "palette";

export type ColorPickerSize = ControlSize;

export type ColorPickerProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string, color: Color) => void;
  /** Panel layout — solid spectrum / swatches / palette (use `GradientPicker` for gradients). */
  variant?: ColorPickerVariant;
  size?: ColorPickerSize;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  /** Custom swatch colors (used by `swatches` variant, or appended in solid). */
  swatches?: readonly string[];
  swatchSize?: "sm" | "md";
  showAlpha?: boolean;
  showEyeDropper?: boolean;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  /** Render the panel inline (no popover). */
  inline?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  className?: string;
  /** Hide the trigger and only show the panel (requires `inline`). */
  hideTrigger?: boolean;
};

function resolveSwatches(variant: ColorPickerVariant, swatches?: readonly string[]) {
  if (swatches?.length) return swatches;
  if (variant === "brand") return BRAND_SWATCHES;
  if (variant === "gray") return GRAY_SWATCHES;
  return DEFAULT_SWATCHES;
}

function PanelBody({
  variant,
  swatches,
  swatchSize,
  showAlpha,
  showEyeDropper,
  format,
  onFormatChange,
}: {
  variant: ColorPickerVariant;
  swatches: readonly string[];
  swatchSize: "sm" | "md";
  showAlpha: boolean;
  showEyeDropper: boolean;
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
}) {
  if (variant === "swatches" || variant === "brand" || variant === "gray") {
    return (
      <>
        <ColorPreviewSwatch />
        <SwatchGrid colors={swatches} size={swatchSize} />
        <ColorFormatFields
          format={format}
          onFormatChange={onFormatChange}
          showEyeDropper={false}
        />
      </>
    );
  }

  if (variant === "palette") {
    return (
      <>
        <PaletteGrid palette={COLOR_PALETTE} />
        {showAlpha ? (
          <div className={styles.sliderRow}>
            <ColorPreviewSwatch />
            <div className={styles.sliders}>
              <ColorAlphaSliderControl />
            </div>
          </div>
        ) : null}
        <ColorFormatFields
          format={format}
          onFormatChange={onFormatChange}
          showEyeDropper={showEyeDropper}
        />
      </>
    );
  }

  if (variant === "minimal") {
    return (
      <>
        <div className={styles.sliderRow}>
          <ColorPreviewSwatch />
          <div className={styles.sliders}>
            <ColorHueSliderControl />
            {showAlpha ? <ColorAlphaSliderControl /> : null}
          </div>
        </div>
        <ColorFormatFields
          format={format}
          onFormatChange={onFormatChange}
          showEyeDropper={showEyeDropper}
        />
      </>
    );
  }

  // solid (default)
  return (
    <>
      <ColorAreaControl />
      <div className={styles.sliderRow}>
        <ColorPreviewSwatch />
        <div className={styles.sliders}>
          <ColorHueSliderControl />
          {showAlpha ? <ColorAlphaSliderControl /> : null}
        </div>
      </div>
      <ColorFormatFields
        format={format}
        onFormatChange={onFormatChange}
        showEyeDropper={showEyeDropper}
      />
      {swatches.length > 0 ? <SwatchGrid colors={swatches} size={swatchSize} /> : null}
    </>
  );
}

export function ColorPicker({
  value,
  defaultValue = "#2348ff",
  onChange,
  variant = "solid",
  size = DEFAULT_CONTROL_SIZE,
  label,
  description,
  error,
  required,
  optional,
  disabled,
  swatches: swatchesProp,
  swatchSize = "md",
  showAlpha = true,
  showEyeDropper = true,
  format: formatProp,
  defaultFormat = "hex",
  onFormatChange,
  inline = false,
  open: openProp,
  defaultOpen,
  onOpenChange,
  id,
  className,
  hideTrigger = false,
}: ColorPickerProps) {
  const { inputId } = usePickerFieldIds(id);
  const describedBy = usePickerAria({ inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const [format, setFormat] = useControllableState<ColorFormat>({
    value: formatProp,
    defaultValue: defaultFormat,
    onChange: onFormatChange,
  });

  const [hex, setHex] = useControllableState<string>({
    value,
    defaultValue,
    onChange: (next) => {
      onChange?.(next, toColor(next));
    },
  });

  const color = useMemo(() => toColor(hex), [hex]);
  const sizeClass = getControlSizeClass(size);
  const swatches = useMemo(
    () =>
      variant === "solid"
        ? (swatchesProp ?? [])
        : resolveSwatches(variant, swatchesProp),
    [variant, swatchesProp],
  );

  const handleColorChange = (next: Color) => {
    setHex(serializeColor(next));
  };

  const panelBody = (
    <PanelBody
      variant={variant}
      swatches={swatches}
      swatchSize={swatchSize}
      showAlpha={showAlpha}
      showEyeDropper={showEyeDropper}
      format={format}
      onFormatChange={setFormat}
    />
  );

  const trigger = (
    <button
      type="button"
      id={inputId}
      disabled={disabled}
      className={cx(control.surface, sizeClass, styles.trigger, error && control.invalid)}
      aria-describedby={describedBy}
      aria-haspopup="dialog"
      aria-expanded={inline ? undefined : open}
    >
      <span className={styles.triggerSwatch}>
        <span
          className={styles.triggerSwatchFill}
          style={{ backgroundColor: serializeColor(color) }}
        />
      </span>
      <span className={styles.triggerValue}>{serializeColor(color)}</span>
      {!inline ? <ChevronDownIcon className={styles.triggerChevron} size={16} aria-hidden /> : null}
    </button>
  );

  const body = (
    <AriaColorPicker value={color} onChange={handleColorChange}>
      {inline || hideTrigger ? (
        <div className={cx(styles.root, styles[size], className)}>
          {!hideTrigger ? trigger : null}
          <div className={cx(styles.panel, inline && styles.panelInline)}>{panelBody}</div>
        </div>
      ) : (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <div className={cx(styles.root, styles[size], className)}>
            <Popover.Trigger asChild>{trigger}</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className={styles.panel}
                align="start"
                sideOffset={6}
                collisionPadding={12}
                avoidCollisions
              >
                {panelBody}
              </Popover.Content>
            </Popover.Portal>
          </div>
        </Popover.Root>
      )}
    </AriaColorPicker>
  );

  return (
    <PickerFieldShell
      label={label}
      required={required}
      optional={optional}
      description={description}
      error={error}
      inputId={inputId}
    >
      {body}
    </PickerFieldShell>
  );
}

export type ColorHueSliderProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string, color: Color) => void;
  className?: string;
  label?: string;
};

/** Standalone hue slider with live preview swatch. */
export function ColorHueSlider({
  value,
  defaultValue = "#2348ff",
  onChange,
  className,
  label = "Hue",
}: ColorHueSliderProps) {
  const [hex, setHex] = useControllableState<string>({
    value,
    defaultValue,
    onChange: (next) => onChange?.(next, toColor(next)),
  });
  const color = useMemo(() => toColor(hex), [hex]);

  return (
    <AriaColorPicker
      value={color}
      onChange={(next) => setHex(serializeColor(next))}
    >
      <div className={cx(styles.standalone, className)}>
        <div className={styles.standaloneRow}>
          <ColorPreviewSwatch />
          <div className={styles.sliders}>
            <ColorHueSliderControl aria-label={label} />
          </div>
        </div>
      </div>
    </AriaColorPicker>
  );
}

export type ColorAlphaSliderProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string, color: Color) => void;
  className?: string;
  label?: string;
};

/** Standalone transparency / alpha slider with checkered track. */
export function ColorAlphaSlider({
  value,
  defaultValue = "hsla(226, 100%, 57%, 1)",
  onChange,
  className,
  label = "Transparency",
}: ColorAlphaSliderProps) {
  const [hex, setHex] = useControllableState<string>({
    value,
    defaultValue,
    onChange: (next) => onChange?.(next, toColor(next)),
  });
  const color = useMemo(() => toColor(hex), [hex]);

  return (
    <AriaColorPicker
      value={color}
      onChange={(next) => setHex(serializeColor(next))}
    >
      <div className={cx(styles.standalone, className)}>
        <div className={styles.standaloneRow}>
          <ColorPreviewSwatch />
          <div className={styles.sliders}>
            <ColorAlphaSliderControl aria-label={label} />
          </div>
        </div>
      </div>
    </AriaColorPicker>
  );
}
