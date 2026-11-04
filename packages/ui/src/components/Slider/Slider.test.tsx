import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../test/utils";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("supports keyboard steps and bounds", async () => {
    const user = userEvent.setup();
    const commit = vi.fn();
    renderWithTheme(
      <Slider
        defaultValue={[40]}
        min={0}
        max={100}
        step={5}
        aria-label="Volume"
        onValueCommit={commit}
      />,
    );
    const thumb = screen.getByRole("slider", { name: "Volume" });
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "45");
    await user.keyboard("{End}");
    expect(thumb).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{Home}");
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
    expect(commit).toHaveBeenCalledWith([45]);
  });

  it("labels range endpoints, enforces a minimum gap, and submits both values", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <form aria-label="Price filter">
        <Slider
          defaultValue={[20, 40]}
          step={10}
          minStepsBetweenThumbs={1}
          name="price"
          thumbLabels={["Minimum price", "Maximum price"]}
        />
      </form>,
    );
    const minimum = screen.getByRole("slider", { name: "Minimum price" });
    minimum.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(minimum).toHaveAttribute("aria-valuenow", "30");
    expect(screen.getByRole("slider", { name: "Maximum price" })).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
    const data = new FormData(screen.getByRole("form") as HTMLFormElement);
    expect(data.getAll("price[]")).toEqual(["30", "40"]);
  });

  it("supports controlled values and disables keyboard interaction", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = renderWithTheme(
      <Slider value={[25]} onValueChange={change} aria-label="Value" />,
    );
    rerender(<Slider value={[75]} disabled onValueChange={change} aria-label="Value" />);
    const thumb = screen.getByRole("slider", { name: "Value" });
    expect(thumb).toHaveAttribute("aria-valuenow", "75");
    await user.tab();
    expect(thumb).not.toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(change).not.toHaveBeenCalled();
  });
});
