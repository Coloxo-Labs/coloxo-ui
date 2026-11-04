import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { DocsSidebar } from "./DocsSidebar";
import { renderWithTheme } from "../../test/utils";

describe("DocsSidebar", () => {
  it("renders nav groups", () => {
    renderWithTheme(
      <DocsSidebar
        groups={[
          {
            label: "Components",
            items: [{ id: "button", label: "Button", href: "/button", active: true }],
          },
        ]}
      />,
    );
    expect(screen.getByRole("navigation", { name: /documentation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /button/i })).toHaveAttribute("aria-current", "page");
  });
});
