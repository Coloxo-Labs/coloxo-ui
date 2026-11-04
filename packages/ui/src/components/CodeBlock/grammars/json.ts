import type { Grammar } from "../tokens";

export const jsonGrammar: Grammar = {
  rules: [
    { type: "comment", pattern: /\/\/.*/ },
    { type: "comment", pattern: /\/\*/, end: /\*\// },
    { type: "property", pattern: /"(?:[^"\\]|\\.)*"(?=\s*:)/ },
    { type: "string", pattern: /"(?:[^"\\]|\\.)*(?:"|$)/ },
    { type: "number", pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(?![\w.])/ },
    { type: "boolean", pattern: /(?<![\w$])(?:true|false)(?![\w$])/ },
    { type: "constant", pattern: /(?<![\w$])null(?![\w$])/ },
    { type: "punctuation", pattern: /[{}[\],:]/ },
  ],
};
