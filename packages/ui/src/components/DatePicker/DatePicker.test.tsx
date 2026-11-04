import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { format } from "date-fns";
import { DatePicker } from "./DatePicker";
import { RangePicker } from "./RangePicker";
import { TimePicker } from "./TimePicker";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("DatePicker", () => {
  it("renders a labelled trigger", () => {
    renderWithTheme(<DatePicker label="Start date" />);
    expect(screen.getByLabelText(/Start date/)).toBeInTheDocument();
  });

  it("defaults to md size", () => {
    renderWithTheme(<DatePicker label="Sized" />);
    expect(screen.getByRole("button", { name: /Sized/i })).toHaveAttribute("data-size", "md");
  });

  it("applies sm and lg sizes on the trigger", () => {
    const { rerender } = renderWithTheme(<DatePicker label="Sized" size="sm" />);
    expect(screen.getByRole("button", { name: /Sized/i })).toHaveAttribute("data-size", "sm");
    rerender(<DatePicker label="Sized" size="lg" />);
    expect(screen.getByRole("button", { name: /Sized/i })).toHaveAttribute("data-size", "lg");
  });

  it("shows formatted single value", () => {
    const date = new Date(2024, 0, 5);
    renderWithTheme(<DatePicker label="Day" defaultValue={date} />);
    expect(screen.getByText(format(date, "PPP"))).toBeInTheDocument();
  });

  it("clears the selected value", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DatePicker label="Clear me" defaultValue={new Date(2024, 0, 5)} onChange={onChange} />,
    );
    fireEvent.pointerDown(screen.getByLabelText("Clear date"));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("renders month picker trigger", () => {
    renderWithTheme(<DatePicker label="Month" picker="month" />);
    expect(screen.getByRole("button", { name: /Month/i })).toBeInTheDocument();
  });

  it("supports multiple selection display", () => {
    const date = new Date(2024, 0, 1);
    renderWithTheme(<DatePicker label="Many" multiple defaultValue={[date]} size="lg" />);
    expect(screen.getByText(format(date, "PPP"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Many/i })).toHaveAttribute("data-size", "lg");
  });

  it("renders showTime without unstable showTimeOptions", () => {
    renderWithTheme(<DatePicker label="When" showTime />);
    expect(screen.getByRole("button", { name: /When/i })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<DatePicker label="Hire date" required />);
    await expectNoA11yViolations(container);
  }, 60_000);
});

describe("RangePicker", () => {
  it("renders start and end placeholders", () => {
    renderWithTheme(<RangePicker label="Period" placeholder={["From", "To"]} />);
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
  });

  it("applies size on the range root", () => {
    const { container } = renderWithTheme(
      <RangePicker label="Period" size="sm" placeholder={["From", "To"]} />,
    );
    expect(container.querySelector("[data-size='sm']")).toBeTruthy();
  });
});

describe("TimePicker", () => {
  it("renders formatted time value", () => {
    renderWithTheme(<TimePicker label="At" defaultValue={new Date(1970, 0, 1, 14, 30, 0)} />);
    expect(screen.getByText("14:30:00")).toBeInTheDocument();
  });

  it("applies size on the trigger", () => {
    renderWithTheme(<TimePicker label="At" size="lg" />);
    expect(screen.getByRole("button", { name: /At/i })).toHaveAttribute("data-size", "lg");
  });
});
