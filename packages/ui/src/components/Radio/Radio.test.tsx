import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "./Radio";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("RadioGroup", () => {
  it("selects an option", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <RadioGroup
        label="Employment type"
        options={[
          { value: "ft", label: "Full time" },
          { value: "pt", label: "Part time" },
        ]}
      />,
    );
    await user.click(screen.getByLabelText("Part time"));
    expect(screen.getByLabelText("Part time")).toBeChecked();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <RadioGroup
        label="Employment type"
        defaultValue="ft"
        options={[{ value: "ft", label: "Full time" }]}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
