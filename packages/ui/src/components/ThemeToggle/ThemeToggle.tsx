"use client";

import { useTheme, type ThemeName } from "../../theme/ThemeProvider";
import { cx } from "../../utils/cx";
import styles from "./ThemeToggle.module.css";

const options: { value: ThemeName; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cx(styles.root, className)} role="group" aria-label="Color theme">
      {options.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
            className={cx(styles.option, active && styles.optionActive)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
