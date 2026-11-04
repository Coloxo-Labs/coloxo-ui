"use client";
import { SearchIcon } from "../../icons";

import { useMemo, type ChangeEvent, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import control from "../_internal/Control.module.css";
import styles from "./DocsSearch.module.css";

export type DocsSearchItem = {
  id: string;
  label: string;
  description?: string;
  href?: string;
};

export type DocsSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (id: string) => void;
  items?: DocsSearchItem[];
  placeholder?: string;
  className?: string;
  hotkey?: ReactNode;
};

function filterItems(items: DocsSearchItem[], query: string): DocsSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q),
  );
}

export function DocsSearch({
  value,
  onChange,
  onSelect,
  items,
  placeholder = "Search components…",
  className,
  hotkey,
}: DocsSearchProps) {
  const filtered = useMemo(
    () => (items && value.trim() ? filterItems(items, value) : []),
    [items, value],
  );

  const showDropdown = Boolean(items && value.trim() && filtered.length > 0);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleSelect = (id: string) => {
    onSelect?.(id);
  };

  return (
    <div className={cx(styles.root, className)}>
      <div
        className={cx(
          control.surface,
          styles.field,
          hotkey && styles.hasHotkey,
        )}
      >
        <span className={styles.leadingIcon} aria-hidden="true">
          <Icon size="sm">
            <SearchIcon />
          </Icon>
        </span>
        <input
          type="search"
          className={styles.input}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
        />
        {hotkey ? <span className={styles.hotkey}>{hotkey}</span> : null}
      </div>
      {showDropdown ? (
        <ul className={styles.dropdown} role="listbox">
          {filtered.map((item) => (
            <li key={item.id} role="option">
              <button
                type="button"
                className={styles.option}
                onClick={() => handleSelect(item.id)}
              >
                <span className={styles.optionLabel}>{item.label}</span>
                {item.description ? (
                  <span className={styles.optionDescription}>{item.description}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
