"use client";
import { XIcon } from "../../icons";

import { Icon } from "../Icon/Icon";
import {
  DEFAULT_CONTROL_SIZE,
  getControlIconSize,
  type ControlSize,
} from "../_internal/controlSize";
import styles from "./DatePicker.module.css";

export type ClearControlProps = {
  visible: boolean;
  onClear: () => void;
  label?: string;
  size?: ControlSize;
};

export function ClearControl({
  visible,
  onClear,
  label = "Clear",
  size = DEFAULT_CONTROL_SIZE,
}: ClearControlProps) {
  if (!visible) return null;
  return (
    <span
      role="button"
      className={styles.clear}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClear();
      }}
    >
      <Icon size={getControlIconSize(size)}>
        <XIcon />
      </Icon>
    </span>
  );
}
