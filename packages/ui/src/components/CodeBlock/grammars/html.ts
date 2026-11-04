import type { Grammar, LexState } from "../tokens";

const inTag = (s: LexState) => s.mode === "tag";
const outsideTag = (s: LexState) => s.mode !== "tag";

export const htmlGrammar: Grammar = {
  rules: [
    { type: "comment", pattern: /<!--/, end: /-->/ },
    { type: "string", pattern: /<!\[CDATA\[/, end: /\]\]>/ },
    { type: "keyword", pattern: /<!(?!--)[^>]*>|<\?[^>]*\?>/, when: outsideTag },
    {
      type: "tag",
      pattern: /<\/?[A-Za-z][\w:.-]*/,
      when: outsideTag,
      after: (_, s) => {
        s.mode = "tag";
      },
    },
    // Attribute values may span lines.
    { type: "string", pattern: /"/, end: /"/, when: inTag },
    { type: "string", pattern: /'/, end: /'/, when: inTag },
    {
      type: "tag",
      pattern: /\/?>/,
      when: inTag,
      after: (_, s) => {
        s.mode = "";
      },
    },
    { type: "attribute", pattern: /[^\s"'<>/=]+/, when: inTag },
    { type: "operator", pattern: /=/, when: inTag },
    { type: "constant", pattern: /&(?:#\d+|#x[\da-fA-F]+|[A-Za-z][\w]*);/, when: outsideTag },
  ],
};

export const xmlGrammar: Grammar = htmlGrammar;
