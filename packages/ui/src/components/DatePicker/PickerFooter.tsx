"use client";

import { Button } from "../Button/Button";
import styles from "./DatePicker.module.css";

export type PickerFooterProps = {
  onOk: () => void;
  onNow?: () => void;
};

export function PickerFooter({ onOk, onNow }: PickerFooterProps) {
  return (
    <div className={styles.panelFooter}>
      {onNow ? (
        <Button type="button" variant="tertiary" size="sm" onClick={onNow}>
          Now
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" variant="primary" size="sm" onClick={onOk}>
        OK
      </Button>
    </div>
  );
}
