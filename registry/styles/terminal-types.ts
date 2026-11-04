export type TerminalShell =
  | "bash"
  | "zsh"
  | "powershell"
  | "cmd"
  | "fish"
  | "sh"
  | "terminal";

export type TerminalStatus = "default" | "success" | "error" | "warning" | "info";

export type TerminalTheme = "light" | "dark" | "system";

export type TerminalVariant = "default" | "minimal" | "window" | "inline";

export type TerminalCursor = "block" | "line" | "underline";

export type TerminalPadding = "sm" | "md" | "lg";

export type TerminalFontSize = "sm" | "md" | "lg";

export interface TerminalCommand {
  /** Shell command text (no prompt). Copied to clipboard as-is. */
  command: string;
  /** Command output — string or multiple lines. */
  output?: string | string[];
  /** Visual status styling for the output. */
  status?: TerminalStatus;
}

export interface TerminalProps {
  /** Structured terminal session. Preferred over `content`. */
  commands?: TerminalCommand[];
  /** Raw terminal body when structured commands are not needed. */
  content?: string;

  shell?: TerminalShell;
  /** Override header shell label (e.g. "Next.js CLI"). */
  shellLabel?: string;
  /** Optional header title (shown instead of / alongside shell). */
  title?: string;
  /** Working directory shown above the first prompt. */
  cwd?: string;

  showWindowControls?: boolean;
  showShell?: boolean;

  showPrompt?: boolean;
  /** Override the prompt character/string. */
  prompt?: string;

  showCursor?: boolean;
  cursor?: TerminalCursor;
  cursorBlink?: boolean;

  /** Default is dark — terminals are traditionally dark. */
  theme?: TerminalTheme;
  variant?: TerminalVariant;

  padding?: TerminalPadding;
  fontSize?: TerminalFontSize;

  maxHeight?: number | string;
  scrollable?: boolean;
  selectable?: boolean;

  showCopyButton?: boolean;
  copyLabel?: string;
  copiedLabel?: string;

  className?: string;
}
