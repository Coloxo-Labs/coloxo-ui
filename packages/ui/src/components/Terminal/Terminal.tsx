"use client";
import { CheckIcon, CopyIcon } from "../../icons";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cx } from "../../utils/cx";
import { getDefaultPrompt, getShellLabel, shouldShowCwdLine } from "./shells";
import type { TerminalCommand, TerminalProps, TerminalStatus } from "./types";
import styles from "./Terminal.module.css";

const COPIED_RESET_MS = 2000;

const STATUS_MARK: Record<Exclude<TerminalStatus, "default">, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
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

function toCssSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function normalizeOutput(output: string | string[] | undefined): string[] {
  if (output === undefined) return [];
  if (Array.isArray(output)) return output;
  return output.split("\n");
}

function commandsToCopyText(commands: TerminalCommand[]): string {
  return commands.map((entry) => entry.command).join("\n");
}

function paddingClass(padding: NonNullable<TerminalProps["padding"]>) {
  if (padding === "sm") return styles.paddingSm;
  if (padding === "lg") return styles.paddingLg;
  return styles.paddingMd;
}

function fontClass(fontSize: NonNullable<TerminalProps["fontSize"]>) {
  if (fontSize === "sm") return styles.fontSm;
  if (fontSize === "lg") return styles.fontLg;
  return styles.fontMd;
}

function cursorClass(cursor: NonNullable<TerminalProps["cursor"]>) {
  if (cursor === "line") return styles.cursorLineShape;
  if (cursor === "underline") return styles.cursorUnderline;
  return styles.cursorBlock;
}

export function Terminal({
  commands,
  content,
  shell = "bash",
  shellLabel,
  title,
  cwd,
  showWindowControls = true,
  showShell = true,
  showPrompt = true,
  prompt,
  showCursor = true,
  cursor = "block",
  cursorBlink = true,
  theme = "dark",
  variant = "default",
  padding = "md",
  fontSize = "md",
  maxHeight,
  scrollable = true,
  selectable = true,
  showCopyButton = false,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
}: TerminalProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyId = useId();

  const resolvedPrompt = prompt ?? getDefaultPrompt(shell, cwd);
  const resolvedShellLabel = shellLabel ?? getShellLabel(shell);
  const showCwd = shouldShowCwdLine(shell, cwd);
  const hasCommands = Boolean(commands && commands.length > 0);
  const hasRaw = Boolean(content && content.length > 0);

  const headerVisible =
    variant !== "minimal" &&
    variant !== "inline" &&
    (showWindowControls || showShell || Boolean(title) || showCopyButton);

  const copyPayload = useMemo(() => {
    if (hasCommands && commands) return commandsToCopyText(commands);
    if (hasRaw && content) return content;
    return "";
  }, [commands, content, hasCommands, hasRaw]);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (!copyPayload) return;
    const ok = await writeToClipboard(copyPayload);
    if (!ok) return;
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }, [copyPayload]);

  const bodyStyle: CSSProperties = {};
  if (maxHeight !== undefined) {
    bodyStyle.maxHeight = toCssSize(maxHeight);
  }

  const copyButton = showCopyButton ? (
    <button
      type="button"
      className={cx(styles.copyButton, !headerVisible && styles.floatingCopy)}
      aria-label={copyLabel === "Copy" ? "Copy commands" : copyLabel}
      data-copied={copied ? "true" : "false"}
      onClick={() => void handleCopy()}
    >
      <span className={styles.copyIcon} aria-hidden="true">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
      <span aria-hidden="true">{copied ? copiedLabel : copyLabel}</span>
    </button>
  ) : null;

  return (
    <div
      className={cx(
        styles.root,
        styles[variant],
        paddingClass(padding),
        fontClass(fontSize),
        !selectable && styles.unselectable,
        className,
      )}
      data-cx-terminal-theme={theme}
      data-variant={variant}
      data-shell={shell}
    >
      {headerVisible ? (
        <div className={styles.header}>
          <div className={styles.headerStart}>
            {showWindowControls ? (
              <span className={styles.dots} aria-hidden="true">
                <span className={cx(styles.dot, styles.dotClose)} />
                <span className={cx(styles.dot, styles.dotMin)} />
                <span className={cx(styles.dot, styles.dotMax)} />
              </span>
            ) : null}
            {title ? <span className={styles.title}>{title}</span> : null}
          </div>
          <div className={styles.headerEnd}>
            {showShell ? <span className={styles.shell}>{resolvedShellLabel}</span> : null}
            {copyButton}
          </div>
        </div>
      ) : (
        copyButton
      )}

      <pre
        id={bodyId}
        className={cx(styles.body, !scrollable && styles.bodyNoScroll)}
        style={bodyStyle}
        tabIndex={scrollable && maxHeight !== undefined ? 0 : undefined}
      >
        {showCwd && cwd ? <span className={styles.cwd}>{cwd}</span> : null}

        {hasCommands && commands
          ? commands.map((entry, index) => {
              const lines = normalizeOutput(entry.output);
              const status = entry.status ?? "default";
              const mark =
                status !== "default" && lines.length > 0 ? STATUS_MARK[status] : undefined;
              return (
                <span key={index} className={styles.block}>
                  <span className={styles.commandLine}>
                    {showPrompt ? (
                      <span className={styles.prompt} aria-hidden="true">
                        {resolvedPrompt}
                      </span>
                    ) : null}
                    <span className={styles.command}>{entry.command}</span>
                  </span>
                  {lines.length > 0 ? (
                    <span className={styles.output} data-status={status}>
                      {lines.map((line, lineIndex) => (
                        <span key={lineIndex} className={styles.outputLine}>
                          {lineIndex === 0 && mark ? (
                            <span className={styles.statusMark} aria-hidden="true">
                              {mark}{" "}
                            </span>
                          ) : null}
                          {line}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              );
            })
          : null}

        {hasRaw && !hasCommands ? <span className={styles.raw}>{content}</span> : null}

        {showCursor ? (
          <span className={styles.cursorLine} aria-hidden="true">
            {showPrompt ? <span className={styles.prompt}>{resolvedPrompt}</span> : null}
            <span
              className={cx(
                styles.cursor,
                cursorClass(cursor),
                cursorBlink && styles.cursorBlink,
              )}
            >
              █
            </span>
          </span>
        ) : null}
      </pre>

      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
