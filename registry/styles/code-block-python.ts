import { wordRegex, type Grammar } from "./code-block-tokens";

const KEYWORDS = [
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
];

const TYPES = [
  "int",
  "float",
  "str",
  "bool",
  "list",
  "dict",
  "set",
  "tuple",
  "bytes",
  "object",
  "type",
  "complex",
  "frozenset",
];

const PREFIX = "(?:[rRbBfFuU]{1,2})?";

export const pythonGrammar: Grammar = {
  rules: [
    { type: "comment", pattern: /#.*/ },
    { type: "string", pattern: new RegExp(`${PREFIX}"""`), end: /"""/ },
    { type: "string", pattern: new RegExp(`${PREFIX}'''`), end: /'''/ },
    { type: "string", pattern: new RegExp(`${PREFIX}"(?:[^"\\\\]|\\\\.)*(?:"|$)`) },
    { type: "string", pattern: new RegExp(`${PREFIX}'(?:[^'\\\\]|\\\\.)*(?:'|$)`) },
    { type: "attribute", pattern: /(?<=^\s*)@[\w.]+/ },
    {
      type: "number",
      pattern:
        /(?<![\w.])(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?j?)(?![\w.])/,
    },
    { type: "boolean", pattern: wordRegex(["True", "False"]) },
    { type: "constant", pattern: wordRegex(["None", "NotImplemented", "Ellipsis"]) },
    { type: "keyword", pattern: wordRegex(KEYWORDS) },
    { type: "variable", pattern: wordRegex(["self", "cls"]) },
    { type: "type", pattern: wordRegex(TYPES) },
    { type: "type", pattern: /(?<=\bclass\s+)\w+/ },
    { type: "function", pattern: /(?<=\bdef\s+)\w+/ },
    // Keyword arguments: fn(name=value)
    { type: "property", pattern: /(?<=[(,]\s*)[A-Za-z_]\w*(?==(?!=))/ },
    { type: "function", pattern: /[A-Za-z_]\w*(?=\s*\()/ },
    // Assignment targets at the start of a line
    { type: "variable", pattern: /(?<=^\s*)[A-Za-z_]\w*(?=\s*(?::[^=]+)?=(?!=))/ },
    { type: "constant", pattern: /(?<![\w$])[A-Z][A-Z0-9_]{2,}(?![\w$])/ },
    { type: "type", pattern: /(?<![\w$])[A-Z]\w*(?!\w)/ },
    { type: "property", pattern: /(?<=[\w)\]]\.)[A-Za-z_]\w*/ },
    { type: "operator", pattern: /->|:=|\*\*=?|\/\/=?|[+\-*/%&|^~<>=!@]+/ },
    { type: "punctuation", pattern: /[{}()[\],.:;]/ },
  ],
};
