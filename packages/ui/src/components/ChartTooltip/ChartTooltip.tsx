"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type SVGProps,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ChartTooltip.module.css";

export type ChartTooltipItem = {
  label: string;
  value: string;
  color: string;
  supportingText?: string;
};

export type ChartTooltipProps = {
  label: string;
  items: ChartTooltipItem[];
  /** A focusable chart mark, such as an SVG rect or path. */
  children: ReactElement<SVGProps<SVGElement>>;
};

/** Shared, theme-aware details for chart marks on hover and keyboard focus. */
export function ChartTooltip({ label, items, children }: ChartTooltipProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<SVGElement | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef(false);
  const focused = useRef(false);

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }
  function closeSoon() {
    cancelClose();
    if (!focused.current) closeTimer.current = setTimeout(() => setAnchor(null), 100);
  }

  useLayoutEffect(() => {
    if (!anchor || !tooltipRef.current) return;
    const mark = anchor.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const padding = 12;
    const left = Math.max(
      padding,
      Math.min(
        mark.left + mark.width / 2 - tooltip.width / 2,
        window.innerWidth - tooltip.width - padding,
      ),
    );
    const above = mark.top - tooltip.height - 8;
    const top = Math.max(
      padding,
      Math.min(
        above >= padding ? above : mark.bottom + 8,
        window.innerHeight - tooltip.height - padding,
      ),
    );
    setPosition({ left, top });
  }, [anchor, label, items]);

  useEffect(() => {
    if (!anchor) return;
    const dismiss = () => {
      cancelClose();
      setAnchor(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      cancelClose();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [anchor]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <>
      {cloneElement(children, {
        "aria-describedby":
          [children.props["aria-describedby"], anchor ? id : undefined].filter(Boolean).join(" ") ||
          undefined,
        onPointerEnter: (event) => {
          children.props.onPointerEnter?.(event);
          if (event.defaultPrevented || event.pointerType === "touch") return;
          hovered.current = true;
          cancelClose();
          setAnchor(event.currentTarget);
        },
        onPointerLeave: (event) => {
          children.props.onPointerLeave?.(event);
          hovered.current = false;
          closeSoon();
        },
        onFocus: (event) => {
          children.props.onFocus?.(event);
          if (event.defaultPrevented) return;
          focused.current = true;
          cancelClose();
          setAnchor(event.currentTarget);
        },
        onBlur: (event) => {
          children.props.onBlur?.(event);
          focused.current = false;
          if (!hovered.current) {
            cancelClose();
            setAnchor(null);
          }
        },
      })}
      {anchor &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            className={styles.content}
            style={position}
            onPointerEnter={() => {
              hovered.current = true;
              cancelClose();
            }}
            onPointerLeave={() => {
              hovered.current = false;
              closeSoon();
            }}
          >
            <div className={styles.heading}>{label}</div>
            <div className={styles.items}>
              {items.map((item, index) => (
                <div className={styles.item} key={index}>
                  <span
                    className={styles.swatch}
                    style={{ background: item.color }}
                    aria-hidden="true"
                  />
                  <span className={styles.label}>{item.label}</span>
                  <span className={styles.value}>
                    {item.value}
                    {item.supportingText && (
                      <span className={styles.supporting}>{item.supportingText}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            {/* Portal to body so ancestor transforms (e.g. gallery preview hover scale) do not clip/offset fixed tooltips. */}
          </div>,
          document.body,
        )}
    </>
  );
}
