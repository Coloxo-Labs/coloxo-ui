import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Skeleton", () => {
  it("renders multiple text lines", () => {
    const { container } = renderWithTheme(<Skeleton variant="text" lines={3} />);
    expect(container.querySelectorAll("[class]").length).toBeGreaterThan(1);
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Skeleton variant="circular" />);
    await expectNoA11yViolations(container);
  });
});
