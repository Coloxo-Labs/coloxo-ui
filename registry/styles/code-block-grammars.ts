import type { Grammar } from "./code-block-tokens";
import type { CodeLanguage } from "./code-block-types";
import { bashGrammar, dockerfileGrammar } from "./code-block-bash";
import { cssGrammar, scssGrammar } from "./code-block-css";
import { htmlGrammar, xmlGrammar } from "./code-block-html";
import { jsonGrammar } from "./code-block-json";
import { markdownGrammar } from "./code-block-markdown";
import { plaintextGrammar } from "./code-block-plaintext";
import { pythonGrammar } from "./code-block-python";
import { sqlGrammar } from "./code-block-sql";
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
} from "./code-block-typescript";
import { yamlGrammar } from "./code-block-yaml";

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
