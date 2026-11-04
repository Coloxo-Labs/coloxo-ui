import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Divider } from "./Divider";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Divider", () => {
  it("renders a horizontal decorative separator by default", () => {
    const { container } = renderWithTheme(<Divider />);
    const sep = container.querySelector('[data-orientation="horizontal"]');
    expect(sep).toBeTruthy();
  });

  it("renders a vertical separator as a centered hairline", () => {
    const { container } = renderWithTheme(
      <div style={{ display: "flex", alignItems: "center", height: 48 }}>
        <Divider orientation="vertical" />
      </div>,
    );
    const sep = container.querySelector('[data-orientation="vertical"]');
    expect(sep).toBeTruthy();
    expect(sep?.className).toMatch(/vertical/);
    expect(sep?.className).not.toMatch(/verticalStretch/);
  });

  it("can stretch vertically in flex layouts", () => {
    const { container } = renderWithTheme(
      <div style={{ display: "flex", alignItems: "stretch", height: 48 }}>
        <Divider orientation="vertical" stretch />
      </div>,
    );
    const sep = container.querySelector('[data-orientation="vertical"]');
    expect(sep?.className).toMatch(/verticalStretch/);
  });

  it("renders a labeled horizontal divider", () => {
    renderWithTheme(<Divider label="OR" />);
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("supports ReactNode labels", () => {
    renderWithTheme(<Divider label={<span data-testid="chip">SSO</span>} />);
    expect(screen.getByTestId("chip")).toHaveTextContent("SSO");
  });

  it("applies spacing and subtle data attrs", () => {
    const { container } = renderWithTheme(<Divider spacing="compact" subtle inset />);
    const sep = container.querySelector("[data-spacing='compact']");
    expect(sep).toHaveAttribute("data-subtle");
    expect(sep).toHaveAttribute("data-inset");
  });

  it("exposes semantic separator when not decorative", () => {
    const { container } = renderWithTheme(
      <Divider decorative={false} label="Continue with email" />,
    );
    const sep = container.querySelector('[role="separator"]');
    expect(sep).toHaveAttribute("aria-label", "Continue with email");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <>
        <Divider />
        <Divider label="or" />
        <Divider orientation="vertical" />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
