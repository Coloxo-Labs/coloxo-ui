import { describe, expect, it } from "vitest";
import { normalizeShowTime } from "./utils";

describe("normalizeShowTime", () => {
  it("returns a stable object for showTime=true", () => {
    const a = normalizeShowTime(true);
    const b = normalizeShowTime(true);
    expect(a).toBe(b);
  });

  it("returns null when showTime is omitted", () => {
    expect(normalizeShowTime()).toBeNull();
  });
});
