"use client";
import { CheckIcon, CopyIcon } from "../../icons";

import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cx } from "../../utils/cx";
import { getLanguageLabel } from "./languages";
import { tokenizeLines } from "./tokenize";
import type { Token } from "./tokens";
import type { CodeBlockProps } from "./types";
import styles from "./CodeBlock.module.css";

const COPIED_RESET_MS = 2000;

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

function renderTokens(tokens: Token[]) {
  return tokens.map((token, i) =>
    token.type === "plain" ? (
      <Fragment key={i}>{token.value}</Fragment>
    ) : (
      <span key={i} className={styles[token.type]}>
        {token.value}
      </span>
    ),
  );
}

function toCssSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function CodeBlock({
  code,
  language,
  languageLabel,
  label,
  filename,
  theme = "system",
  variant = "default",
  showHeader,
  showLanguage,
  showCopyButton = true,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  showLineNumbers = false,
  startLine = 1,
  highlightLines,
  focusLines,
  wordWrap = false,
  maxHeight,
  maxLines,
  expandable = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const preId = useId();

  const lines = useMemo(() => tokenizeLines(code, language ?? "plaintext"), [code, language]);
  const lineCount = lines.length;

  const highlightSet = useMemo(() => new Set(highlightLines ?? []), [highlightLines]);
  const focusSet = useMemo(() => new Set(focusLines ?? []), [focusLines]);
  const hasFocus = focusSet.size > 0;

  const displayLanguage =
    languageLabel ?? (language ? getLanguageLabel(language) : undefined);
  const languageVisible = (showLanguage ?? true) && Boolean(displayLanguage);

  const hasHeaderContent = Boolean(label || filename || languageVisible || showCopyButton);
  const headerVisible = showHeader ?? hasHeaderContent;
  const isTerminal = variant === "terminal";

  const collapsible = Boolean(maxLines && maxLines > 0 && lineCount > maxLines);
  const collapsed = collapsible && expandable && !expanded;
  const clampLines = Boolean(maxLines && maxLines > 0) && (!expandable || collapsed);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    const ok = await writeToClipboard(code);
    if (!ok) return;
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }, [code]);

  // The scroll container must be keyboard reachable only when it actually scrolls.
  useEffect(() => {
    const el = preRef.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      const next =
        el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
      setScrollable((prev) => (prev === next ? prev : next));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    if (typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(frame);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [code, wordWrap, maxHeight, maxLines, expanded, showLineNumbers]);

  const lastLineNumber = startLine + lineCount - 1;
  const lineNumberDigits = String(Math.max(Math.abs(startLine), Math.abs(lastLineNumber))).length;

  const preStyle: CSSProperties & Record<string, string | number | undefined> = {
    "--cx-code-ln-digits": lineNumberDigits,
  };
  if (clampLines && maxLines) {
    preStyle.maxHeight = `calc(${maxLines} * var(--cx-code-line-height) * 1em + 2 * var(--cx-code-pad-y))`;
  } else if (maxHeight !== undefined) {
    preStyle.maxHeight = toCssSize(maxHeight);
  }

  const copyButton = showCopyButton ? (
    <button
      type="button"
      className={cx(styles.copyButton, !headerVisible && styles.floatingCopy)}
      aria-label={copyLabel === "Copy" ? "Copy code" : copyLabel}
      data-copied={copied ? "true" : "false"}
      onClick={() => void handleCopy()}
    >
      <span className={styles.copyIcon} aria-hidden="true">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
      <span aria-hidden="true">{copied ? copiedLabel : copyLabel}</span>
    </button>
  ) : null;

  const showTitleSeparator = Boolean(label && filename);

  return (
    <div
      className={cx(styles.root, styles[variant], className)}
      data-cx-code-theme={theme}
      data-variant={variant}
    >
      {headerVisible ? (
        <div className={styles.header}>
          <div className={styles.headerStart}>
            {isTerminal ? (
              <span className={styles.dots} aria-hidden="true">
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </span>
            ) : null}
            {label ? <span className={styles.label}>{label}</span> : null}
            {showTitleSeparator ? (
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
            ) : null}
            {filename ? <span className={styles.filename}>{filename}</span> : null}
          </div>
          <div className={styles.headerEnd}>
            {languageVisible ? <span className={styles.language}>{displayLanguage}</span> : null}
            {copyButton}
          </div>
        </div>
      ) : (
        copyButton
      )}

      <pre
        ref={preRef}
        id={preId}
        className={cx(styles.pre, wordWrap && styles.wrap, collapsed && styles.preCollapsed)}
        style={preStyle}
        tabIndex={scrollable ? 0 : undefined}
        data-language={language ?? "plaintext"}
        data-word-wrap={wordWrap ? "true" : undefined}
      >
        <code className={styles.code}>
          {lines.map((tokens, index) => {
            const lineNumber = startLine + index;
            const highlighted = highlightSet.has(lineNumber);
            const dimmed = hasFocus && !focusSet.has(lineNumber);
            return (
              <span
                key={index}
                className={styles.line}
                data-line={lineNumber}
                data-highlighted={highlighted ? "true" : undefined}
                data-dimmed={dimmed ? "true" : undefined}
              >
                {showLineNumbers ? (
                  <span className={styles.lineNumber} aria-hidden="true" data-line-number={lineNumber}>
                    {lineNumber}
                  </span>
                ) : null}
                <span className={styles.lineContent}>{renderTokens(tokens)}</span>
              </span>
            );
          })}
        </code>
      </pre>

      {collapsible && expandable ? (
        <div className={styles.toggleBar}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            aria-controls={preId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      ) : null}

      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}
