import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Badge } from "./Badge";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Badge", () => {
  it("renders colors", () => {
    renderWithTheme(<Badge color="success">Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Badge color="error" size="sm">
        Overdue
      </Badge>,
    );
    await expectNoA11yViolations(container);
  });
});
