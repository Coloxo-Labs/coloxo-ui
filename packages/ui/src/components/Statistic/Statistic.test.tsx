import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Statistic } from "./Statistic";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Statistic", () => {
  it("renders value and trend", () => {
    renderWithTheme(<Statistic label="Total Employees" value="1,248" trend="+12.4%" />);
    expect(screen.getByText("1,248")).toBeInTheDocument();
    expect(screen.getByText("+12.4%")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Statistic label="Headcount" value="12" />);
    await expectNoA11yViolations(container);
  });
});
