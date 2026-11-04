import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { AnnouncementBar } from "./AnnouncementBar";
import { renderWithTheme } from "../../test/utils";

describe("AnnouncementBar", () => {
  it("renders message and trailing slot", () => {
    renderWithTheme(
      <AnnouncementBar trailing={<span>Action</span>}>Stable release</AnnouncementBar>,
    );
    expect(screen.getByText("Stable release")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
