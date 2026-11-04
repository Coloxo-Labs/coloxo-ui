"use client";
import { ChevronDownIcon, MinusIcon, PlusIcon } from "../../icons";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
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
import { IconButton } from "../IconButton/IconButton";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";

const GRADIENT_TYPE_OPTIONS = [
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
] as const;
import {
  ColorAlphaSliderControl,
  ColorAreaControl,
  ColorFormatFields,
  ColorHueSliderControl,
  ColorPreviewSwatch,
  serializeColor,
  type ColorFormat,
  toColor,
} from "./ColorParts";
import {
  addStop,
  DEFAULT_GRADIENT,
  gradientToCss,
  removeStop,
  sortStops,
  updateStop,
  type GradientValue,
} from "./gradient";
import styles from "./ColorPicker.module.css";

export type GradientPickerProps = {
  value?: GradientValue;
  defaultValue?: GradientValue;
  onChange?: (value: GradientValue, css: string) => void;
  size?: ControlSize;
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

function GradientStopsEditor({
  value,
  activeStopId,
  onActiveStopIdChange,
  onChange,
}: {
  value: GradientValue;
  activeStopId: string;
  onActiveStopIdChange: (id: string) => void;
  onChange: (next: GradientValue) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<string | null>(null);
  const css = gradientToCss(value);
  const active = value.stops.find((s) => s.id === activeStopId) ?? value.stops[0]!;

  const positionFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingId.current) return;
      onChange(updateStop(value, draggingId.current, { position: positionFromClientX(event.clientX) }));
    },
    [onChange, positionFromClientX, value],
  );

  const endDrag = useCallback(() => {
    draggingId.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
  }, [onPointerMove]);

  const startDrag = (stopId: string, event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    draggingId.current = stopId;
    onActiveStopIdChange(stopId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  };

  return (
    <>
      <div className={styles.gradientPreview} aria-hidden>
        <div className={styles.gradientPreviewFill} style={{ backgroundImage: css }} />
      </div>

      <div
        ref={trackRef}
        className={styles.gradientTrack}
        role="group"
        aria-label="Gradient stops"
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const position = positionFromClientX(event.clientX);
          const next = addStop(value, active.color);
          const added = next.stops[next.stops.length - 1]!;
          const withPos = updateStop(next, added.id, { position });
          onChange(withPos);
          onActiveStopIdChange(added.id);
        }}
      >
        <div className={styles.gradientTrackFill} style={{ backgroundImage: css }} />
        {sortStops(value.stops).map((stop) => (
          <button
            key={stop.id}
            type="button"
            className={styles.gradientStop}
            style={{ left: `${stop.position}%`, background: stop.color }}
            data-active={stop.id === activeStopId ? "true" : undefined}
            aria-label={`Stop at ${stop.position}%`}
            aria-pressed={stop.id === activeStopId}
            onPointerDown={(event) => startDrag(stop.id, event)}
            onClick={() => onActiveStopIdChange(stop.id)}
          />
        ))}
      </div>

      <div className={styles.gradientToolbar}>
        <div className={styles.gradientTypeSelect}>
          <Select
            size="sm"
            aria-label="Gradient type"
            value={value.type}
            onValueChange={(next) =>
              onChange({ ...value, type: next as GradientValue["type"] })
            }
            options={[...GRADIENT_TYPE_OPTIONS]}
          />
        </div>

        {value.type === "linear" ? (
          <label className={styles.gradientMeta}>
            Angle
            <Input
              className={styles.gradientAngleInput}
              type="number"
              size="sm"
              min={0}
              max={360}
              value={value.angle}
              aria-label="Gradient angle"
              onChange={(event) =>
                onChange({ ...value, angle: Number(event.target.value) || 0 })
              }
            />
          </label>
        ) : null}

        <label className={styles.gradientMeta}>
          Stop
          <Input
            className={styles.gradientPositionInput}
            type="number"
            size="sm"
            min={0}
            max={100}
            value={active.position}
            aria-label="Active stop position"
            onChange={(event) =>
              onChange(
                updateStop(value, active.id, {
                  position: Number(event.target.value) || 0,
                }),
              )
            }
          />
          %
        </label>

        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Add stop"
          onClick={() => {
            const next = addStop(value, active.color);
            onChange(next);
            onActiveStopIdChange(next.stops[next.stops.length - 1]!.id);
          }}
        >
          <PlusIcon />
        </IconButton>
        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Remove stop"
          disabled={value.stops.length <= 2}
          onClick={() => {
            const next = removeStop(value, active.id);
            onChange(next);
            if (!next.stops.some((s) => s.id === activeStopId)) {
              onActiveStopIdChange(next.stops[0]!.id);
            }
          }}
        >
          <MinusIcon />
        </IconButton>
      </div>
    </>
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

/** Gradient editor body (preview, stops, active-stop color controls). */
export function GradientPanel({
  value,
  onChange,
  showAlpha = true,
  showEyeDropper = true,
  format,
  onFormatChange,
}: GradientPanelProps) {
  const [activeStopId, setActiveStopId] = useState(value.stops[0]?.id ?? "stop-1");
  const active = value.stops.find((s) => s.id === activeStopId) ?? value.stops[0]!;
  const activeColor = useMemo(() => toColor(active.color), [active.color]);

  const handleColorChange = (next: Color) => {
    onChange(updateStop(value, active.id, { color: serializeColor(next) }));
  };

  return (
    <>
      <GradientStopsEditor
        value={value}
        activeStopId={active.id}
        onActiveStopIdChange={setActiveStopId}
        onChange={onChange}
      />
      <AriaColorPicker value={activeColor} onChange={handleColorChange}>
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
      </AriaColorPicker>
      <code className={styles.gradientCss}>{gradientToCss(value)}</code>
    </>
  );
}

export function GradientPicker({
  value,
  defaultValue = DEFAULT_GRADIENT,
  onChange,
  size = DEFAULT_CONTROL_SIZE,
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
  const describedBy = usePickerAria({ inputId, description, error });
  const [open, setOpen] = usePickerOpen({ open: openProp, defaultOpen, onOpenChange });
  const [format, setFormat] = useControllableState<ColorFormat>({
    value: formatProp,
    defaultValue: defaultFormat,
    onChange: undefined,
  });
  const [gradient, setGradient] = useControllableState<GradientValue>({
    value,
    defaultValue,
    onChange: (next) => onChange?.(next, gradientToCss(next)),
  });

  const sizeClass = getControlSizeClass(size);
  const css = gradientToCss(gradient);

  const handleChange = (next: GradientValue) => {
    setGradient(next);
  };

  const panelBody = (
    <GradientPanel
      value={gradient}
      onChange={handleChange}
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
        <span className={styles.triggerGradientFill} style={{ backgroundImage: css }} />
      </span>
      <span className={styles.triggerValue}>
        {gradient.type === "linear" ? `Linear ${gradient.angle}°` : "Radial"}
      </span>
      {!inline ? <ChevronDownIcon className={styles.triggerChevron} size={16} aria-hidden /> : null}
    </button>
  );

  const body =
    inline || hideTrigger ? (
      <div className={cx(styles.root, styles[size], className)}>
        {!hideTrigger ? trigger : null}
        <div className={cx(styles.panel, styles.panelInline)}>{panelBody}</div>
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
