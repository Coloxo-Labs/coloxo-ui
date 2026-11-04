import { getGrammar } from "./code-block-grammars";
import type { Grammar, LexState, Rule, Token, TokenType } from "./code-block-tokens";
import type { CodeLanguage } from "./code-block-types";

interface CompiledRule {
  rule: Rule;
  sticky: RegExp;
  end: RegExp | null;
}

const compiledCache = new WeakMap<Grammar, CompiledRule[]>();

function withFlags(re: RegExp, extra: string): RegExp {
  const flags = [...new Set([...re.flags, ...extra])].join("");
  return new RegExp(re.source, flags);
}

function compile(grammar: Grammar): CompiledRule[] {
  let compiled = compiledCache.get(grammar);
  if (!compiled) {
    compiled = grammar.rules.map((rule) => ({
      rule,
      sticky: withFlags(rule.pattern, "y"),
      end: rule.end ? withFlags(rule.end, "g") : null,
    }));
    compiledCache.set(grammar, compiled);
  }
  return compiled;
}

/** Whitespace run, identifier-ish run, or a single character: used when no rule matches. */
const FALLBACK = /\s+|[\w$]+|[\s\S]/y;

function tokenizeLine(line: string, rules: CompiledRule[], state: LexState): Token[] {
  const out: Token[] = [];
  const push = (type: TokenType, value: string) => {
    if (!value) return;
    const last = out[out.length - 1];
    if (last && last.type === type) last.value += value;
    else out.push({ type, value });
  };

  let pos = 0;
  while (pos < line.length) {
    if (state.open) {
      const open = rules.find((r) => r.rule === state.open);
      const endRe = open?.end;
      if (!open || !endRe) {
        state.open = null;
        continue;
      }
      endRe.lastIndex = pos;
      const m = endRe.exec(line);
      if (!m) {
        push(open.rule.type, line.slice(pos));
        pos = line.length;
        break;
      }
      const stop = m.index + m[0].length;
      push(open.rule.type, line.slice(pos, stop));
      pos = stop;
      state.open = null;
      continue;
    }

    let matched = false;
    for (const compiled of rules) {
      const { rule, sticky } = compiled;
      if (rule.when && !rule.when(state)) continue;
      sticky.lastIndex = pos;
      const m = sticky.exec(line);
      if (!m || m[0].length === 0) continue;
      push(rule.type, m[0]);
      pos += m[0].length;
      if (compiled.end) state.open = rule;
      rule.after?.(m[0], state);
      matched = true;
      break;
    }

    if (!matched) {
      FALLBACK.lastIndex = pos;
      const m = FALLBACK.exec(line);
      const value = m ? m[0] : line.charAt(pos);
      push("plain", value);
      pos += value.length;
    }
  }

  return out;
}

/** Split `code` into lines (blank lines preserved) and tokenize each one. */
export function tokenizeLines(code: string, language: CodeLanguage = "plaintext"): Token[][] {
  const lines = code.split(/\r?\n/);
  const grammar = getGrammar(language);
  if (grammar.rules.length === 0) {
    return lines.map((line) => (line ? [{ type: "plain", value: line }] : []));
  }
  const rules = compile(grammar);
  const state: LexState = { open: null, mode: "" };
  return lines.map((line) => tokenizeLine(line, rules, state));
}

export { tokenizeLines as tokenize };
