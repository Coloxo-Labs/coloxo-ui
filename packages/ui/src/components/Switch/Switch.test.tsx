import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Switch", () => {
  it("toggles", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Switch label="Enable overtime" />);
    const control = screen.getByRole("switch", { name: "Enable overtime" });
    await user.click(control);
    expect(control).toBeChecked();
  });

  it("can be disabled", () => {
    renderWithTheme(<Switch label="Locked" disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Switch label="Enable overtime" description="Applies next cycle" />,
    );
    await expectNoA11yViolations(container);
  });
});
