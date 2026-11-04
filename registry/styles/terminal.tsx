"use client";
import { CheckIcon, CopyIcon } from "@/lib/icons";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  block: "block last:mb-0",
  body: "flex-1 m-0 overflow-auto bg-transparent whitespace-pre-wrap",
  bodyNoScroll: "overflow-hidden",
  commandLine: "flex flex-wrap items-baseline",
  copyButton:
    "inline-flex items-center gap-1 m-0 py-1 px-2 border border-solid border-transparent rounded-md bg-transparent font-sans text-xs font-medium cursor-pointer transition-colors focus-visible:outline",
  copyIcon: "inline-flex w-3.5 h-3.5",
  cursor: "inline-block shrink-0 text-transparent",
  cursorLine: "flex items-center",
  cursorLineShape: "w-0.5",
  cursorUnderline: "h-0.5",
  cwd: "block",
  dot: "w-2.5 h-2.5",
  dots: "inline-flex gap-1.5 mr-0.5",
  floatingCopy: "absolute top-2 right-2 z-[1]",
  fontLg: "[--cx-terminal-font-size:1rem]",
  fontMd: "[--cx-terminal-font-size:0.875rem]",
  fontSm: "[--cx-terminal-font-size:0.75rem]",
  header: "flex items-center justify-between min-h-[2.25rem]",
  headerEnd: "shrink-0",
  headerStart: "flex-1",
  inline: "border-none rounded-md shadow-none",
  minimal: "rounded-md",
  output: "block",
  outputLine: "block",
  paddingLg: "[--cx-terminal-pad-x:1.25rem] [--cx-terminal-pad-y:1.25rem]",
  paddingMd: "[--cx-terminal-pad-x:1rem] [--cx-terminal-pad-y:1rem]",
  paddingSm: "[--cx-terminal-pad-x:0.75rem] [--cx-terminal-pad-y:0.75rem]",
  prompt: "shrink-0 select-none",
  raw: "block whitespace-pre-wrap",
  root: "[--cx-terminal-bg:#0c0f14] [--cx-terminal-fg:#e8edf5] [--cx-terminal-muted:#8b95a8] [--cx-terminal-border:#1e2633] [--cx-terminal-header:#12171f] [--cx-terminal-prompt:#7dd3a8] [--cx-terminal-command:#e8edf5] [--cx-terminal-success:#6ee7b7] [--cx-terminal-error:#fca5a5] [--cx-terminal-warning:#fcd34d] [--cx-terminal-info:#93c5fd] [--cx-terminal-selection:color-mix(in_srgb,_#60a5fa_35%,_transparent)] [--cx-terminal-cursor:#e8edf5] [--cx-terminal-dot-close:#ff5f57] [--cx-terminal-dot-min:#febc2e] [--cx-terminal-dot-max:#28c840] [--cx-terminal-font-size:0.875rem] [--cx-terminal-line-height:1.6] [--cx-terminal-pad-x:1rem] [--cx-terminal-pad-y:1rem] relative flex flex-col min-w-0 overflow-hidden border border-solid rounded-lg font-mono",
  srOnly: "absolute w-px h-px m-px p-0 overflow-hidden border-0 whitespace-nowrap",
  title: "overflow-hidden",
  unselectable: "select-none",
};

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
  if (padding === "sm") return CX.paddingSm;
  if (padding === "lg") return CX.paddingLg;
  return CX.paddingMd;
}

function fontClass(fontSize: NonNullable<TerminalProps["fontSize"]>) {
  if (fontSize === "sm") return CX.fontSm;
  if (fontSize === "lg") return CX.fontLg;
  return CX.fontMd;
}

function cursorClass(cursor: NonNullable<TerminalProps["cursor"]>) {
  if (cursor === "line") return CX.cursorLineShape;
  if (cursor === "underline") return CX.cursorUnderline;
  return CX.cursorBlock;
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
      className={cx(CX.copyButton, !headerVisible && CX.floatingCopy)}
      aria-label={copyLabel === "Copy" ? "Copy commands" : copyLabel}
      data-copied={copied ? "true" : "false"}
      onClick={() => void handleCopy()}
    >
      <span className={CX.copyIcon} aria-hidden="true">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
      <span aria-hidden="true">{copied ? copiedLabel : copyLabel}</span>
    </button>
  ) : null;

  return (
    <div
      className={cx(
        CX.root,
        CX[variant],
        paddingClass(padding),
        fontClass(fontSize),
        !selectable && CX.unselectable,
        className,
      )}
      data-cx-terminal-theme={theme}
      data-variant={variant}
      data-shell={shell}
    >
      {headerVisible ? (
        <div className={CX.header}>
          <div className={CX.headerStart}>
            {showWindowControls ? (
              <span className={CX.dots} aria-hidden="true">
                <span className={cx(CX.dot, CX.dotClose)} />
                <span className={cx(CX.dot, CX.dotMin)} />
                <span className={cx(CX.dot, CX.dotMax)} />
              </span>
            ) : null}
            {title ? <span className={CX.title}>{title}</span> : null}
          </div>
          <div className={CX.headerEnd}>
            {showShell ? <span className={CX.shell}>{resolvedShellLabel}</span> : null}
            {copyButton}
          </div>
        </div>
      ) : (
        copyButton
      )}

      <pre
        id={bodyId}
        className={cx(CX.body, !scrollable && CX.bodyNoScroll)}
        style={bodyStyle}
        tabIndex={scrollable && maxHeight !== undefined ? 0 : undefined}
      >
        {showCwd && cwd ? <span className={CX.cwd}>{cwd}</span> : null}

        {hasCommands && commands
          ? commands.map((entry, index) => {
              const lines = normalizeOutput(entry.output);
              const status = entry.status ?? "default";
              const mark =
                status !== "default" && lines.length > 0 ? STATUS_MARK[status] : undefined;
              return (
                <span key={index} className={CX.block}>
                  <span className={CX.commandLine}>
                    {showPrompt ? (
                      <span className={CX.prompt} aria-hidden="true">
                        {resolvedPrompt}
                      </span>
                    ) : null}
                    <span className={CX.command}>{entry.command}</span>
                  </span>
                  {lines.length > 0 ? (
                    <span className={CX.output} data-status={status}>
                      {lines.map((line, lineIndex) => (
                        <span key={lineIndex} className={CX.outputLine}>
                          {lineIndex === 0 && mark ? (
                            <span className={CX.statusMark} aria-hidden="true">
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

        {hasRaw && !hasCommands ? <span className={CX.raw}>{content}</span> : null}

        {showCursor ? (
          <span className={CX.cursorLine} aria-hidden="true">
            {showPrompt ? <span className={CX.prompt}>{resolvedPrompt}</span> : null}
            <span className={cx(CX.cursor, cursorClass(cursor), cursorBlink && CX.cursorBlink)}>
              █
            </span>
          </span>
        ) : null}
      </pre>

      <span className={CX.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
