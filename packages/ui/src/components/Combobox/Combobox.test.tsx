import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./Combobox";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

const options = [
  { value: "eng", label: "Engineering" },
  { value: "design", label: "Design", disabled: true },
  { value: "finance", label: "Finance" },
];

describe("Combobox", () => {
  it("filters suggestions and selects with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithTheme(
      <Combobox label="Department" options={options} onValueChange={onValueChange} />,
    );
    await user.type(screen.getByRole("combobox"), "Eng");
    expect(await screen.findByRole("option", { name: "Engineering" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Finance" })).not.toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("eng");
    expect(screen.getByRole("combobox")).toHaveValue("Engineering");
  });

  it("clears an uncontrolled selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithTheme(
      <Combobox
        label="Department"
        options={options}
        defaultValue="eng"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("shows empty results", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Combobox label="Department" options={options} />);
    await user.type(screen.getByRole("combobox"), "zzzz");
    expect(await screen.findByText("No options found")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithTheme(<Combobox label="Department" options={options} />);
    await expectNoA11yViolations(container);
  });
});
