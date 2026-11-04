import { describe, expect, it } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./Textarea";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Textarea", () => {
  it("shows character count for defaultValue", () => {
    renderWithTheme(<Textarea label="Notes" maxLength={20} showCount defaultValue="Hello" />);
    expect(screen.getByText("5/20")).toBeInTheDocument();
  });

  it("updates character count while typing (uncontrolled)", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Textarea label="Notes" maxLength={20} showCount placeholder="Type" />);
    expect(screen.getByText("0/20")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Notes" }), "Hi");
    expect(screen.getByText("2/20")).toBeInTheDocument();
  });

  it("updates character count when controlled", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <Textarea
          label="Notes"
          maxLength={10}
          showCount
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }

    renderWithTheme(<Controlled />);
    expect(screen.getByText("0/10")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Notes" }), "abc");
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("announces error state like Input", () => {
    renderWithTheme(<Textarea label="Bio" error="This is an error message." defaultValue="x" />);
    const field = screen.getByRole("textbox", { name: "Bio" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("This is an error message.");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Textarea label="Notes" description="Optional details" />,
    );
    await expectNoA11yViolations(container);
  });
});
