import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle";
import { renderWithTheme } from "../../test/utils";

describe("ThemeToggle", () => {
  it("switches theme segment", async () => {
    renderWithTheme(<ThemeToggle />);
    const dark = screen.getByRole("button", { name: /dark/i });
    await userEvent.click(dark);
    expect(dark).toHaveAttribute("aria-pressed", "true");
  });
});
