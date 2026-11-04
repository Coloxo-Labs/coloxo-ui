import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { ColorAlphaSlider, ColorHueSlider, ColorPicker } from "./ColorPicker";
import { GradientPicker } from "./GradientPicker";
import { DEFAULT_GRADIENT, gradientToCss } from "./gradient";
import { renderWithTheme, expectNoA11yViolations } from "../../test/utils";

describe("ColorPicker", () => {
  it("renders a trigger with the current hex value", () => {
    renderWithTheme(<ColorPicker defaultValue="#2348ff" label="Brand" />);
    expect(screen.getByText(/#2348ff/i)).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("renders solid panel controls inline", () => {
    renderWithTheme(<ColorPicker defaultValue="#2348ff" inline hideTrigger />);
    expect(screen.getByRole("slider", { name: "Hue" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Transparency" })).toBeInTheDocument();
    expect(screen.getByLabelText("Hex")).toBeInTheDocument();
  });

  it("renders swatch variant grid inline", () => {
    renderWithTheme(<ColorPicker variant="swatches" defaultValue="#2348ff" inline hideTrigger />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("calls onChange when color is updated via swatch", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ColorPicker
        value="#2348ff"
        onChange={onChange}
        variant="swatches"
        swatches={["#2348ff", "#ff0000"]}
        inline
        hideTrigger
      />,
    );
    const options = screen.getAllByRole("option");
    await act(async () => {
      fireEvent.click(options[1]!);
    });
    expect(onChange).toHaveBeenCalled();
    expect(String(onChange.mock.calls[0]?.[0]).toLowerCase()).toContain("ff0000");
  });

  it("has no axe violations for inline solid panel", async () => {
    const { container } = renderWithTheme(
      <ColorPicker defaultValue="#2348ff" label="Accent" inline hideTrigger />,
    );
    await expectNoA11yViolations(container);
  });
});

describe("ColorHueSlider / ColorAlphaSlider", () => {
  it("renders standalone hue slider", () => {
    renderWithTheme(<ColorHueSlider defaultValue="#2348ff" />);
    expect(screen.getByRole("slider", { name: "Hue" })).toBeInTheDocument();
  });

  it("renders standalone transparency slider", () => {
    renderWithTheme(<ColorAlphaSlider defaultValue="#2348ff" />);
    expect(screen.getByRole("slider", { name: "Transparency" })).toBeInTheDocument();
  });
});

describe("GradientPicker", () => {
  it("renders gradient stops and css output as a separate type", () => {
    renderWithTheme(<GradientPicker defaultValue={DEFAULT_GRADIENT} inline hideTrigger />);
    expect(screen.getByRole("group", { name: "Gradient stops" })).toBeInTheDocument();
    expect(screen.getByText(gradientToCss(DEFAULT_GRADIENT))).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Hue" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Solid" })).not.toBeInTheDocument();
  });
});
