import { describe, expect, it } from "vitest";
import { fireEvent, screen, within, waitFor } from "@testing-library/react";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";
import { BarChart } from "../BarChart";
import { PieChart } from "../PieChart";

describe("shared chart tooltips", () => {
  it.each([
    {
      name: "bar",
      chart: <BarChart label="Visitors" data={[{ label: "January", desktop: 42 }]} series={[{ key: "desktop", label: "Desktop", color: "#2348ff" }]} valueFormatter={(value) => `${value} visitors`} />,
      mark: "January, Desktop: 42 visitors",
      heading: "January",
      value: "42 visitors",
    },
    {
      name: "pie",
      chart: <PieChart label="Sources" data={[{ label: "Direct", value: 30 }, { label: "Search", value: 70 }]} valueFormatter={(value) => `${value} visitors`} />,
      mark: "Direct: 30 visitors (30.0%)",
      heading: "Direct",
      value: "30 visitors",
    },
  ])("shows formatted $name details on focus and dismisses with Escape", async ({ chart, mark, heading, value }) => {
    const { container } = renderWithTheme(chart);
    const target = screen.getByRole("img", { name: mark });
    expect(target.querySelector("title")).toBeNull();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.focus(target);
    const tooltip = screen.getByRole("tooltip");
    expect(within(tooltip).getByText(heading)).toBeInTheDocument();
    expect(within(tooltip).getByText(value)).toBeInTheDocument();
    // Portaled to document.body so ancestor overflow/transform cannot clip it.
    expect(tooltip.parentElement).toBe(document.body);
    expect(target).toHaveAttribute("aria-describedby", tooltip.id);
    if (heading === "Direct") expect(within(tooltip).getByText("30.0% of total")).toBeInTheDocument();
    await expectNoA11yViolations(container);
    fireEvent.keyDown(target, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("shows details on hover and closes when the pointer leaves", async () => {
    renderWithTheme(<BarChart label="Visitors" data={[{ label: "January", desktop: 42 }]} series={[{ key: "desktop", label: "Desktop", color: "#2348ff" }]} />);
    const target = screen.getByRole("img", { name: "January, Desktop: 42" });
    fireEvent.pointerOver(target, { pointerType: "mouse" });
    const tooltip = screen.getByRole("tooltip");
    expect(within(tooltip).getByText("42")).toBeInTheDocument();
    expect(tooltip.querySelector('[aria-hidden="true"]')).toHaveStyle({ background: "#2348ff" });
    fireEvent.pointerOut(target, { relatedTarget: document.body });
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });
});
