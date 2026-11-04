import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Badge } from "../Badge/Badge";
import { DocsPageHeader } from "./DocsPageHeader";
import { renderWithTheme } from "../../test/utils";

describe("DocsPageHeader", () => {
  it("renders title, breadcrumb, and badges", () => {
    renderWithTheme(
      <DocsPageHeader
        breadcrumb={[{ label: "Components", href: "/" }, { label: "Button", current: true }]}
        title="Button"
        description="Primary actions"
        badges={<Badge>Stable</Badge>}
      />,
    );
    expect(screen.getByRole("heading", { name: /button/i })).toBeInTheDocument();
    expect(screen.getByText("Primary actions")).toBeInTheDocument();
    expect(screen.getByText("Stable")).toBeInTheDocument();
  });
});
