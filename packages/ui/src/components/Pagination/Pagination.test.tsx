import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("Pagination", () => {
  it("changes page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithTheme(
      <Pagination page={1} pageSize={10} total={40} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("shows first/last controls and custom meta label", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithTheme(
      <Pagination
        page={2}
        pageSize={10}
        total={100}
        showFirstLast
        metaLabel={({ start, end, total }) => `${start}-${end}/${total}`}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByText("11-20/100")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "First page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Pagination page={2} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });
});
