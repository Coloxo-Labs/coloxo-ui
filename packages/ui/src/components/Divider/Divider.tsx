"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as Separator from "@radix-ui/react-separator";
import { cx } from "../../utils/cx";
import styles from "./Divider.module.css";

export type DividerSpacing = "compact" | "default" | "relaxed";

type DividerShared = Omit<
  ComponentPropsWithoutRef<typeof Separator.Root>,
  "orientation" | "decorative"
> & {
  /** Vertical rhythm around the rule. Default `default` (16px). */
  spacing?: DividerSpacing;
  /**
   * When true (default), the separator is presentational and omitted from the
   * accessibility tree. When false, it is announced as a thematic break.
   */
  decorative?: boolean;
  /** Inset the stroke from container edges (full-bleed off). */
  inset?: boolean;
  /** Lower-contrast stroke for secondary partitions. */
  subtle?: boolean;
  /**
   * Vertical only: stretch to the flex cross-axis instead of the default
   * 20px inline hairline (matches Figma toolbar / utility-bar specimen).
   */
  stretch?: boolean;
};

export type HorizontalDividerProps = DividerShared & {
  orientation?: "horizontal";
  /** Centered label / badge slot. Horizontal only. */
  label?: ReactNode;
};

export type VerticalDividerProps = DividerShared & {
  orientation: "vertical";
  /** Labels are not supported on vertical dividers. */
  label?: never;
};

export type DividerProps = HorizontalDividerProps | VerticalDividerProps;

function spacingClass(spacing: DividerSpacing, orientation: "horizontal" | "vertical") {
  if (orientation === "vertical") {
    return styles[`spacingInline-${spacing}`];
  }
  return styles[`spacingBlock-${spacing}`];
}

export function Divider(props: DividerProps) {
  const orientation = props.orientation ?? "horizontal";
  const decorative = props.decorative ?? true;
  const spacing = props.spacing ?? "default";
  const inset = props.inset;
  const subtle = props.subtle;
  const stretch = props.stretch;
  const className = props.className;
  const label = orientation === "horizontal" ? (props as HorizontalDividerProps).label : undefined;

  const {
    orientation: _orientation,
    decorative: _decorative,
    spacing: _spacing,
    inset: _inset,
    subtle: _subtle,
    stretch: _stretch,
    label: _label,
    className: _className,
    ...radixRest
  } = props as HorizontalDividerProps & { stretch?: boolean };

  const toneClass = subtle ? styles.subtle : undefined;
  const insetClass = inset ? styles.inset : undefined;
  const spaceClass = spacingClass(spacing, orientation);

  if (label != null && orientation === "horizontal") {
    const labelText = typeof label === "string" ? label : undefined;
    return (
      <div
        className={cx(styles.labeled, spaceClass, insetClass, toneClass, className)}
        role={decorative ? "none" : "separator"}
        aria-hidden={decorative ? true : undefined}
        aria-orientation={decorative ? undefined : "horizontal"}
        aria-label={!decorative && labelText ? labelText : undefined}
        data-orientation="horizontal"
        data-spacing={spacing}
        data-inset={inset || undefined}
        data-subtle={subtle || undefined}
      >
        <span className={cx(styles.root, styles.labeledLine)} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        <span className={cx(styles.root, styles.labeledLine)} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Separator.Root
      decorative={decorative}
      orientation={orientation}
      className={cx(
        styles.root,
        orientation === "vertical" && styles.vertical,
        orientation === "vertical" && stretch && styles.verticalStretch,
        spaceClass,
        insetClass,
        toneClass,
        className,
      )}
      data-spacing={spacing}
      data-inset={inset || undefined}
      data-subtle={subtle || undefined}
      data-stretch={stretch || undefined}
      {...radixRest}
    />
  );
}
