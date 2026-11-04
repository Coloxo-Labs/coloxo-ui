export type TokenType =
  | "keyword"
  | "function"
  | "variable"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "punctuation"
  | "property"
  | "type"
  | "constant"
  | "boolean"
  | "tag"
  | "attribute"
  | "selector"
  | "plain";

export interface Token {
  type: TokenType;
  value: string;
}

/** Mutable lexer state carried from one line to the next. */
export interface LexState {
  /** Block rule (multi-line comment / string) currently open, if any. */
  open: Rule | null;
  /** Free-form grammar mode (e.g. "tag" in HTML, "decl" in CSS). */
  mode: string;
}

export interface Rule {
  type: TokenType;
  /** Matched at the current position (the engine makes it sticky). */
  pattern: RegExp;
  /** When set, `pattern` opens a block that runs until `end` matches (possibly on a later line). */
  end?: RegExp;
  /** Only try this rule when the predicate returns true. */
  when?: (state: LexState) => boolean;
  /** Called after the rule matches, e.g. to switch the lexer mode. */
  after?: (value: string, state: LexState) => void;
}

export interface Grammar {
  rules: Rule[];
}

export const IDENT_BOUNDARY_BEFORE = "(?<![\\w$.])";
export const IDENT_BOUNDARY_AFTER = "(?![\\w$])";

/** Build a whole-word alternation regex (not preceded by `.`, `$` or word chars). */
export function wordRegex(words: readonly string[], flags = ""): RegExp {
  const body = [...words].sort((a, b) => b.length - a.length).join("|");
  return new RegExp(`${IDENT_BOUNDARY_BEFORE}(?:${body})${IDENT_BOUNDARY_AFTER}`, flags);
}
