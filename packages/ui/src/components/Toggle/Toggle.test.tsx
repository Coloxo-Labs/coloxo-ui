import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./Toggle";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Toggle", () => {
  it("toggles pressed state", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderWithTheme(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );
    const control = screen.getByRole("button", { name: "Bold" });
    expect(control).toHaveAttribute("aria-pressed", "false");
    await user.click(control);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("supports controlled pressed", () => {
    renderWithTheme(
      <Toggle pressed aria-label="Italic">
        Italic
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
  });

  it("can be disabled", () => {
    renderWithTheme(
      <Toggle disabled aria-label="Strike">
        Strike
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "Strike" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Toggle aria-label="Underline">Underline</Toggle>);
    await expectNoA11yViolations(container);
  });
});

describe("ToggleGroup", () => {
  it("selects a single value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup type="single" aria-label="Period" onValueChange={onValueChange}>
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("radio", { name: "Week" }));
    expect(onValueChange).toHaveBeenCalledWith("week");
  });

  it("supports multiple selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup type="multiple" aria-label="Format" onValueChange={onValueChange}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(onValueChange).toHaveBeenCalledWith(["bold"]);
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <ToggleGroup type="single" defaultValue="day" aria-label="Period">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
      </ToggleGroup>,
    );
    await expectNoA11yViolations(container);
  });
});
