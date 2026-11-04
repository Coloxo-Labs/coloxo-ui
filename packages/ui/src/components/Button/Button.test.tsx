import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { Button } from "./Button";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Button", () => {
  it("renders children", () => {
    renderWithTheme(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("applies variants and sizes", () => {
    const { rerender } = renderWithTheme(<Button variant="secondary" size="sm">Edit</Button>);
    expect(screen.getByRole("button")).toBeEnabled();
    rerender(
      <Button variant="primary-destructive" size="lg">
        Delete
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("disables when loading or disabled", () => {
    const onClick = vi.fn();
    const { rerender } = renderWithTheme(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    rerender(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Button>Save changes</Button>);
    await expectNoA11yViolations(container);
  });
});
