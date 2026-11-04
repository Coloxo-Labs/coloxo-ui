import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Tabs", () => {
  it("switches tabs", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tabs
        items={[
          { value: "profile", label: "Profile", content: "Profile panel" },
          { value: "access", label: "Access", content: "Access panel" },
          { value: "off", label: "Disabled", disabled: true, content: "No" },
        ]}
      />,
    );
    expect(screen.getByText("Profile panel")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Access" }));
    expect(screen.getByText("Access panel")).toBeVisible();
    expect(screen.getByRole("tab", { name: "Disabled" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Tabs items={[{ value: "a", label: "A", content: "A panel" }]} />,
    );
    await expectNoA11yViolations(container);
  });
});
