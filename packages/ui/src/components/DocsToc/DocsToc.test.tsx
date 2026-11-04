import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { DocsToc } from "./DocsToc";
import { renderWithTheme } from "../../test/utils";

describe("DocsToc", () => {
  it("renders table of contents", () => {
    renderWithTheme(
      <DocsToc items={[{ id: "usage", label: "Usage", href: "#usage", active: true }]} />,
    );
    expect(screen.getByRole("heading", { name: /on this page/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /usage/i })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });
});
