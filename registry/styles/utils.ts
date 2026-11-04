import { useCallback, useId as useReactId, useState } from "react";

/**
 * Join class names, dropping falsy entries.
 *
 * Intentionally dependency-free: installed components must not pull in a
 * class-merging library the consumer did not choose. Later classes win in CSS
 * by source order, so conditional overrides still work in the common case.
 */
export type ClassValue =
  string | number | bigint | boolean | null | undefined | Record<string, unknown> | ClassValue[];

export function cx(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cx(...input);
      if (nested) out.push(nested);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(" ");
}

/** Prefer an explicit id; otherwise a stable React id. */
export function useId(id?: string): string {
  const generated = useReactId();
  return id ?? generated;
}

export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, setValue];
}
