import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Kbd } from "./Kbd";
import { renderWithTheme } from "../../test/utils";

describe("Kbd", () => {
  it("renders keyboard hint", () => {
    renderWithTheme(<Kbd>⌘K</Kbd>);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });
});
