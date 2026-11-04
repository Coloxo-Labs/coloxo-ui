import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { CodeBlock } from "./CodeBlock";
import { tokenizeLines } from "./tokenize";
import { expectNoA11yViolations, renderWithTheme } from "../../test/utils";

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe("CodeBlock", () => {
  it("renders the code text", () => {
    const { container } = renderWithTheme(<CodeBlock code={"const x = 1;"} language="typescript" />);
    expect(container.querySelector("code")?.textContent).toBe("const x = 1;");
  });

  it("shows line numbers 1..n including blank lines", () => {
    const { container } = renderWithTheme(
      <CodeBlock code={"first\n\nthird\n\n\nsixth"} showLineNumbers />,
    );
    const numbers = [...container.querySelectorAll("[data-line-number]")].map((el) => el.textContent);
    expect(numbers).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("does not render line numbers by default", () => {
    const { container } = renderWithTheme(<CodeBlock code={"a\nb"} />);
    expect(container.querySelectorAll("[data-line-number]")).toHaveLength(0);
  });

  it("offsets line numbers with startLine", () => {
    const { container } = renderWithTheme(<CodeBlock code={"a\nb\nc"} showLineNumbers startLine={10} />);
    const numbers = [...container.querySelectorAll("[data-line-number]")].map((el) => el.textContent);
    expect(numbers).toEqual(["10", "11", "12"]);
  });

  it("copies only the raw code without line numbers", async () => {
    const writeText = mockClipboard();
    const code = "line one\n\nline three";
    renderWithTheme(<CodeBlock code={code} showLineNumbers />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(code);
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

  it("resets the copied state after a delay", async () => {
    vi.useFakeTimers();
    try {
      mockClipboard();
      renderWithTheme(<CodeBlock code="x" />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      expect(screen.getByRole("status")).toHaveTextContent("Copied");
      await act(async () => {
        vi.advanceTimersByTime(2100);
      });
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    } finally {
      vi.useRealTimers();
    }
  });

  it("marks highlighted lines", () => {
    const { container } = renderWithTheme(<CodeBlock code={"a\nb\nc"} highlightLines={[2]} />);
    const lines = container.querySelectorAll("[data-line]");
    expect(lines[0]).not.toHaveAttribute("data-highlighted");
    expect(lines[1]).toHaveAttribute("data-highlighted", "true");
    expect(lines[2]).not.toHaveAttribute("data-highlighted");
  });

  it("dims lines outside focusLines", () => {
    const { container } = renderWithTheme(<CodeBlock code={"a\nb\nc"} focusLines={[2]} />);
    const lines = container.querySelectorAll("[data-line]");
    expect(lines[0]).toHaveAttribute("data-dimmed", "true");
    expect(lines[1]).not.toHaveAttribute("data-dimmed");
    expect(lines[2]).toHaveAttribute("data-dimmed", "true");
  });

  it("enables word wrap on the pre element", () => {
    const { container, rerender } = renderWithTheme(
      <CodeBlock code={"const veryLongIdentifier = true;"} wordWrap />,
    );
    expect(container.querySelector("pre")).toHaveAttribute("data-word-wrap", "true");
    rerender(<CodeBlock code={"const veryLongIdentifier = true;"} />);
    expect(container.querySelector("pre")).not.toHaveAttribute("data-word-wrap");
  });

  it("displays the language name and custom labels", () => {
    renderWithTheme(
      <CodeBlock code="x" language="typescript" label="Example" filename="index.ts" />,
    );
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("prefers languageLabel over the derived name", () => {
    renderWithTheme(<CodeBlock code="x" language="typescript" languageLabel="TS" />);
    expect(screen.getByText("TS")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
  });

  it("sets the code theme attribute", () => {
    const { container } = renderWithTheme(<CodeBlock code="x" theme="dark" />);
    expect(container.querySelector("[data-cx-code-theme]")).toHaveAttribute(
      "data-cx-code-theme",
      "dark",
    );
  });

  it("hides the header when showHeader is false but keeps copy available", () => {
    const { container } = renderWithTheme(
      <CodeBlock code="x" language="typescript" showHeader={false} />,
    );
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("collapses with maxLines + expandable and toggles", () => {
    const code = Array.from({ length: 10 }, (_, i) => `line ${i + 1}`).join("\n");
    renderWithTheme(<CodeBlock code={code} maxLines={3} expandable />);
    const toggle = screen.getByRole("button", { name: "Show more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("does not show a toggle when code fits within maxLines", () => {
    renderWithTheme(<CodeBlock code={"a\nb"} maxLines={5} expandable />);
    expect(screen.queryByRole("button", { name: /show/i })).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithTheme(
      <CodeBlock
        code={"const a = 1;\n\nconsole.log(a);"}
        language="typescript"
        filename="a.ts"
        showLineNumbers
      />,
    );
    await expectNoA11yViolations(container);
  });
});

describe("tokenizeLines", () => {
  const types = (code: string, language: Parameters<typeof tokenizeLines>[1]) =>
    tokenizeLines(code, language).map((line) => line.map((t) => [t.type, t.value]));

  it("preserves empty lines", () => {
    expect(tokenizeLines("a\n\nb", "plaintext")).toHaveLength(3);
    expect(tokenizeLines("a\r\n\r\nb", "typescript")).toHaveLength(3);
  });

  it("highlights the JS/TS family", () => {
    const [line] = types('const greet = (name: string) => `hi`; // note', "typescript");
    expect(line).toContainEqual(["keyword", "const"]);
    expect(line).toContainEqual(["function", "greet"]);
    expect(line).toContainEqual(["type", "string"]);
    expect(line).toContainEqual(["string", "`hi`"]);
    expect(line).toContainEqual(["comment", "// note"]);
  });

  it("carries block comments and template strings across lines", () => {
    const lines = types("/* a\nb */ let x = `x\ny`;", "javascript");
    expect(lines[0]).toEqual([["comment", "/* a"]]);
    expect(lines[1]?.[0]).toEqual(["comment", "b */"]);
    expect(lines[2]).toContainEqual(["string", "y`"]);
  });

  it("highlights JSX tags and attributes", () => {
    const [line] = types('<Button variant="primary" />', "tsx");
    expect(line).toContainEqual(["tag", "<Button"]);
    expect(line).toContainEqual(["attribute", "variant"]);
    expect(line).toContainEqual(["string", '"primary"']);
  });

  it("highlights JSON keys and values", () => {
    const [line] = types('{ "a": [1, true, null, "s"] }', "json");
    expect(line).toContainEqual(["property", '"a"']);
    expect(line).toContainEqual(["number", "1"]);
    expect(line).toContainEqual(["boolean", "true"]);
    expect(line).toContainEqual(["constant", "null"]);
    expect(line).toContainEqual(["string", '"s"']);
  });

  it("highlights CSS selectors, properties and values", () => {
    const lines = types(".btn:hover {\n  color: #fff;\n  margin: 0 auto;\n}", "css");
    expect(lines[0]).toContainEqual(["selector", ".btn:hover"]);
    expect(lines[1]).toContainEqual(["property", "color"]);
    expect(lines[1]).toContainEqual(["number", "#fff"]);
    expect(lines[2]).toContainEqual(["property", "margin"]);
  });

  it("highlights HTML tags, attributes and comments", () => {
    const lines = types('<div class="a">hi</div>\n<!-- x -->', "html");
    expect(lines[0]).toContainEqual(["tag", "<div"]);
    expect(lines[0]).toContainEqual(["attribute", "class"]);
    expect(lines[0]).toContainEqual(["string", '"a"']);
    expect(lines[1]).toEqual([["comment", "<!-- x -->"]]);
  });

  it("highlights bash commands, flags and variables", () => {
    const [line] = types('npm install --save-dev "x" $HOME # c', "bash");
    expect(line).toContainEqual(["function", "npm"]);
    expect(line).toContainEqual(["attribute", "--save-dev"]);
    expect(line).toContainEqual(["string", '"x"']);
    expect(line).toContainEqual(["variable", "$HOME"]);
    expect(line).toContainEqual(["comment", "# c"]);
  });

  it("highlights SQL keywords case-insensitively", () => {
    const [line] = types("select count(*) from users where id = 1;", "sql");
    expect(line).toContainEqual(["keyword", "select"]);
    expect(line).toContainEqual(["function", "count"]);
    expect(line).toContainEqual(["keyword", "from"]);
    expect(line).toContainEqual(["number", "1"]);
  });

  it("highlights Python docstrings, decorators and defs", () => {
    const lines = types('@app.route("/")\ndef home():\n    """doc\n    more"""\n    return None', "python");
    expect(lines[0]).toContainEqual(["attribute", "@app.route"]);
    expect(lines[1]).toContainEqual(["keyword", "def"]);
    expect(lines[1]).toContainEqual(["function", "home"]);
    expect(lines[2]?.at(-1)?.[0]).toBe("string");
    expect(lines[3]?.at(-1)?.[0]).toBe("string");
    expect(lines[4]).toContainEqual(["constant", "None"]);
  });

  it("highlights YAML keys, booleans and comments", () => {
    const lines = types("name: app # c\nenabled: true\nitems:\n  - 1", "yaml");
    expect(lines[0]).toContainEqual(["property", "name"]);
    expect(lines[0]).toContainEqual(["comment", "# c"]);
    expect(lines[1]).toContainEqual(["boolean", "true"]);
    expect(lines[3]).toContainEqual(["number", "1"]);
  });

  it("highlights Markdown headings and fenced code", () => {
    const lines = types("# Title\n```ts\nconst a = 1;\n```\nafter", "markdown");
    expect(lines[0]).toEqual([["keyword", "# Title"]]);
    expect(lines[2]).toEqual([["string", "const a = 1;"]]);
    expect(lines[4]).toEqual([["plain", "after"]]);
  });

  it("falls back gracefully for other languages", () => {
    const [line] = types('fn main() { println!("hi"); }', "rust");
    expect(line).toContainEqual(["keyword", "fn"]);
    expect(line).toContainEqual(["function", "main"]);
    expect(line).toContainEqual(["function", "println!"]);
  });
});
