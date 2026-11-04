import { wordRegex, type Grammar, type Rule } from "../tokens";

const BASH_KEYWORDS = [
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "for",
  "while",
  "until",
  "do",
  "done",
  "case",
  "esac",
  "in",
  "function",
  "select",
  "time",
  "return",
  "exit",
  "break",
  "continue",
  "local",
  "export",
  "readonly",
  "declare",
  "unset",
  "shift",
  "source",
  "alias",
];

const DOCKER_INSTRUCTIONS =
  /(?<=^\s*)(?:FROM|RUN|CMD|LABEL|MAINTAINER|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)(?=\s|$)/i;

function createBashGrammar(docker: boolean): Grammar {
  const rules: Rule[] = [
    { type: "comment", pattern: /(?<![^\s])#.*/ },
    { type: "string", pattern: /"(?:[^"\\]|\\.)*(?:"|$)/ },
    { type: "string", pattern: /'[^']*(?:'|$)/ },
  ];

  if (docker) {
    rules.push(
      { type: "keyword", pattern: DOCKER_INSTRUCTIONS },
      { type: "keyword", pattern: /(?<=^\s*FROM\s+\S+\s+)AS(?=\s)/i },
    );
  }

  rules.push(
    { type: "operator", pattern: /(?<=^\s*)\$(?=\s)/ },
    {
      type: "variable",
      pattern: /\$(?:\{[^}]*\}|[A-Za-z_]\w*|[0-9@#?$!*-])/,
    },
    { type: "punctuation", pattern: /\$\(/ },
    { type: "boolean", pattern: wordRegex(["true", "false"]) },
    { type: "keyword", pattern: wordRegex(BASH_KEYWORDS) },
    // Flags: --force, -rf
    { type: "attribute", pattern: /(?<![\w-])--?[A-Za-z][\w-]*/ },
    // Assignments: FOO=bar
    { type: "variable", pattern: /(?<![\w$-])[A-Za-z_]\w*(?==)/ },
    // Command position: start of line, after `|`, `;`, `&`, `(`, `$(`, `then`, `do`, `sudo`.
    {
      type: "function",
      pattern:
        /(?<=^\s*(?:\$\s+)?(?:(?:sudo|RUN|xargs|time)\s+)?|[|;&(]\s*|\$\(\s*|\b(?:then|do|else)\s+)[A-Za-z_./~][\w./~+-]*/,
    },
    { type: "number", pattern: /(?<![\w.-])\d+(?:\.\d+)?(?![\w.-])/ },
    { type: "operator", pattern: /&&|\|\||>>|<<<?|[|&<>=!]+/ },
    { type: "punctuation", pattern: /[;(){}[\]]/ },
  );

  return { rules };
}

export const bashGrammar = createBashGrammar(false);
export const dockerfileGrammar = createBashGrammar(true);
