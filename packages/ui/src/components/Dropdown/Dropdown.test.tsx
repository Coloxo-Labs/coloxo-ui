import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Dropdown } from "./Dropdown";
import { Button } from "../Button/Button";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Dropdown", () => {
  it("renders a trigger", () => {
    renderWithTheme(
      <Dropdown
        trigger={<Button>Actions</Button>}
        items={[
          { key: "edit", label: "Edit" },
          { type: "separator" },
          { key: "delete", label: "Delete", destructive: true },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Actions" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Dropdown trigger={<Button>Open</Button>} items={[{ key: "a", label: "Item" }]} />,
    );
    await expectNoA11yViolations(container);
  });
});
