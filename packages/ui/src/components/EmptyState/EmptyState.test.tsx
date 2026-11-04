import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("EmptyState", () => {
  it("renders action", () => {
    renderWithTheme(
      <EmptyState
        title="No employees"
        description="Add your first record."
        actionLabel="Add employee"
      />,
    );
    expect(screen.getByRole("button", { name: "Add employee" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<EmptyState title="No data" />);
    await expectNoA11yViolations(container);
  });
});
