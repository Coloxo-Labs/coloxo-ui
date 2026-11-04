"use client";
import { CheckIcon, PipetteIcon } from "../../icons";

import { useContext, type CSSProperties } from "react";
import {
  ColorArea as AriaColorArea,
  ColorField as AriaColorField,
  ColorPickerStateContext,
  ColorSlider as AriaColorSlider,
  ColorSwatch as AriaColorSwatch,
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  ColorThumb,
  Input,
  Label,
  parseColor,
  SliderTrack,
  type Color,
  type ColorSpace,
} from "react-aria-components";
import { cx } from "../../utils/cx";
import { IconButton } from "../IconButton/IconButton";
import { Select } from "../Select/Select";
import styles from "./ColorPicker.module.css";

const FORMAT_OPTIONS = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "hsb", label: "HSB" },
] as const;

export type ColorFormat = "hex" | "rgb" | "hsl" | "hsb";

export function isEyeDropperSupported() {
  return typeof window !== "undefined" && "EyeDropper" in window;
}

export function toColor(value: string): Color {
  try {
    return parseColor(value);
  } catch {
    return parseColor("#2348ff");
  }
}

/** Serialize for controlled value + trigger label (keeps alpha when < 1). */
export function serializeColor(color: Color): string {
  try {
    if (color.getChannelValue("alpha") < 1) {
      return color.toString("hexa").toLowerCase();
    }
    return color.toString("hex").toLowerCase();
  } catch {
    return color.toString("css");
  }
}

/** @deprecated use serializeColor */
export function colorToHex(color: Color): string {
  return serializeColor(color);
}

function isLight(color: Color): boolean {
  const rgb = color.toFormat("rgb");
  const r = rgb.getChannelValue("red");
  const g = rgb.getChannelValue("green");
  const b = rgb.getChannelValue("blue");
  // Relative luminance approximation
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export function ColorAreaControl() {
  return (
    <AriaColorArea
      className={styles.area}
      colorSpace="hsb"
      xChannel="saturation"
      yChannel="brightness"
    >
      <ColorThumb className={styles.thumb} />
    </AriaColorArea>
  );
}

export function ColorHueSliderControl({ "aria-label": ariaLabel = "Hue" }: { "aria-label"?: string }) {
  return (
    <AriaColorSlider className={styles.slider} colorSpace="hsb" channel="hue" aria-label={ariaLabel}>
      <SliderTrack className={styles.track}>
        <ColorThumb className={styles.sliderThumb} />
      </SliderTrack>
    </AriaColorSlider>
  );
}

export function ColorAlphaSliderControl({
  "aria-label": ariaLabel = "Transparency",
}: {
  "aria-label"?: string;
}) {
  return (
    <AriaColorSlider className={styles.slider} channel="alpha" aria-label={ariaLabel}>
      <SliderTrack className={cx(styles.track, styles.alphaTrack)}>
        <ColorThumb className={styles.sliderThumb} />
      </SliderTrack>
    </AriaColorSlider>
  );
}

export function ColorPreviewSwatch() {
  return (
    <div className={styles.preview} aria-hidden>
      <AriaColorSwatch className={styles.previewFill} />
    </div>
  );
}

export function EyeDropperButton() {
  const state = useContext(ColorPickerStateContext);
  if (!state || !isEyeDropperSupported()) return null;

  return (
    <IconButton
      variant="secondary"
      size="sm"
      aria-label="Pick color from screen"
      onClick={() => {
        // EyeDropper is Chromium-only; guarded by isEyeDropperSupported().
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const EyeDropperCtor = (window as any).EyeDropper;
        if (!EyeDropperCtor) return;
        new EyeDropperCtor()
          .open()
          .then((result: { sRGBHex: string }) => {
            state.setColor(parseColor(result.sRGBHex));
          })
          .catch(() => {
            /* user cancelled */
          });
      }}
    >
      <PipetteIcon />
    </IconButton>
  );
}

const FORMAT_CHANNELS: Record<
  Exclude<ColorFormat, "hex">,
  { space: ColorSpace; channels: Array<"red" | "green" | "blue" | "hue" | "saturation" | "lightness" | "brightness"> }
> = {
  rgb: { space: "rgb", channels: ["red", "green", "blue"] },
  hsl: { space: "hsl", channels: ["hue", "saturation", "lightness"] },
  hsb: { space: "hsb", channels: ["hue", "saturation", "brightness"] },
};

function channelLabel(channel: string): string {
  if (channel === "hue") return "H";
  if (channel === "saturation") return "S";
  if (channel === "brightness" || channel === "lightness") return channel[0]!.toUpperCase();
  return channel[0]!.toUpperCase();
}

export function ColorFormatFields({
  format,
  onFormatChange,
  showEyeDropper = true,
}: {
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
  showEyeDropper?: boolean;
}) {
  return (
    <div className={styles.tools}>
      {showEyeDropper ? <EyeDropperButton /> : null}
      <div className={styles.formatSelect}>
        <Select
          size="sm"
          aria-label="Color format"
          value={format}
          onValueChange={(next) => onFormatChange(next as ColorFormat)}
          options={[...FORMAT_OPTIONS]}
        />
      </div>
      <div className={styles.fields}>
        {format === "hex" ? (
          <AriaColorField className={styles.field} aria-label="Hex">
            <Label className={styles.fieldLabel}>Hex</Label>
            <Input className={styles.fieldInput} />
          </AriaColorField>
        ) : (
          FORMAT_CHANNELS[format].channels.map((channel) => (
            <AriaColorField
              key={channel}
              className={styles.field}
              colorSpace={FORMAT_CHANNELS[format].space}
              channel={channel}
            >
              <Label className={styles.fieldLabel}>{channelLabel(channel)}</Label>
              <Input className={styles.fieldInput} />
            </AriaColorField>
          ))
        )}
      </div>
    </div>
  );
}

export function SwatchGrid({
  colors,
  size = "md",
}: {
  colors: readonly string[];
  size?: "sm" | "md";
}) {
  return (
    <AriaColorSwatchPicker className={cx(styles.swatchGrid, size === "sm" && styles.swatchGridSm)}>
      {colors.map((hex) => {
        const color = toColor(hex);
        const light = isLight(color);
        return (
          <AriaColorSwatchPickerItem
            key={hex}
            color={color}
            className={cx(styles.swatchItem, size === "sm" && styles.swatchItemSm)}
            style={{ ["--swatch-color" as string]: hex } as CSSProperties}
          >
            {({ isSelected }) =>
              isSelected ? (
                <span className={cx(styles.swatchCheck, light && styles.swatchCheckDark)}>
                  <CheckIcon size={size === "sm" ? 12 : 16} aria-hidden />
                </span>
              ) : null
            }
          </AriaColorSwatchPickerItem>
        );
      })}
    </AriaColorSwatchPicker>
  );
}

export function PaletteGrid({
  palette,
}: {
  palette: Record<string, readonly string[]>;
}) {
  return (
    <div className={styles.palette}>
      {Object.entries(palette).map(([name, colors]) => (
        <div key={name} className={styles.paletteRow}>
          <span className={styles.paletteLabel}>{name}</span>
          <AriaColorSwatchPicker className={styles.swatchGrid} style={{ gridTemplateColumns: `repeat(${colors.length}, 1fr)`, gap: "4px" }}>
            {colors.map((hex) => {
              const color = toColor(hex);
              const light = isLight(color);
              return (
                <AriaColorSwatchPickerItem
                  key={`${name}-${hex}`}
                  color={color}
                  className={cx(styles.swatchItem, styles.swatchItemSm)}
                  style={{ ["--swatch-color" as string]: hex } as CSSProperties}
                >
                  {({ isSelected }) =>
                    isSelected ? (
                      <span className={cx(styles.swatchCheck, light && styles.swatchCheckDark)}>
                        <CheckIcon size={12} aria-hidden />
                      </span>
                    ) : null
                  }
                </AriaColorSwatchPickerItem>
              );
            })}
          </AriaColorSwatchPicker>
        </div>
      ))}
    </div>
  );
}
