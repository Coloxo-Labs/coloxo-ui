import { describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";
import { Alert } from "./Alert";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Alert", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders title and description", () => {
    renderWithTheme(<Alert variant="success" title="Saved" description="Employee created." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Saved");
  });

  it("supports message as an alias for title", () => {
    renderWithTheme(<Alert message="Policy update" description="Details here." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Policy update");
  });

  it("hides the icon when showIcon is false", () => {
    const { container } = renderWithTheme(
      <Alert title="No icon" showIcon={false} data-testid="alert-root" />,
    );
    const root = container.firstElementChild;
    expect(root?.querySelector("svg")).toBeNull();
  });

  it("renders banner with warning variant by default", () => {
    renderWithTheme(<Alert banner message="Site maintenance tonight" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Site maintenance tonight");
    expect(alert.className).toMatch(/warning/);
  });

  it("places action in the same row as content (not inside section)", () => {
    const { container } = renderWithTheme(
      <Alert
        title="Payroll failed"
        description="Bank file rejected."
        action={<button type="button">Retry</button>}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const section = root.querySelector('[class*="section"]');
    const actions = root.querySelector('[class*="actions"]');
    expect(section).toBeTruthy();
    expect(actions).toBeTruthy();
    expect(section?.contains(actions)).toBe(false);
    expect(root.contains(actions)).toBe(true);
  });

  it("calls afterClose after dismiss animation", () => {
    vi.useFakeTimers();
    const afterClose = vi.fn();
    renderWithTheme(<Alert title="Notice" closable afterClose={afterClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss alert" }));
    expect(afterClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(afterClose).toHaveBeenCalledTimes(1);
  });

  it("can be dismissed via onClose", async () => {
    const user = userEvent.setup();
    let closed = false;
    renderWithTheme(
      <Alert
        title="Notice"
        closable
        onClose={() => {
          closed = true;
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Dismiss alert" }));
    expect(closed).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Alert variant="error" title="Failed" description="Try again." />,
    );
    await expectNoA11yViolations(container);
  });

  describe("ErrorBoundary", () => {
    class Broken extends Component {
      override render(): ReactNode {
        throw new Error("Render failed");
      }
    }

    it("renders an error alert when a child throws", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      renderWithTheme(
        <Alert.ErrorBoundary title="Unable to load" description="Please refresh.">
          <Broken />
        </Alert.ErrorBoundary>,
      );
      expect(screen.getByRole("alert")).toHaveTextContent("Unable to load");
      consoleError.mockRestore();
    });
  });
});
