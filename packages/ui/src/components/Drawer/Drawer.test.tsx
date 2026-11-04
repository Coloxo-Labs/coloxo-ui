import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Drawer } from "./Drawer";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Drawer", () => {
  it("renders on the requested side", () => {
    renderWithTheme(
      <Drawer open title="Filters" side="left">
        Content
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Filters");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Drawer open title="Details" description="Employee record">
        Body
      </Drawer>,
    );
    await expectNoA11yViolations(container);
  });
});
