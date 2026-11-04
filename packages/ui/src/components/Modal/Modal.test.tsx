import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { Modal } from "./Modal";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Modal", () => {
  it("renders when open and closes with the close button", () => {
    let open = true;
    const { rerender } = renderWithTheme(
      <Modal open={open} onOpenChange={(next) => { open = next; }} title="Edit employee">
        Form
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Edit employee");
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    rerender(
      <Modal open={open} onOpenChange={(next) => { open = next; }} title="Edit employee">
        Form
      </Modal>,
    );
    expect(open).toBe(false);
  });

  it("applies open animation state and trigger transform origin", () => {
    const originRef = createRef<HTMLButtonElement>();
    renderWithTheme(
      <>
        <button ref={originRef} type="button">
          Open
        </button>
        <Modal open originRef={originRef} title="Animated">
          Body
        </Modal>
      </>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-state", "open");
    expect(dialog).toHaveAttribute("data-origin", "trigger");
    expect(dialog.style.transformOrigin.length).toBeGreaterThan(0);
  });

  it("has no axe violations when open", async () => {
    const { container } = renderWithTheme(
      <Modal open title="Confirm" description="This cannot be undone.">
        Body
      </Modal>,
    );
    await expectNoA11yViolations(container);
  });
});
