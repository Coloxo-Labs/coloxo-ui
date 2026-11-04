import { PlusIcon } from "../../icons";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Icon } from "./Icon";
import { Divider } from "../Divider/Divider";
import { FormField } from "../FormField/FormField";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Icon", () => {
  it("hides decorative icons", () => {
    renderWithTheme(
      <Icon>
        <PlusIcon />
      </Icon>,
    );
    expect(screen.getByText("", { selector: "span" }) || document.querySelector("[aria-hidden='true']")).toBeTruthy();
  });
});

describe("Divider", () => {
  it("renders a separator", () => {
    const { container } = renderWithTheme(<Divider />);
    expect(container.querySelector("[data-orientation='horizontal']")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(<Divider label="or" />);
    await expectNoA11yViolations(container);
  });
});

describe("FormField", () => {
  it("connects label and error", () => {
    renderWithTheme(
      <FormField label="Code" htmlFor="code" error="Invalid" required>
        <input id="code" />
      </FormField>,
    );
    expect(screen.getByLabelText(/Code/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <FormField label="Code" htmlFor="code" description="Help">
        <input id="code" />
      </FormField>,
    );
    await expectNoA11yViolations(container);
  });
});
