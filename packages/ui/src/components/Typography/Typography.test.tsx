import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Heading, Text } from "./Typography";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Typography", () => {
  it("renders heading levels", () => {
    renderWithTheme(<Heading level={1}>Employees</Heading>);
    expect(screen.getByRole("heading", { level: 1, name: "Employees" })).toBeInTheDocument();
  });

  it("derives size and weight from level", () => {
    const { container } = renderWithTheme(<Heading level={5}>Compact</Heading>);
    const el = screen.getByRole("heading", { level: 5, name: "Compact" });
    expect(el.className).toMatch(/heading-sm/);
    expect(el.className).toMatch(/weightSemibold/);
    expect(container).toBeTruthy();
  });

  it("applies size, weight, and tracking overrides", () => {
    renderWithTheme(
      <Heading level={2} size="2xl" weight="bold" tracking="tighter">
        Hero
      </Heading>,
    );
    const el = screen.getByRole("heading", { level: 2, name: "Hero" });
    expect(el.className).toMatch(/heading-2xl/);
    expect(el.className).toMatch(/weightBold/);
    expect(el.className).toMatch(/trackingTighter/);
  });

  it("renders text variants and polymorphic as", () => {
    renderWithTheme(
      <>
        <Text variant="caption">Helper</Text>
        <Text as="span" variant="code">
          uuid
        </Text>
      </>,
    );
    expect(screen.getByText("Helper")).toBeInTheDocument();
    expect(screen.getByText("uuid").tagName.toLowerCase()).toBe("span");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <>
        <Heading>Title</Heading>
        <Text>Body copy</Text>
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
