import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Checkbox", () => {
  it("toggles checked state", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Checkbox label="Remote eligible" />);
    const box = screen.getByRole("checkbox", { name: "Remote eligible" });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
  });

  it("supports indeterminate", () => {
    renderWithTheme(<Checkbox label="Select all" indeterminate />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Checkbox label="Accept terms" description="Required for onboarding" />,
    );
    await expectNoA11yViolations(container);
  });
});
