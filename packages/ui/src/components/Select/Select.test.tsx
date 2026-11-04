import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Select } from "./Select";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

const options = [
  { value: "eng", label: "Engineering" },
  { value: "hr", label: "Human Resources" },
];

describe("Select", () => {
  it("renders a labelled trigger", () => {
    renderWithTheme(<Select label="Department" options={options} placeholder="Select department" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    renderWithTheme(<Select label="Department" options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Select label="Department" options={options} />);
    await expectNoA11yViolations(container);
  });
});
