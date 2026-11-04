import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";
import { BarChart } from "./BarChart";

const series = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
];

describe("BarChart", () => {
  it("exposes values through focusable bars and a data table", () => {
    renderWithTheme(
      <BarChart
        label="Visitors"
        data={[{ label: "January", desktop: 186, mobile: 80 }]}
        series={series}
      />,
    );
    expect(screen.getByRole("img", { name: "January, Desktop: 186" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(screen.getByRole("table", { name: "Visitors — data" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "80" })).toBeInTheDocument();
  });

  it("stacks positive and negative values separately without invalid geometry", () => {
    const { container } = renderWithTheme(
      <BarChart
        label="Change"
        stacked
        layout="horizontal"
        data={[
          { label: "January", desktop: -10, mobile: 20 },
          { label: "February", desktop: NaN, mobile: 0 },
        ]}
        series={series}
      />,
    );
    const bars = [...container.querySelectorAll("rect")];
    expect(bars).toHaveLength(4);
    for (const bar of bars)
      for (const attribute of ["x", "y", "width", "height"])
        expect(Number.isFinite(Number(bar.getAttribute(attribute)))).toBe(true);
    expect(Number(bars[0]!.getAttribute("x")) + Number(bars[0]!.getAttribute("width"))).toBeCloseTo(
      Number(bars[1]!.getAttribute("x")),
    );
  });

  it("renders an empty state", () => {
    renderWithTheme(<BarChart label="Visitors" data={[]} series={series} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithTheme(
      <BarChart
        label="Visitors"
        data={[{ label: "January", desktop: 12, mobile: 4 }]}
        series={series}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
