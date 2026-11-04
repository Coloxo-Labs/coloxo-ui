import type { Grammar } from "../tokens";

export const markdownGrammar: Grammar = {
  rules: [
    // Fenced code blocks: the whole block (including fence lines) reads as a string.
    { type: "string", pattern: /^\s*(?:```|~~~).*/, end: /^\s*(?:```|~~~)/ },
    { type: "comment", pattern: /<!--/, end: /-->/ },
    { type: "keyword", pattern: /^#{1,6}(?=\s).*/ },
    { type: "punctuation", pattern: /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/ },
    { type: "punctuation", pattern: /^\s*\|?[\s:|-]*-[\s:|-]*\|[\s:|-]*$/ },
    { type: "operator", pattern: /^\s*>+/ },
    { type: "operator", pattern: /^\s*(?:[-*+]|\d+[.)])(?=\s)/ },
    { type: "constant", pattern: /(?<=^\s*(?:[-*+]|\d+[.)])\s+)\[[ xX]\]/ },
    { type: "string", pattern: /`[^`\n]*(?:`|$)/ },
    { type: "function", pattern: /!?\[[^\]]*\](?=\()/ },
    { type: "string", pattern: /(?<=\]\()[^)\s]*(?:\s+"[^"]*")?(?=\))/ },
    { type: "string", pattern: /<https?:\/\/[^>\s]+>|https?:\/\/[^\s)>\]]+/ },
    { type: "type", pattern: /(\*\*|__)(?=\S).*?(?<=\S)\1/ },
    { type: "variable", pattern: /(?<![\w*])\*(?=[^\s*])[^*]*?(?<=[^\s*])\*(?!\*)/ },
    { type: "variable", pattern: /(?<![\w_])_(?=[^\s_])[^_]*?(?<=[^\s_])_(?![\w_])/ },
    { type: "punctuation", pattern: /\|/ },
  ],
};
