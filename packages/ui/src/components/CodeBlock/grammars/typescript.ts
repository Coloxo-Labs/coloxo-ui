import { wordRegex, type Grammar, type Rule } from "../tokens";

export interface CLikeOptions {
  keywords: readonly string[];
  /** Built-in / primitive type names. */
  types?: readonly string[];
  /** null / nil / undefined style constants. */
  constants?: readonly string[];
  booleans?: readonly string[];
  /** Line comment openers, e.g. ["//"] or ["//", "#"]. */
  lineComments?: readonly string[];
  /** Support C-style block comments. Default true. */
  blockComments?: boolean;
  /** How single quotes are treated. Default "string". */
  singleQuote?: "string" | "char";
  /** Backtick strings (multi-line). */
  backtick?: boolean;
  jsx?: boolean;
  decorators?: boolean;
  regexLiterals?: boolean;
  ignoreCase?: boolean;
  /** Sigil-prefixed variables (php `$x`, ruby `@x`). */
  variablePattern?: RegExp;
  /** Words after which a declared name is a function (def / fn / func). */
  functionDecl?: readonly string[];
  /** Extra rules inserted right after strings/comments (preprocessor, macros, ...). */
  extraRules?: Rule[];
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

const TYPE_DECL_WORDS = [
  "class",
  "interface",
  "type",
  "enum",
  "namespace",
  "struct",
  "trait",
  "impl",
  "extends",
  "implements",
  "as",
  "satisfies",
  "new",
  "record",
  "union",
];

const KEY_EXCLUDE = "default|case|public|private|protected|else|return";

export function createCLikeGrammar(o: CLikeOptions): Grammar {
  const flags = o.ignoreCase ? "i" : "";
  const rules: Rule[] = [];

  for (const opener of o.lineComments ?? ["//"]) {
    rules.push({ type: "comment", pattern: new RegExp(`${escapeRe(opener)}.*`) });
  }
  if (o.blockComments !== false) {
    rules.push({ type: "comment", pattern: /\/\*/, end: /\*\// });
  }

  if (o.backtick) {
    rules.push({ type: "string", pattern: /`/, end: /(?<!\\)`/ });
  }
  rules.push({ type: "string", pattern: /"(?:[^"\\]|\\.)*(?:"|$)/ });
  rules.push(
    o.singleQuote === "char"
      ? { type: "string", pattern: /'(?:\\.[^']*|[^'\\])'/ }
      : { type: "string", pattern: /'(?:[^'\\]|\\.)*(?:'|$)/ },
  );

  if (o.extraRules) rules.push(...o.extraRules);

  if (o.regexLiterals) {
    rules.push({
      type: "string",
      pattern:
        /(?<=(?:^|[=(,:!&|?{};[])\s*)\/(?![/*])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuvy]*/,
    });
  }

  if (o.jsx) {
    rules.push({ type: "tag", pattern: /(?<![\w$)\]])<\/?(?=[A-Za-z>])[\w.:-]*/ });
    rules.push({ type: "punctuation", pattern: /\/>/ });
    rules.push({ type: "attribute", pattern: /(?<=\s)[A-Za-z_:][\w:-]*(?==["{])/ });
  }

  if (o.decorators) {
    rules.push({ type: "attribute", pattern: /@[A-Za-z_$][\w$.]*/ });
  }
  if (o.variablePattern) {
    rules.push({ type: "variable", pattern: o.variablePattern });
  }

  rules.push({
    type: "number",
    pattern:
      /(?<![\w$])(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)[a-zA-Z]*(?![\w$])/,
  });

  // Object / struct / interface keys: `name:` at line start or after `{ , (`.
  rules.push({
    type: "property",
    pattern: new RegExp(
      `(?<=(?:^|[{,(]|\\b(?:readonly|public|private|protected|static)\\s)\\s*)(?!(?:${KEY_EXCLUDE})\\b)[A-Za-z_$][\\w$]*(?=\\??\\s*:(?!:))`,
    ),
  });

  if (o.booleans?.length) rules.push({ type: "boolean", pattern: wordRegex(o.booleans, flags) });
  if (o.constants?.length) rules.push({ type: "constant", pattern: wordRegex(o.constants, flags) });
  if (o.types?.length) rules.push({ type: "type", pattern: wordRegex(o.types, flags) });
  rules.push({ type: "keyword", pattern: wordRegex(o.keywords, flags) });

  // Declared / constructed type names: `class Foo`, `as Bar`, `new Baz`.
  rules.push({
    type: "type",
    pattern: new RegExp(
      `(?<=\\b(?:${TYPE_DECL_WORDS.join("|")})\\s+)[A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*`,
    ),
  });

  if (o.functionDecl?.length) {
    rules.push({
      type: "function",
      pattern: new RegExp(`(?<=\\b(?:${o.functionDecl.join("|")})\\s+)[A-Za-z_$][\\w$]*[?!]?`),
    });
  }

  // Arrow function / function expression bound to a name.
  rules.push({
    type: "function",
    pattern:
      /(?<=\b(?:const|let|var)\s+)[A-Za-z_$][\w$]*(?=\s*(?::[^=]*)?=\s*(?:async\s+)?(?:function\b|(?:\([^)]*\)|[\w$]+)\s*(?::[^=]+)?=>))/,
  });
  // Calls (including generic calls such as `useState<string>(`).
  rules.push({
    type: "function",
    pattern: /[A-Za-z_$][\w$]*(?=\s*(?:<[^<>()]*>)?\s*\()/,
  });
  rules.push({
    type: "variable",
    pattern: /(?<=\b(?:const|let|var|val)\s+)[A-Za-z_$][\w$]*/,
  });

  rules.push({ type: "constant", pattern: /(?<![\w$])[A-Z][A-Z0-9_]{2,}(?![\w$])/ });
  rules.push({ type: "type", pattern: /(?<![\w$])[A-Z][\w$]*(?![\w$])/ });
  rules.push({ type: "property", pattern: /(?<=[\w$)\]](?:\??\.|->))[A-Za-z_$][\w$]*/ });

  rules.push({
    type: "operator",
    pattern: /=>|\?\?=?|\?\.|\.\.\.|[+\-*/%&|^~<>=!?]+/,
  });
  rules.push({ type: "punctuation", pattern: /[{}()[\];,.:]/ });

  return { rules };
}

const JS_KEYWORDS = [
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "of",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
];

const TS_KEYWORDS = [
  ...JS_KEYWORDS,
  "abstract",
  "as",
  "asserts",
  "declare",
  "enum",
  "global",
  "implements",
  "infer",
  "interface",
  "is",
  "keyof",
  "module",
  "namespace",
  "override",
  "private",
  "protected",
  "public",
  "readonly",
  "satisfies",
  "type",
  "unique",
];

const TS_TYPES = [
  "string",
  "number",
  "boolean",
  "any",
  "unknown",
  "never",
  "object",
  "symbol",
  "bigint",
];

const JS_CONSTANTS = ["null", "undefined", "NaN", "Infinity"];

export function createJsGrammar(options: { typescript: boolean; jsx: boolean }): Grammar {
  return createCLikeGrammar({
    keywords: options.typescript ? TS_KEYWORDS : JS_KEYWORDS,
    types: options.typescript ? TS_TYPES : [],
    constants: JS_CONSTANTS,
    booleans: ["true", "false"],
    backtick: true,
    regexLiterals: true,
    decorators: options.typescript,
    jsx: options.jsx,
  });
}

export const typescriptGrammar = createJsGrammar({ typescript: true, jsx: false });
export const javascriptGrammar = createJsGrammar({ typescript: false, jsx: false });
export const tsxGrammar = createJsGrammar({ typescript: true, jsx: true });
export const jsxGrammar = createJsGrammar({ typescript: false, jsx: true });

/* ---- Generic C-like fallbacks (java, c, cpp, csharp, go, rust, php, ruby) ---- */

const C_PREPROCESSOR: Rule[] = [
  { type: "string", pattern: /(?<=#\s*include\s*)<[^>\n]+>/ },
  {
    type: "keyword",
    pattern:
      /(?<=^\s*)#\s*(?:include|define|undef|ifdef|ifndef|if|elif|else|endif|pragma|error|warning)\b/,
  },
];

const C_KEYWORDS = [
  "auto",
  "break",
  "case",
  "const",
  "continue",
  "default",
  "do",
  "else",
  "enum",
  "extern",
  "for",
  "goto",
  "if",
  "inline",
  "register",
  "restrict",
  "return",
  "sizeof",
  "static",
  "struct",
  "switch",
  "typedef",
  "union",
  "volatile",
  "while",
];

const C_TYPES = [
  "int",
  "char",
  "float",
  "double",
  "void",
  "long",
  "short",
  "signed",
  "unsigned",
  "bool",
  "size_t",
  "ssize_t",
  "int8_t",
  "int16_t",
  "int32_t",
  "int64_t",
  "uint8_t",
  "uint16_t",
  "uint32_t",
  "uint64_t",
  "FILE",
];

export const cGrammar = createCLikeGrammar({
  keywords: C_KEYWORDS,
  types: C_TYPES,
  constants: ["NULL"],
  booleans: ["true", "false"],
  singleQuote: "char",
  extraRules: C_PREPROCESSOR,
});

export const cppGrammar = createCLikeGrammar({
  keywords: [
    ...C_KEYWORDS,
    "catch",
    "class",
    "constexpr",
    "delete",
    "explicit",
    "friend",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "operator",
    "override",
    "private",
    "protected",
    "public",
    "template",
    "this",
    "throw",
    "try",
    "typename",
    "using",
    "virtual",
  ],
  types: [...C_TYPES, "string", "wchar_t", "nullptr_t"],
  constants: ["NULL", "nullptr"],
  booleans: ["true", "false"],
  singleQuote: "char",
  extraRules: C_PREPROCESSOR,
});

export const javaGrammar = createCLikeGrammar({
  keywords: [
    "abstract",
    "assert",
    "break",
    "case",
    "catch",
    "class",
    "continue",
    "default",
    "do",
    "else",
    "enum",
    "extends",
    "final",
    "finally",
    "for",
    "if",
    "implements",
    "import",
    "instanceof",
    "interface",
    "native",
    "new",
    "package",
    "permits",
    "private",
    "protected",
    "public",
    "record",
    "return",
    "sealed",
    "static",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "try",
    "var",
    "volatile",
    "while",
    "yield",
  ],
  types: ["boolean", "byte", "char", "double", "float", "int", "long", "short", "void"],
  constants: ["null"],
  booleans: ["true", "false"],
  singleQuote: "char",
  decorators: true,
});

export const csharpGrammar = createCLikeGrammar({
  keywords: [
    "abstract",
    "as",
    "async",
    "await",
    "base",
    "break",
    "case",
    "catch",
    "checked",
    "class",
    "const",
    "continue",
    "default",
    "delegate",
    "do",
    "else",
    "enum",
    "event",
    "explicit",
    "extern",
    "finally",
    "fixed",
    "for",
    "foreach",
    "get",
    "goto",
    "if",
    "implicit",
    "in",
    "init",
    "interface",
    "internal",
    "is",
    "lock",
    "namespace",
    "new",
    "operator",
    "out",
    "override",
    "params",
    "partial",
    "private",
    "protected",
    "public",
    "readonly",
    "record",
    "ref",
    "return",
    "sealed",
    "set",
    "static",
    "struct",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "unchecked",
    "unsafe",
    "using",
    "var",
    "virtual",
    "void",
    "volatile",
    "while",
    "yield",
  ],
  types: [
    "bool",
    "byte",
    "char",
    "decimal",
    "double",
    "dynamic",
    "float",
    "int",
    "long",
    "object",
    "sbyte",
    "short",
    "string",
    "uint",
    "ulong",
    "ushort",
  ],
  constants: ["null"],
  booleans: ["true", "false"],
  singleQuote: "char",
});

export const goGrammar = createCLikeGrammar({
  keywords: [
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "fallthrough",
    "for",
    "func",
    "go",
    "goto",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "select",
    "struct",
    "switch",
    "type",
    "var",
  ],
  types: [
    "any",
    "bool",
    "byte",
    "complex64",
    "complex128",
    "error",
    "float32",
    "float64",
    "int",
    "int8",
    "int16",
    "int32",
    "int64",
    "rune",
    "string",
    "uint",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "uintptr",
  ],
  constants: ["nil", "iota"],
  booleans: ["true", "false"],
  singleQuote: "char",
  backtick: true,
});

export const rustGrammar = createCLikeGrammar({
  keywords: [
    "as",
    "async",
    "await",
    "break",
    "const",
    "continue",
    "crate",
    "dyn",
    "else",
    "enum",
    "extern",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "match",
    "mod",
    "move",
    "mut",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "type",
    "unsafe",
    "use",
    "where",
    "while",
  ],
  types: [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f32",
    "f64",
    "bool",
    "char",
    "str",
    "String",
    "Vec",
    "Option",
    "Result",
    "Box",
  ],
  constants: ["None"],
  booleans: ["true", "false"],
  singleQuote: "char",
  extraRules: [
    { type: "attribute", pattern: /#!?\[[^\]]*\]/ },
    { type: "variable", pattern: /'[a-z_]\w*(?!')\b/ },
    { type: "function", pattern: /[A-Za-z_]\w*!(?=[([{])/ },
  ],
  functionDecl: ["fn"],
});

export const phpGrammar = createCLikeGrammar({
  keywords: [
    "abstract",
    "and",
    "array",
    "as",
    "break",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "echo",
    "else",
    "elseif",
    "empty",
    "extends",
    "final",
    "finally",
    "fn",
    "for",
    "foreach",
    "function",
    "global",
    "if",
    "implements",
    "include",
    "include_once",
    "instanceof",
    "interface",
    "isset",
    "list",
    "match",
    "namespace",
    "new",
    "or",
    "print",
    "private",
    "protected",
    "public",
    "readonly",
    "require",
    "require_once",
    "return",
    "static",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "while",
    "xor",
    "yield",
  ],
  types: [
    "int",
    "float",
    "string",
    "bool",
    "object",
    "void",
    "mixed",
    "callable",
    "iterable",
    "never",
  ],
  constants: ["null"],
  booleans: ["true", "false"],
  lineComments: ["//", "#"],
  ignoreCase: true,
  variablePattern: /\$[A-Za-z_]\w*/,
  extraRules: [{ type: "keyword", pattern: /<\?php|<\?=|\?>/ }],
});

export const rubyGrammar = createCLikeGrammar({
  keywords: [
    "alias",
    "and",
    "begin",
    "break",
    "case",
    "class",
    "def",
    "do",
    "else",
    "elsif",
    "end",
    "ensure",
    "extend",
    "for",
    "if",
    "in",
    "include",
    "module",
    "next",
    "not",
    "or",
    "puts",
    "raise",
    "redo",
    "require",
    "require_relative",
    "rescue",
    "retry",
    "return",
    "self",
    "super",
    "then",
    "undef",
    "unless",
    "until",
    "when",
    "while",
    "yield",
    "attr_accessor",
    "attr_reader",
    "attr_writer",
  ],
  constants: ["nil"],
  booleans: ["true", "false"],
  lineComments: ["#"],
  blockComments: false,
  variablePattern: /@@?[A-Za-z_]\w*|\$[A-Za-z_]\w*/,
  functionDecl: ["def"],
  extraRules: [
    { type: "comment", pattern: /^=begin\b.*/, end: /^=end\b.*/ },
    { type: "constant", pattern: /(?<![:\w]):[A-Za-z_]\w*[?!]?/ },
  ],
});
