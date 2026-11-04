import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Breadcrumb", () => {
  it("marks the current page", () => {
    renderWithTheme(
      <Breadcrumb
        items={[
          { label: "HR", href: "/" },
          { label: "Employees", href: "/employees" },
          { label: "Ada Lovelace" },
        ]}
      />,
    );
    expect(screen.getByText("Ada Lovelace")).toHaveAttribute("aria-current", "page");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Now" }]} />,
    );
    await expectNoA11yViolations(container);
  });
});
