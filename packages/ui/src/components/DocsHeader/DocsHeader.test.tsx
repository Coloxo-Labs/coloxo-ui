import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocsHeader } from "./DocsHeader";
import { renderWithTheme } from "../../test/utils";

describe("DocsHeader", () => {
  it("renders brand and menu", async () => {
    const onMenuClick = vi.fn();
    renderWithTheme(
      <DocsHeader
        brandLabel="Coloxo UI"
        brandMeta="v2.4.0"
        onMenuClick={onMenuClick}
        search={<input aria-label="Search" />}
      />,
    );
    expect(screen.getByText("Coloxo UI")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Open menu"));
    expect(onMenuClick).toHaveBeenCalled();
  });

  it("renders nested nav items as a dropdown trigger", () => {
    renderWithTheme(
      <DocsHeader
        brandLabel="Coloxo UI"
        navItems={[
          { id: "overview", label: "Overview", href: "/" },
          {
            id: "resources",
            label: "Resources",
            active: true,
            children: [
              { id: "docs", label: "Documentation", href: "/docs" },
              { id: "examples", label: "Enterprise Examples", href: "/examples" },
              { id: "visual-qa", label: "Visual QA", href: "/visual-qa" },
            ],
          },
        ]}
      />,
    );

    // Desktop nav is CSS-hidden below 1024px in jsdom.
    const trigger = screen.getByRole("button", { name: /Resources/i, hidden: true });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-current", "true");
  });
});
