import type { Grammar } from "../tokens";
import type { CodeLanguage } from "../types";
import { bashGrammar, dockerfileGrammar } from "./bash";
import { cssGrammar, scssGrammar } from "./css";
import { htmlGrammar, xmlGrammar } from "./html";
import { jsonGrammar } from "./json";
import { markdownGrammar } from "./markdown";
import { plaintextGrammar } from "./plaintext";
import { pythonGrammar } from "./python";
import { sqlGrammar } from "./sql";
import {
  cGrammar,
  cppGrammar,
  csharpGrammar,
  goGrammar,
  javaGrammar,
  javascriptGrammar,
  jsxGrammar,
  phpGrammar,
  rubyGrammar,
  rustGrammar,
  tsxGrammar,
  typescriptGrammar,
} from "./typescript";
import { yamlGrammar } from "./yaml";

const GRAMMARS: Record<CodeLanguage, Grammar> = {
  typescript: typescriptGrammar,
  javascript: javascriptGrammar,
  tsx: tsxGrammar,
  jsx: jsxGrammar,
  html: htmlGrammar,
  xml: xmlGrammar,
  css: cssGrammar,
  scss: scssGrammar,
  json: jsonGrammar,
  bash: bashGrammar,
  shell: bashGrammar,
  dockerfile: dockerfileGrammar,
  sql: sqlGrammar,
  python: pythonGrammar,
  yaml: yamlGrammar,
  markdown: markdownGrammar,
  java: javaGrammar,
  c: cGrammar,
  cpp: cppGrammar,
  csharp: csharpGrammar,
  go: goGrammar,
  rust: rustGrammar,
  php: phpGrammar,
  ruby: rubyGrammar,
  plaintext: plaintextGrammar,
};

export function getGrammar(language: CodeLanguage): Grammar {
  return GRAMMARS[language] ?? plaintextGrammar;
}
