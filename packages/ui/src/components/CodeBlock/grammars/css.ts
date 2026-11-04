import type { Grammar, LexState, Rule } from "../tokens";

const inSelector = (s: LexState) => s.mode === "";
const inValue = (s: LexState) => s.mode !== "";
const reset = (_: string, s: LexState) => {
  s.mode = "";
};

function createCssGrammar(scss: boolean): Grammar {
  const rules: Rule[] = [{ type: "comment", pattern: /\/\*/, end: /\*\// }];

  if (scss) rules.push({ type: "comment", pattern: /\/\/.*/ });

  rules.push(
    { type: "string", pattern: /"(?:[^"\\]|\\.)*(?:"|$)/ },
    { type: "string", pattern: /'(?:[^'\\]|\\.)*(?:'|$)/ },
    {
      type: "keyword",
      pattern: /@[\w-]+/,
      after: (_, s) => {
        s.mode = "at";
      },
    },
  );

  if (scss) {
    rules.push(
      {
        type: "variable",
        pattern: /\$[\w-]+(?=\s*:)/,
        after: (_, s) => {
          s.mode = "decl";
        },
      },
      { type: "variable", pattern: /\$[\w-]+/ },
      { type: "punctuation", pattern: /#\{|(?<=#\{[^}]*)\}/ },
    );
  }

  rules.push(
    // `{`, `}` and `;` end the current declaration / at-rule prelude.
    { type: "punctuation", pattern: /[{};]/, after: reset },
    // Custom properties: --foo: value
    {
      type: "variable",
      pattern: /--[\w-]+(?=\s*:)/,
      after: (_, s) => {
        s.mode = "decl";
      },
    },
    { type: "variable", pattern: /--[\w-]+/ },
    // Media / supports feature queries: `(min-width: 640px)`
    {
      type: "property",
      pattern: /[A-Za-z_-][\w-]*(?=\s*:)/,
      when: (s) => s.mode === "at",
    },
    // Property names: `color: red;` (but not `a:hover {` selectors).
    {
      type: "property",
      pattern:
        /[A-Za-z_-][\w-]*(?=\s*:(?!:)(?:[^{]*?(?:;|\}|[^,{\s]\s*$)|\s*$))/,
      when: (s) => s.mode !== "decl",
      after: (_, s) => {
        s.mode = "decl";
      },
    },
    {
      type: "keyword",
      pattern: /(?<![\w-])(?:and|or|not|only|from|to|through|if|else|each|in|return)(?![\w-])/,
      when: (s) => s.mode === "at",
    },
    { type: "keyword", pattern: /!\s*(?:important|default|global)/ },
    { type: "number", pattern: /#[\da-fA-F]{3,8}(?![\w-])/, when: inValue },
    { type: "function", pattern: /[A-Za-z_-][\w-]*(?=\()/ },
    {
      type: "number",
      pattern: /[+-]?(?:\d+\.?\d*|\.\d+)(?:[a-zA-Z%]+)?/,
      when: (s) => s.mode !== "",
    },
    // Selectors
    { type: "selector", pattern: /(?:\d+\.?\d*|\.\d+)%/, when: inSelector },
    { type: "selector", pattern: /[.#][A-Za-z_-][\w-]*/, when: inSelector },
    { type: "selector", pattern: /::?[A-Za-z-]+/, when: inSelector },
    { type: "selector", pattern: /\[[^\]]*\]/, when: inSelector },
    { type: "selector", pattern: /[&*]/, when: inSelector },
    { type: "selector", pattern: /[A-Za-z][\w-]*/, when: inSelector },
    { type: "operator", pattern: /[+\-*/%=<>~|^!]+/ },
    { type: "punctuation", pattern: /[()[\],:]/ },
  );

  return { rules };
}

export const cssGrammar = createCssGrammar(false);
export const scssGrammar = createCssGrammar(true);
