import { Trash2Icon } from "../../icons";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { IconButton } from "./IconButton";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("IconButton", () => {
  it("requires an accessible name", () => {
    renderWithTheme(
      <IconButton aria-label="Delete employee">
        <Trash2Icon />
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Delete employee" })).toBeInTheDocument();
  });

  it("disables when loading", () => {
    renderWithTheme(
      <IconButton aria-label="Delete employee" loading>
        <Trash2Icon />
      </IconButton>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <IconButton aria-label="Delete employee">
        <Trash2Icon />
      </IconButton>,
    );
    await expectNoA11yViolations(container);
  });
});
