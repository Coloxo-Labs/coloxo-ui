import { describe, expect, it } from "vitest";
import { DEFAULT_QUERY } from "./query";
import { parseDataTableQuery, serializeDataTableQuery } from "./url";

describe("DataTable url helpers", () => {
  it("round-trips query params", () => {
    const query = {
      ...DEFAULT_QUERY,
      page: 2,
      pageSize: 20,
      search: "ada",
      sort: [{ field: "name", order: "desc" as const }],
      filters: [{ field: "status", operator: "eq" as const, value: "active" }],
    };
    const serialized = serializeDataTableQuery(query);
    const parsed = parseDataTableQuery(serialized);
    expect(parsed).toEqual(query);
  });

  it("parses URLSearchParams and legacy sort", () => {
    const params = new URLSearchParams("page=3&pageSize=5&search=hr&sort=name:asc");
    expect(parseDataTableQuery(params)).toMatchObject({
      page: 3,
      pageSize: 5,
      search: "hr",
      sort: [{ field: "name", order: "asc" }],
    });
  });
});
