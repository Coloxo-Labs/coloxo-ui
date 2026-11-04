"use client";
import { ChevronDownIcon, MinusIcon, PipetteIcon, PlusIcon } from "@/lib/icons";

import { useMemo, useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  ColorArea as AriaColorArea,
  ColorPicker as AriaColorPicker,
  ColorSlider as AriaColorSlider,
  ColorSwatch as AriaColorSwatch,
  ColorThumb,
  parseColor,
  SliderTrack,
  type Color,
} from "react-aria-components";
import { FormField, fieldDescribedBy } from "./form-field";
import { Icon } from "./icon";
import { cx, useControllableState, useId } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  area: "relative h-40 w-full rounded-md",
  field:
    "min-w-0 flex-1 rounded-md border border-solid border-cx-primary bg-cx-primary px-2 py-1 text-sm text-cx-primary",
  format:
    "rounded-md border border-solid border-cx-primary bg-cx-primary px-2 py-1 text-xs font-medium text-cx-secondary",
  invalid: "border-cx-error",
  panel:
    "z-50 flex w-72 flex-col gap-3 rounded-lg border border-solid border-cx-secondary bg-cx-primary p-3 shadow-lg",
  preview:
    "relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-solid border-cx-secondary",
  row: "flex items-center gap-2",
  slider: "flex w-full flex-col gap-1",
  standalone: "flex w-full min-w-48 items-center gap-2",
  swatch: "h-6 w-6 rounded-md border border-solid border-cx-secondary",
  thumb: "h-4 w-4 rounded-full border-2 border-white shadow",
  track: "relative h-3 w-full rounded-full",
  trigger:
    "inline-flex w-full items-center gap-2 rounded-md border border-solid border-cx-primary bg-cx-primary text-left text-cx-primary shadow-sm outline-none focus-visible:border-cx-brand disabled:cursor-not-allowed disabled:opacity-50",
  value: "min-w-0 flex-1 truncate font-mono text-sm",
};

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "min-h-8 px-2.5 text-sm",
  md: "min-h-10 px-3 text-sm",
  lg: "min-h-11 px-3.5 text-base",
};

export const BRAND_SWATCHES = [
  "#eef2ff",
  "#e0e7ff",
  "#c7d2fe",
  "#a5b4fc",
  "#818cf8",
  "#4462ff",
  "#2348ff",
  "#1d3be0",
  "#152dc2",
  "#1b2f91",
] as const;

export const GRAY_SWATCHES = [
  "#fafafa",
  "#f5f5f5",
  "#e5e5e5",
  "#d4d4d4",
  "#a1a1a1",
  "#737373",
  "#525252",
  "#404040",
  "#262626",
  "#171717",
] as const;

export const DEFAULT_SWATCHES = [
  "#2348ff",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#4b5563",
  "#ffffff",
  "#0a0a0a",
] as const;

export const COLOR_PALETTE: Record<string, readonly string[]> = {
  brand: BRAND_SWATCHES,
  gray: GRAY_SWATCHES,
  red: ["#fef2f2", "#fecaca", "#f87171", "#ef4444", "#b91c1c", "#7f1d1d"],
  orange: ["#fff7ed", "#fed7aa", "#fb923c", "#f97316", "#c2410c", "#7c2d12"],
  amber: ["#fffbeb", "#fde68a", "#fbbf24", "#f59e0b", "#b45309", "#78350f"],
  yellow: ["#fefce8", "#fde047", "#eab308", "#ca8a04", "#a16207", "#713f12"],
  lime: ["#f7fee7", "#bef264", "#84cc16", "#65a30d", "#4d7c0f", "#365314"],
  green: ["#f0fdf4", "#86efac", "#22c55e", "#16a34a", "#15803d", "#14532d"],
  teal: ["#f0fdfa", "#5eead4", "#14b8a6", "#0d9488", "#0f766e", "#134e4a"],
  cyan: ["#ecfeff", "#67e8f9", "#06b6d4", "#0891b2", "#0e7490", "#164e63"],
  blue: ["#eff6ff", "#93c5fd", "#3b82f6", "#2563eb", "#1d4ed8", "#1e3a8a"],
  indigo: ["#eef2ff", "#a5b4fc", "#6366f1", "#4f46e5", "#4338ca", "#312e81"],
  violet: ["#f5f3ff", "#c4b5fd", "#8b5cf6", "#7c3aed", "#6d28d9", "#4c1d95"],
  purple: ["#faf5ff", "#d8b4fe", "#a855f7", "#9333ea", "#7e22ce", "#581c87"],
  fuchsia: ["#fdf4ff", "#f0abfc", "#d946ef", "#c026d3", "#a21caf", "#701a75"],
  pink: ["#fdf2f8", "#f9a8d4", "#ec4899", "#db2777", "#be185d", "#831843"],
  rose: ["#fff1f2", "#fda4af", "#f43f5e", "#e11d48", "#be123c", "#881337"],
};

export type GradientType = "linear" | "radial";

export type GradientStop = {
  id: string;
  color: string;
  /** 0–100 */
  position: number;
};

export type GradientValue = {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
};

export const DEFAULT_GRADIENT: GradientValue = {
  type: "linear",
  angle: 90,
  stops: [
    { id: "stop-1", color: "#2348ff", position: 0 },
    { id: "stop-2", color: "#db2777", position: 100 },
  ],
};

let stopSeq = 0;
export function createStopId() {
  stopSeq += 1;
  return `stop-${Date.now()}-${stopSeq}`;
}

export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function gradientToCss(value: GradientValue): string {
  const stops = sortStops(value.stops)
    .map((stop) => `${stop.color} ${clamp(stop.position, 0, 100)}%`)
    .join(", ");
  if (value.type === "radial") return `radial-gradient(circle, ${stops})`;
  return `linear-gradient(${clamp(value.angle, 0, 360)}deg, ${stops})`;
}

export function updateStop(
  value: GradientValue,
  stopId: string,
  patch: Partial<Pick<GradientStop, "color" | "position">>,
): GradientValue {
  return {
    ...value,
    stops: value.stops.map((stop) =>
      stop.id === stopId
        ? {
            ...stop,
            ...patch,
            position: patch.position != null ? clamp(patch.position, 0, 100) : stop.position,
          }
        : stop,
    ),
  };
}

export function addStop(value: GradientValue, color = "#ffffff"): GradientValue {
  const sorted = sortStops(value.stops);
  const mid =
    sorted.length >= 2 ? (sorted[0]!.position + sorted[sorted.length - 1]!.position) / 2 : 50;
  return {
    ...value,
    stops: [...value.stops, { id: createStopId(), color, position: Math.round(mid) }],
  };
}

export function removeStop(value: GradientValue, stopId: string): GradientValue {
  if (value.stops.length <= 2) return value;
  return { ...value, stops: value.stops.filter((stop) => stop.id !== stopId) };
}

export type ColorFormat = "hex" | "rgb" | "hsl" | "hsb";
export type ColorPickerSize = "sm" | "md" | "lg";
export type ColorPickerVariant = "solid" | "minimal" | "swatches" | "brand" | "gray" | "palette";

type EyeDropperLike = { open: () => Promise<{ sRGBHex: string }> };

function eyeDropperCtor(): (new () => EyeDropperLike) | undefined {
  if (typeof window === "undefined" || !("EyeDropper" in window)) return undefined;
  return (window as Window & { EyeDropper?: new () => EyeDropperLike }).EyeDropper;
}

function usePickerFieldIds(id?: string) {
  return { inputId: useId(id) };
}

function usePickerOpen(options: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}): [boolean, (next: boolean) => void] {
  return useControllableState({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });
}

function PickerFieldShell({
  label,
  required,
  optional,
  description,
  error,
  inputId,
  children,
}: {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  inputId: string;
  children: ReactNode;
}) {
  if (!label && !description && !error) return children;
  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      optional={optional}
      description={description}
      error={error}
    >
      {children}
    </FormField>
  );
}

export function toColor(value: string): Color {
  try {
    return parseColor(value);
  } catch {
    return parseColor("#2348ff");
  }
}

export function serializeColor(color: Color): string {
  try {
    if (color.getChannelValue("alpha") < 1) return color.toString("hexa").toLowerCase();
    return color.toString("hex").toLowerCase();
  } catch {
    return color.toString("css");
  }
}

function formatColor(color: Color, format: ColorFormat): string {
  if (format === "hex") return serializeColor(color);
  try {
    return color.toString(format);
  } catch {
    return serializeColor(color);
  }
}

function tryParseColor(value: string): Color | undefined {
  try {
    return parseColor(value);
  } catch {
    return undefined;
  }
}

function resolveSwatches(variant: ColorPickerVariant, swatches?: readonly string[]) {
  if (swatches?.length) return swatches;
  if (variant === "brand") return BRAND_SWATCHES;
  if (variant === "gray") return GRAY_SWATCHES;
  return DEFAULT_SWATCHES;
}

function HueSlider({ label = "Hue" }: { label?: string }) {
  return (
    <AriaColorSlider className={CX.slider} colorSpace="hsb" channel="hue" aria-label={label}>
      <SliderTrack className={CX.track}>
        <ColorThumb className={CX.thumb} />
      </SliderTrack>
    </AriaColorSlider>
  );
}

function AlphaSlider({ label = "Transparency" }: { label?: string }) {
  return (
    <AriaColorSlider className={CX.slider} channel="alpha" aria-label={label}>
      <SliderTrack className={CX.track}>
        <ColorThumb className={CX.thumb} />
      </SliderTrack>
    </AriaColorSlider>
  );
}

function SwatchButtons({
  colors,
  onSelect,
}: {
  colors: readonly string[];
  onSelect: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={CX.swatch}
          style={{ backgroundColor: color }}
          aria-label={color}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  );
}

function FormatRow({
  color,
  format,
  onFormatChange,
  onColor,
  showEyeDropper,
}: {
  color: Color;
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
  onColor: (color: Color) => void;
  showEyeDropper: boolean;
}) {
  const shown = formatColor(color, format);
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className={CX.row}>
      <select
        className={CX.format}
        aria-label="Color format"
        value={format}
        onChange={(event) => {
          setDraft(null);
          onFormatChange(event.target.value as ColorFormat);
        }}
      >
        <option value="hex">HEX</option>
        <option value="rgb">RGB</option>
        <option value="hsl">HSL</option>
        <option value="hsb">HSB</option>
      </select>
      <input
        className={CX.field}
        aria-label="Color value"
        value={draft ?? shown}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          const parsed = tryParseColor(next);
          if (parsed) onColor(parsed);
        }}
        onBlur={() => setDraft(null)}
      />
      {showEyeDropper && eyeDropperCtor() ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-cx-secondary"
          aria-label="Pick color from screen"
          onClick={() => {
            const Ctor = eyeDropperCtor();
            if (!Ctor) return;
            void new Ctor().open().then((result) => {
              const parsed = tryParseColor(result.sRGBHex);
              if (parsed) onColor(parsed);
            });
          }}
        >
          <Icon size="sm">
            <PipetteIcon />
          </Icon>
        </button>
      ) : null}
    </div>
  );
}

function Spectrum({ showAlpha, label }: { showAlpha: boolean; label?: string }) {
  return (
    <>
      <AriaColorArea
        className={CX.area}
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
      >
        <ColorThumb className={CX.thumb} />
      </AriaColorArea>
      <div className={CX.row}>
        <AriaColorSwatch className={CX.preview} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <HueSlider label={label} />
          {showAlpha ? <AlphaSlider /> : null}
        </div>
      </div>
    </>
  );
}

export type ColorPickerProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string, color: Color) => void;
  variant?: ColorPickerVariant;
  size?: ColorPickerSize;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  swatches?: readonly string[];
  swatchSize?: "sm" | "md";
  showAlpha?: boolean;
  showEyeDropper?: boolean;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  inline?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  className?: string;
  hideTrigger?: boolean;
};

export function ColorPicker({
  value,
  defaultValue = "#2348ff",
  onChange,
  variant = "solid",
  size = "md",
  label,
  description,
  error,
  required,
  optional,
  disabled,
  swatches: swatchesProp,
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
  const describedBy = fieldDescribedBy({ id: inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const [format, setFormat] = useControllableState<ColorFormat>({
    value: formatProp,
    defaultValue: defaultFormat,
    onChange: onFormatChange,
  });
  const [hex, setHex] = useControllableState<string>({
    value,
    defaultValue,
    onChange: (next) => onChange?.(next, toColor(next)),
  });
  const color = useMemo(() => toColor(hex), [hex]);
  const swatches = useMemo(
    () => (variant === "solid" ? (swatchesProp ?? []) : resolveSwatches(variant, swatchesProp)),
    [variant, swatchesProp],
  );

  const apply = (next: Color) => setHex(serializeColor(next));

  const panel = (
    <AriaColorPicker value={color} onChange={apply}>
      <div className="flex flex-col gap-3">
        {variant === "swatches" || variant === "brand" || variant === "gray" ? (
          <SwatchButtons colors={swatches} onSelect={(next) => setHex(next)} />
        ) : null}
        {variant === "palette"
          ? Object.entries(COLOR_PALETTE).map(([name, colors]) => (
              <SwatchButtons key={name} colors={colors} onSelect={(next) => setHex(next)} />
            ))
          : null}
        {variant === "minimal" ? (
          <div className={CX.row}>
            <AriaColorSwatch className={CX.preview} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <HueSlider />
              {showAlpha ? <AlphaSlider /> : null}
            </div>
          </div>
        ) : null}
        {variant === "solid" ? <Spectrum showAlpha={showAlpha} /> : null}
        {variant === "palette" && showAlpha ? <AlphaSlider /> : null}
        {variant === "solid" && swatches.length > 0 ? (
          <SwatchButtons colors={swatches} onSelect={(next) => setHex(next)} />
        ) : null}
        <FormatRow
          color={color}
          format={format}
          onFormatChange={setFormat}
          onColor={apply}
          showEyeDropper={showEyeDropper}
        />
      </div>
    </AriaColorPicker>
  );

  const trigger = (
    <button
      type="button"
      id={inputId}
      disabled={disabled}
      className={cx(CX.trigger, SIZE[size], error && CX.invalid)}
      aria-describedby={describedBy}
      aria-haspopup="dialog"
      aria-expanded={inline ? undefined : open}
    >
      <span className={CX.swatch} style={{ backgroundColor: serializeColor(color) }} />
      <span className={CX.value}>{serializeColor(color)}</span>
      {inline ? null : (
        <Icon size="sm">
          <ChevronDownIcon />
        </Icon>
      )}
    </button>
  );

  const body =
    inline || hideTrigger ? (
      <div className={cx("flex w-full flex-col gap-2", className)}>
        {hideTrigger ? null : trigger}
        <div className={cx(CX.panel, "relative z-0 w-full shadow-none")}>{panel}</div>
      </div>
    ) : (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <div className={className}>
          <Popover.Trigger asChild>{trigger}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className={CX.panel} align="start" sideOffset={6}>
              {panel}
            </Popover.Content>
          </Popover.Portal>
        </div>
      </Popover.Root>
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
    <AriaColorPicker value={color} onChange={(next) => setHex(serializeColor(next))}>
      <div className={cx(CX.standalone, className)}>
        <AriaColorSwatch className={CX.preview} />
        <HueSlider label={label} />
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
    <AriaColorPicker value={color} onChange={(next) => setHex(serializeColor(next))}>
      <div className={cx(CX.standalone, className)}>
        <AriaColorSwatch className={CX.preview} />
        <AlphaSlider label={label} />
      </div>
    </AriaColorPicker>
  );
}

export type GradientPanelProps = {
  value: GradientValue;
  onChange: (next: GradientValue) => void;
  showAlpha?: boolean;
  showEyeDropper?: boolean;
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
};

export function GradientPanel({
  value,
  onChange,
  showAlpha = true,
  showEyeDropper = true,
  format,
  onFormatChange,
}: GradientPanelProps) {
  const [activeStopId, setActiveStopId] = useState(value.stops[0]?.id ?? "stop-1");
  const active = value.stops.find((stop) => stop.id === activeStopId) ?? value.stops[0]!;
  const activeColor = useMemo(() => toColor(active.color), [active.color]);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-10 rounded-md border border-solid border-cx-secondary"
        style={{ background: gradientToCss(value) }}
      />
      <div className={CX.row}>
        <select
          className={CX.format}
          aria-label="Gradient type"
          value={value.type}
          onChange={(event) => onChange({ ...value, type: event.target.value as GradientType })}
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
        {value.type === "linear" ? (
          <input
            className={CX.field}
            aria-label="Angle"
            type="number"
            min={0}
            max={360}
            value={value.angle}
            onChange={(event) => onChange({ ...value, angle: Number(event.target.value) })}
          />
        ) : null}
        <button
          type="button"
          className={CX.format}
          aria-label="Add stop"
          onClick={() => onChange(addStop(value))}
        >
          <Icon size="sm">
            <PlusIcon />
          </Icon>
        </button>
      </div>
      {sortStops(value.stops).map((stop) => (
        <div key={stop.id} className={CX.row}>
          <button
            type="button"
            className={cx(CX.swatch, stop.id === active.id && "ring-2 ring-cx-brand")}
            style={{ backgroundColor: stop.color }}
            aria-label={`Edit stop ${stop.color}`}
            onClick={() => setActiveStopId(stop.id)}
          />
          <input
            className={CX.field}
            aria-label="Stop position"
            type="range"
            min={0}
            max={100}
            value={stop.position}
            onChange={(event) =>
              onChange(updateStop(value, stop.id, { position: Number(event.target.value) }))
            }
          />
          <button
            type="button"
            className={CX.format}
            aria-label="Remove stop"
            onClick={() => {
              const next = removeStop(value, stop.id);
              onChange(next);
              if (!next.stops.some((item) => item.id === activeStopId)) {
                setActiveStopId(next.stops[0]!.id);
              }
            }}
          >
            <Icon size="sm">
              <MinusIcon />
            </Icon>
          </button>
        </div>
      ))}
      <AriaColorPicker
        value={activeColor}
        onChange={(next) => onChange(updateStop(value, active.id, { color: serializeColor(next) }))}
      >
        <Spectrum showAlpha={showAlpha} />
        <FormatRow
          color={activeColor}
          format={format}
          onFormatChange={onFormatChange}
          onColor={(next) =>
            onChange(updateStop(value, active.id, { color: serializeColor(next) }))
          }
          showEyeDropper={showEyeDropper}
        />
      </AriaColorPicker>
      <code className="truncate text-xs text-cx-tertiary">{gradientToCss(value)}</code>
    </div>
  );
}

export type GradientPickerProps = {
  value?: GradientValue;
  defaultValue?: GradientValue;
  onChange?: (value: GradientValue, css: string) => void;
  size?: ColorPickerSize;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  showAlpha?: boolean;
  showEyeDropper?: boolean;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  inline?: boolean;
  hideTrigger?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  className?: string;
};

export function GradientPicker({
  value,
  defaultValue = DEFAULT_GRADIENT,
  onChange,
  size = "md",
  label,
  description,
  error,
  required,
  optional,
  disabled,
  showAlpha = true,
  showEyeDropper = true,
  format: formatProp,
  defaultFormat = "hex",
  inline = false,
  hideTrigger = false,
  open: openProp,
  defaultOpen,
  onOpenChange,
  id,
  className,
}: GradientPickerProps) {
  const { inputId } = usePickerFieldIds(id);
  const describedBy = fieldDescribedBy({ id: inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const [format, setFormat] = useControllableState<ColorFormat>({
    value: formatProp,
    defaultValue: defaultFormat,
  });
  const [gradient, setGradient] = useControllableState<GradientValue>({
    value,
    defaultValue,
    onChange: (next) => onChange?.(next, gradientToCss(next)),
  });

  const panel = (
    <GradientPanel
      value={gradient}
      onChange={setGradient}
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
      className={cx(CX.trigger, SIZE[size], error && CX.invalid)}
      aria-describedby={describedBy}
      aria-haspopup="dialog"
      aria-expanded={inline ? undefined : open}
    >
      <span
        className="h-6 w-6 rounded-md border border-solid border-cx-secondary"
        style={{ background: gradientToCss(gradient) }}
      />
      <span className={CX.value}>{gradient.type}</span>
      {inline ? null : (
        <Icon size="sm">
          <ChevronDownIcon />
        </Icon>
      )}
    </button>
  );

  const body =
    inline || hideTrigger ? (
      <div className={cx("flex w-full flex-col gap-2", className)}>
        {hideTrigger ? null : trigger}
        <div className={cx(CX.panel, "relative z-0 w-full shadow-none")}>{panel}</div>
      </div>
    ) : (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <div className={className}>
          <Popover.Trigger asChild>{trigger}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className={cx(CX.panel, "w-80")} align="start" sideOffset={6}>
              {panel}
            </Popover.Content>
          </Popover.Portal>
        </div>
      </Popover.Root>
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
