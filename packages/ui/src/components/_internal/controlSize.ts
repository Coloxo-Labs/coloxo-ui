import type { IconSize } from "../Icon/Icon";
import control from "./Control.module.css";

/** Shared form-control size scale used by Input, Select, and pickers. */
export type ControlSize = "sm" | "md" | "lg";

export const DEFAULT_CONTROL_SIZE: ControlSize = "md";

/** Leading/trailing icon box size for a given control size. */
export function getControlIconSize(size: ControlSize): IconSize {
  if (size === "sm") return "sm";
  if (size === "lg") return "lg";
  return "md";
}

/** Resolve Control.module.css size class with static access (CSS Modules safe). */
export function getControlSizeClass(size: ControlSize): string {
  if (size === "sm") return control.sm ?? "";
  if (size === "lg") return control.lg ?? "";
  return control.md ?? "";
}
