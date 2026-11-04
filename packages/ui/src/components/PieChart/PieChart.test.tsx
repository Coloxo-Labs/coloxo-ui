import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";
import { PieChart } from "./PieChart";

describe("PieChart", () => {
  it("exposes values and shares through focusable slices and a table", () => {
    renderWithTheme(<PieChart label="Sources" data={[{ label: "Direct", value: 30 }, { label: "Search", value: 70 }]} />);
    expect(screen.getByRole("img", { name: "Sources" }).querySelector("title")).toBeNull();
    expect(screen.getByRole("img", { name: "Direct: 30 (30.0%)" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("table", { name: "Sources — data" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "70.0%" })).toBeInTheDocument();
  });

  it("renders a complete single-slice donut and its total", () => {
    const { container } = renderWithTheme(<PieChart label="Revenue" data={[{ label: "Enterprise", value: 210 }]} innerRadius={60} centerLabel="Total" />);
    const slice = container.querySelector("path")!;
    expect(slice.getAttribute("d")?.match(/ A /g)).toHaveLength(4);
    expect(slice.getAttribute("d")).not.toMatch(/NaN|Infinity/);
    expect(screen.getByText("210", { selector: "text" })).toBeInTheDocument();
  });

  it("ignores invalid and non-positive values without breaking geometry", () => {
    const { container } = renderWithTheme(<PieChart label="Sources" data={[{ label: "Direct", value: 50 }, { label: "Zero", value: 0 }, { label: "Negative", value: -2 }, { label: "Invalid", value: NaN }]} />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(container.querySelector("path")?.getAttribute("d")).not.toMatch(/NaN|Infinity/);
    expect(screen.getByRole("img", { name: "Direct: 50 (100.0%)" })).toBeInTheDocument();
  });

  it("shows an empty state when there are no positive values", () => {
    renderWithTheme(<PieChart label="Sources" data={[{ label: "Direct", value: 0 }]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithTheme(<PieChart label="Sources" data={[{ label: "Direct", value: 30 }, { label: "Search", value: 70 }]} innerRadius={60} centerLabel="Visitors" showLabels />);
    await expectNoA11yViolations(container);
  });
});
