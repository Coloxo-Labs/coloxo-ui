import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocsSearch } from "./DocsSearch";
import { renderWithTheme } from "../../test/utils";

describe("DocsSearch", () => {
  it("filters and selects items", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <DocsSearch
        value="but"
        onChange={() => {}}
        onSelect={onSelect}
        items={[
          { id: "button", label: "Button", description: "Actions" },
          { id: "badge", label: "Badge" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /button/i }));
    expect(onSelect).toHaveBeenCalledWith("button");
  });
});
