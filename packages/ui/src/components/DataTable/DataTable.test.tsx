import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./DataTable";
import type { DataTableColumn, DataTableQuery } from "./types";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

type Row = {
  id: string;
  name: string;
  dept: string;
  status: string;
};

const rows: Row[] = [
  { id: "1", name: "Ada Lovelace", dept: "Engineering", status: "active" },
  { id: "2", name: "Grace Hopper", dept: "Research", status: "leave" },
  { id: "3", name: "Alan Turing", dept: "Research", status: "active" },
];

const columns: DataTableColumn<Row>[] = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  {
    key: "dept",
    title: "Department",
    dataIndex: "dept",
    filter: { type: "select", options: [{ label: "Research", value: "Research" }] },
  },
  { key: "status", title: "Status", dataIndex: "status" },
];

describe("DataTable", () => {
  it("paginates in client mode", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DataTable
        columns={columns}
        data={rows}
        pagination={{ pageSize: 2 }}
        defaultQuery={{ page: 1, pageSize: 2 }}
      />,
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.queryByText("Alan Turing")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Alan Turing")).toBeInTheDocument();
  });

  it("sorts when header is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<DataTable columns={columns} data={rows} pagination />);
    await user.click(screen.getByRole("button", { name: "Name" }));
    const cells = screen.getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Ada Lovelace");
  });

  it("searches with debounce and resets page", () => {
    vi.useFakeTimers();
    const onQueryChange = vi.fn();
    renderWithTheme(
      <DataTable
        columns={columns}
        data={rows}
        search={{ debounceMs: 300 }}
        pagination={{ pageSize: 1 }}
        defaultQuery={{ page: 2, pageSize: 1 }}
        onQueryChange={onQueryChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Search table"), { target: { value: "grace" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "grace", page: 1 }),
    );
    vi.useRealTimers();
  });

  it("supports controlled query", () => {
    const query: DataTableQuery = { page: 1, pageSize: 10, search: "ada" };
    renderWithTheme(
      <DataTable columns={columns} data={rows} query={query} onQueryChange={() => {}} search />,
    );
    expect(screen.getByDisplayValue("ada")).toBeInTheDocument();
  });

  it("supports row selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <DataTable
        columns={columns}
        data={rows}
        rowSelection={{ onChange }}
        getRowId={(row) => row.id}
      />,
    );
    const boxes = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(boxes[0]!);
    expect(onChange).toHaveBeenCalled();
  });

  it("shows loading skeleton", () => {
    renderWithTheme(<DataTable columns={columns} data={[]} loading pagination />);
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
  });

  it("shows empty state", () => {
    renderWithTheme(
      <DataTable
        columns={columns}
        data={[]}
        empty={{ title: "No rows", description: "Add data" }}
        pagination
      />,
    );
    expect(screen.getByText("No rows")).toBeInTheDocument();
  });

  it("shows error state", () => {
    renderWithTheme(
      <DataTable columns={columns} data={rows} error errorConfig={{ title: "Load failed" }} />,
    );
    expect(screen.getByText("Load failed")).toBeInTheDocument();
  });

  it("renders grid view", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DataTable
        columns={columns}
        data={rows}
        renderGridItem={(row) => <div>{row.name}</div>}
        defaultViewMode="list"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Grid view" }));
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("applies row density and nested dataIndex with custom compare", async () => {
    type Nested = { id: string; metrics: { score: number }; name: string };
    const nestedRows: Nested[] = [
      { id: "a", name: "Alpha", metrics: { score: 10 } },
      { id: "b", name: "Beta", metrics: { score: 30 } },
      { id: "c", name: "Gamma", metrics: { score: 20 } },
    ];
    const nestedCols: DataTableColumn<Nested>[] = [
      { key: "name", title: "Name", dataIndex: "name" },
      {
        key: "score",
        title: "Score",
        dataIndex: "metrics.score",
        sortable: {
          compare: (a, b) => a.metrics.score - b.metrics.score,
        },
        align: "right",
      },
    ];

    const { container } = renderWithTheme(
      <DataTable
        columns={nestedCols}
        data={nestedRows}
        rowDensity="compact"
        defaultQuery={{ page: 1, pageSize: 10, sort: [{ field: "score", order: "desc" }] }}
      />,
    );

    expect(container.querySelector('[data-testid="data-table"]')).toHaveAttribute(
      "data-density",
      "compact",
    );
    const cells = screen.getAllByRole("cell");
    // First data row should be Beta (score 30) after desc sort via compare
    expect(cells[0]).toHaveTextContent("Beta");
    expect(cells[1]).toHaveTextContent("30");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithTheme(
      <DataTable columns={columns} data={rows} search pagination rowSelection={{}} />,
    );
    await expectNoA11yViolations(container);
  });
});
