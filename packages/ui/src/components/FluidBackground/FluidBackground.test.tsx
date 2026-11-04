import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act } from "@testing-library/react";
import { FluidBackground } from "./FluidBackground";
import { clamp01, sanitizeColors } from "./fluidEngine";
import { renderWithTheme } from "../../test/utils";

describe("sanitizeColors / clamp01", () => {
  it("falls back to defaults when colors are empty", () => {
    expect(sanitizeColors([])).toHaveLength(4);
    expect(sanitizeColors(undefined)).toHaveLength(4);
  });

  it("keeps valid color strings", () => {
    expect(sanitizeColors(["#fff", "  ", "rgb(0,0,0)"])).toEqual(["#fff", "rgb(0,0,0)"]);
  });

  it("clamps intensity-like values", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(Number.NaN)).toBe(0);
  });
});

describe("FluidBackground", () => {
  let getContextSpy: { mockRestore: () => void; mock: { calls: unknown[][] } };

  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      stroke: vi.fn(),
      canvas: document.createElement("canvas"),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    getContextSpy.mockRestore();
  });

  it("renders children above a canvas", () => {
    const { getByText, container } = renderWithTheme(
      <FluidBackground>
        <h1>Hero</h1>
        <button type="button">Action</button>
      </FluidBackground>,
    );
    expect(getByText("Hero")).toBeTruthy();
    expect(getByText("Action")).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(container.querySelector("[data-cx-fluid-background]")).toBeTruthy();
  });

  it("marks disabled state on the root", () => {
    const { container } = renderWithTheme(
      <FluidBackground disabled>
        <span>Content</span>
      </FluidBackground>,
    );
    expect(container.querySelector("[data-disabled='true']")).toBeTruthy();
  });

  it("disposes cleanly on unmount", () => {
    const { unmount, container } = renderWithTheme(
      <FluidBackground>
        <span>x</span>
      </FluidBackground>,
    );
    expect(container.querySelector("[data-cx-fluid-background]")).toBeTruthy();
    act(() => {
      unmount();
    });
    expect(container.querySelector("[data-cx-fluid-background]")).toBeNull();
  });

  it("accepts custom colors and quality without crashing", () => {
    const { container } = renderWithTheme(
      <FluidBackground
        colors={["#072699", "#32B8FF"]}
        quality="low"
        intensity={1}
        trailPersistence={0.2}
      >
        <p>Panel</p>
      </FluidBackground>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(getContextSpy.mock.calls.length).toBeGreaterThan(0);
  });
});
