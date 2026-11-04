import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table } from "./Table";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

const data = [
  { id: "1", name: "Ada", dept: "Engineering" },
  { id: "2", name: "Grace", dept: "Research" },
];

describe("Table", () => {
  it("renders rows and custom cells", () => {
    renderWithTheme(
      <Table
        caption="Employees"
        data={data}
        columns={[
          { id: "name", header: "Name", accessor: "name" },
          { id: "dept", header: "Department", accessor: "dept", cell: ({ value }) => String(value) },
        ]}
      />,
    );
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Research")).toBeInTheDocument();
  });

  it("sorts when enabled", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Table
        data={data}
        columns={[{ id: "name", header: "Name", accessor: "name", sortable: true }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Name/ }));
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <Table data={data} columns={[{ id: "name", header: "Name", accessor: "name" }]} />,
    );
    await expectNoA11yViolations(container);
  });
});
