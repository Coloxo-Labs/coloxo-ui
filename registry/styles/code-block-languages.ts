import type { CodeLanguage } from "./code-block-types";

export const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  tsx: "TSX",
  jsx: "JSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  bash: "Bash",
  shell: "Shell",
  sql: "SQL",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  yaml: "YAML",
  markdown: "Markdown",
  xml: "XML",
  dockerfile: "Dockerfile",
  plaintext: "Plain text",
};

export const CODE_LANGUAGE_IDS = Object.keys(LANGUAGE_LABELS) as CodeLanguage[];

export function getLanguageLabel(language: CodeLanguage): string {
  return LANGUAGE_LABELS[language];
}
