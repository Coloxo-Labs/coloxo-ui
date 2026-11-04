import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Label } from "./Label";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Label", () => {
  it("marks required fields with a hidden asterisk", () => {
    renderWithTheme(
      <Label htmlFor="name" required>
        Name
      </Label>,
    );
    const star = screen.getByText("*");
    expect(star).toBeInTheDocument();
    expect(star).toHaveAttribute("aria-hidden", "true");
  });

  it("shows optional marker when not required", () => {
    renderWithTheme(
      <Label htmlFor="nick" optional>
        Nickname
      </Label>,
    );
    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("prefers required over optional", () => {
    renderWithTheme(
      <Label htmlFor="email" required optional>
        Email
      </Label>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.queryByText("(optional)")).not.toBeInTheDocument();
  });

  it("applies disabled state", () => {
    renderWithTheme(
      <Label htmlFor="prefix" disabled>
        Prefix
      </Label>,
    );
    const label = screen.getByText("Prefix").closest("label");
    expect(label).toHaveAttribute("data-disabled");
  });

  it("renders helper tooltip trigger", () => {
    renderWithTheme(
      <Label htmlFor="tax" required tooltip="Employer Identification Number">
        Tax ID
      </Label>,
    );
    expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();
  });

  it("applies size class", () => {
    renderWithTheme(
      <Label htmlFor="xs" size="xs">
        Micro
      </Label>,
    );
    const label = screen.getByText("Micro").closest("label");
    expect(label?.className).toMatch(/size-xs/);
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Label htmlFor="name">Name</Label>);
    await expectNoA11yViolations(container);
  });
});
