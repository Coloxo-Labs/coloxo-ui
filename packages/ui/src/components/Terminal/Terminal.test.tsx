import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { Terminal } from "./Terminal";
import { expectNoA11yViolations, renderWithTheme } from "../../test/utils";

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe("Terminal", () => {
  it("renders structured commands with prompt and output", () => {
    const { container } = renderWithTheme(
      <Terminal
        commands={[
          { command: "npm install @coloxo/ui", output: "added 42 packages" },
          { command: "npm run dev", output: "Ready on http://localhost:3000", status: "success" },
        ]}
      />,
    );

    expect(container.textContent).toContain("npm install @coloxo/ui");
    expect(container.textContent).toContain("added 42 packages");
    expect(container.textContent).toContain("Ready on http://localhost:3000");
    expect(container.querySelectorAll("[data-status='success']").length).toBe(1);
  });

  it("shows shell label and window controls by default", () => {
    renderWithTheme(<Terminal shell="zsh" commands={[{ command: "ls" }]} />);
    expect(screen.getByText("zsh")).toBeInTheDocument();
  });

  it("shows PowerShell label for powershell shell", () => {
    renderWithTheme(<Terminal shell="powershell" commands={[{ command: "Get-ChildItem" }]} />);
    expect(screen.getByText("PowerShell")).toBeInTheDocument();
  });

  it("allows shellLabel override", () => {
    renderWithTheme(
      <Terminal shell="bash" shellLabel="Next.js CLI" commands={[{ command: "next dev" }]} />,
    );
    expect(screen.getByText("Next.js CLI")).toBeInTheDocument();
    expect(screen.queryByText("bash")).not.toBeInTheDocument();
  });

  it("copies only commands without prompts", async () => {
    const writeText = mockClipboard();
    renderWithTheme(
      <Terminal
        showCopyButton
        commands={[
          { command: "npm install @coloxo/ui", output: "added 42 packages" },
          { command: "npm run dev", output: "ready" },
        ]}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy commands" }));
    });

    expect(writeText).toHaveBeenCalledWith("npm install @coloxo/ui\nnpm run dev");
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
  });

  it("renders cwd above the prompt for bash", () => {
    const { container } = renderWithTheme(
      <Terminal cwd="~/projects/coloxo" commands={[{ command: "pnpm dev" }]} />,
    );
    expect(container.textContent).toContain("~/projects/coloxo");
  });

  it("renders multi-line array output", () => {
    const { container } = renderWithTheme(
      <Terminal
        commands={[
          {
            command: "npm create next-app",
            output: ["Creating project...", "Done."],
          },
        ]}
      />,
    );
    expect(container.textContent).toContain("Creating project...");
    expect(container.textContent).toContain("Done.");
  });

  it("supports raw content mode", () => {
    const { container } = renderWithTheme(
      <Terminal content={`$ npm install\n\nadded 42 packages`} />,
    );
    expect(container.textContent).toContain("$ npm install");
    expect(container.textContent).toContain("added 42 packages");
  });

  it("hides chrome in minimal variant", () => {
    const { container } = renderWithTheme(
      <Terminal variant="minimal" shell="bash" commands={[{ command: "echo hi" }]} />,
    );
    expect(container.querySelector("[data-variant='minimal']")).toBeTruthy();
    expect(screen.queryByText("bash")).not.toBeInTheDocument();
  });

  it("sets theme attribute (dark default)", () => {
    const { container } = renderWithTheme(<Terminal commands={[{ command: "ls" }]} />);
    expect(container.querySelector("[data-cx-terminal-theme]")).toHaveAttribute(
      "data-cx-terminal-theme",
      "dark",
    );
  });

  it("marks error and warning status output", () => {
    const { container } = renderWithTheme(
      <Terminal
        commands={[
          { command: "npm test", output: "3 tests failed.", status: "error" },
          { command: "npm audit", output: "1 vulnerability", status: "warning" },
        ]}
      />,
    );
    expect(container.querySelector("[data-status='error']")).toBeTruthy();
    expect(container.querySelector("[data-status='warning']")).toBeTruthy();
  });

  it("has no critical a11y violations", async () => {
    const { container } = renderWithTheme(
      <Terminal
        showCopyButton
        commands={[{ command: "npx coloxo add terminal", output: "Added Terminal." }]}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
