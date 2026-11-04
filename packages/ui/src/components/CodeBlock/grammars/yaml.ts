import type { Grammar } from "../tokens";

export const yamlGrammar: Grammar = {
  rules: [
    { type: "comment", pattern: /(?<![^\s])#.*/ },
    { type: "punctuation", pattern: /^(?:---|\.\.\.)(?=\s|$)/ },
    { type: "punctuation", pattern: /(?<=^\s*(?:-\s+)*)-(?=\s|$)/ },
    {
      type: "property",
      pattern: /(?<=^\s*(?:-\s+)*)(?:"[^"]*"|'[^']*'|[^\s#:'"{}[\],&*!|>-][^#]*?)(?=\s*:(?:\s|$))/,
    },
    { type: "string", pattern: /"(?:[^"\\]|\\.)*(?:"|$)/ },
    { type: "string", pattern: /'(?:[^']|'')*(?:'|$)/ },
    { type: "variable", pattern: /[&*][\w-]+/ },
    { type: "type", pattern: /!!?[\w!-]*/ },
    { type: "operator", pattern: /<<(?=:)/ },
    { type: "operator", pattern: /[|>][+-]?\d*(?=\s*(?:#.*)?$)/ },
    {
      type: "boolean",
      pattern: /(?<![\w.-])(?:true|false|yes|no|on|off)(?![\w.-])/i,
    },
    { type: "constant", pattern: /(?<![\w.-])(?:null|~)(?![\w.-])/i },
    {
      type: "number",
      pattern: /(?<![\w.-])[+-]?(?:0x[\da-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)(?![\w.-])/,
    },
    { type: "punctuation", pattern: /[[\]{},:]/ },
  ],
};
