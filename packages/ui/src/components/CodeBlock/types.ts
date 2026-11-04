export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "tsx"
  | "jsx"
  | "html"
  | "css"
  | "scss"
  | "json"
  | "bash"
  | "shell"
  | "sql"
  | "python"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "yaml"
  | "markdown"
  | "xml"
  | "dockerfile"
  | "plaintext";

export type CodeTheme = "light" | "dark" | "system";

export type CodeBlockVariant =
  | "default"
  | "minimal"
  | "compact"
  | "borderless"
  | "elevated"
  | "terminal";

export interface CodeBlockProps {
  /** Raw source code. This exact string is what the copy button copies. */
  code: string;
  language?: CodeLanguage;
  /** Overrides the display name derived from `language`. */
  languageLabel?: string;
  /** Short caption shown at the start of the header. */
  label?: string;
  filename?: string;
  /** `system` follows `data-cx-theme` from ThemeProvider. */
  theme?: CodeTheme;
  variant?: CodeBlockVariant;
  /** Defaults to true when there is any header content. */
  showHeader?: boolean;
  /** Defaults to true when `language` or `languageLabel` is provided. */
  showLanguage?: boolean;
  /** Defaults to true. */
  showCopyButton?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  showLineNumbers?: boolean;
  /** First line number. Defaults to 1. */
  startLine?: number;
  /** Line numbers (as displayed, i.e. offset by `startLine`) to highlight. */
  highlightLines?: number[];
  /** Line numbers (as displayed) to keep at full opacity; all other lines are muted. */
  focusLines?: number[];
  wordWrap?: boolean;
  maxHeight?: number | string;
  /** Collapse to this many lines; combine with `expandable` for a toggle. */
  maxLines?: number;
  expandable?: boolean;
  className?: string;
}
