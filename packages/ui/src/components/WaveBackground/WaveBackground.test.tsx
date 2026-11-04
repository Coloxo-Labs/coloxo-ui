import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { WaveBackground } from "./WaveBackground";
import {
  clamp01,
  sanitizeColors,
  clampSpeed,
  clampFrequency,
  clampRadius,
  clampDecay,
  WaveEngine,
} from "./waveEngine";
import { renderWithTheme } from "../../test/utils";

function createWebGLMock() {
  const locs = new Map<string, object>();
  const loc = (name: string) => {
    if (!locs.has(name)) locs.set(name, { name });
    return locs.get(name)!;
  };
  return {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    TRIANGLES: 0x0004,
    UNSIGNED_SHORT: 0x1403,
    COLOR_BUFFER_BIT: 0x4000,
    BLEND: 0x0be2,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    LINK_STATUS: 0x8b82,
    COMPILE_STATUS: 0x8b81,
    DEPTH_TEST: 0x0b71,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    deleteProgram: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn((_p: unknown, name: string) => loc(name)),
    createBuffer: vi.fn(() => ({})),
    deleteBuffer: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    useProgram: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniform1f: vi.fn(),
    uniform3f: vi.fn(),
    viewport: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    blendFunc: vi.fn(),
    drawElements: vi.fn(),
    getExtension: vi.fn(() => null),
  };
}

describe("waveEngine helpers", () => {
  it("falls back to defaults when colors are empty", () => {
    expect(sanitizeColors([])).toHaveLength(3);
    expect(sanitizeColors(undefined)).toHaveLength(3);
  });

  it("keeps valid color strings", () => {
    expect(sanitizeColors(["#fff", "  ", "rgb(0,0,0)"])).toEqual(["#fff", "rgb(0,0,0)"]);
  });

  it("clamps numeric props", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clampSpeed(0)).toBe(0.1);
    expect(clampSpeed(9)).toBe(3);
    expect(clampFrequency(0.1)).toBe(0.25);
    expect(clampFrequency(5)).toBe(2);
    expect(clampRadius(0.01)).toBe(0.05);
    expect(clampRadius(1)).toBe(0.6);
    expect(clampDecay(0)).toBe(0.1);
    expect(clampDecay(2)).toBe(1);
  });
});

describe("WaveBackground", () => {
  let getContextSpy: any;
  let rafSpy: any;
  let cafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    const gl = createWebGLMock();
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((
      type: string,
    ) => {
      if (type === "webgl2" || type === "webgl" || type === "experimental-webgl") {
        return gl as unknown as WebGLRenderingContext;
      }
      if (type === "2d") {
        return {
          setTransform: vi.fn(),
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any);

    let rafId = 0;
    rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((() => {
      rafId += 1;
      return rafId;
    }) as any);
    cafSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  it("renders children above a canvas", () => {
    const { getByText, container } = renderWithTheme(
      <WaveBackground>
        <h1>Hero</h1>
        <button type="button">Action</button>
      </WaveBackground>,
    );
    expect(getByText("Hero")).toBeTruthy();
    expect(getByText("Action")).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(container.querySelector("[data-cx-wave-background]")).toBeTruthy();
  });

  it("marks paused state on the root", () => {
    const { container } = renderWithTheme(
      <WaveBackground paused>
        <span>Content</span>
      </WaveBackground>,
    );
    expect(container.querySelector("[data-paused='true']")).toBeTruthy();
  });

  it("does not schedule continuous rAF when paused", () => {
    rafSpy.mockClear();
    renderWithTheme(
      <WaveBackground paused>
        <span>x</span>
      </WaveBackground>,
    );
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it("disposes cleanly on unmount", () => {
    const { unmount, container } = renderWithTheme(
      <WaveBackground>
        <span>x</span>
      </WaveBackground>,
    );
    expect(container.querySelector("[data-cx-wave-background]")).toBeTruthy();
    act(() => {
      unmount();
    });
    expect(container.querySelector("[data-cx-wave-background]")).toBeNull();
    expect(cafSpy).toHaveBeenCalled();
  });

  it("enters fallback when WebGL is unavailable", () => {
    getContextSpy.mockImplementation(((type: string) => {
      if (type === "2d") {
        return {
          setTransform: vi.fn(),
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          fill: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any);

    const { container } = renderWithTheme(
      <WaveBackground fallback="static">
        <p>Panel</p>
      </WaveBackground>,
    );
    const root = container.querySelector("[data-cx-wave-background]") as HTMLElement;
    expect(root).toBeTruthy();
    const fallback = root.firstElementChild as HTMLElement;
    expect(fallback.style.display).toBe("block");
    expect(fallback.style.backgroundImage).toContain("gradient");
  });

  it("decays interaction strength after pointer leave", () => {
    const root = document.createElement("div");
    Object.defineProperty(root, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 }),
    });
    const canvas = document.createElement("canvas");
    const fallback = document.createElement("div");
    document.body.append(root, canvas, fallback);

    const engine = new WaveEngine(
      root,
      canvas,
      {
        colors: ["#2563FF"],
        backgroundColor: "#050816",
        speed: 1,
        amplitude: 0.45,
        frequency: 1,
        complexity: 0.55,
        intensity: 0.7,
        interaction: true,
        interactionStrength: 0.65,
        interactionRadius: 0.22,
        interactionDecay: 0.9,
        quality: "low",
        fallback: "static",
        paused: true,
        respectReducedMotion: false,
        transparent: true,
      },
      fallback,
    );

    fireEvent.pointerMove(root, { clientX: 100, clientY: 50 });
    // Manually raise strength as move would when animating
    (engine as unknown as { strengthTarget: number; strengthSmooth: number }).strengthTarget = 1;
    (engine as unknown as { strengthSmooth: number }).strengthSmooth = 1;
    fireEvent.pointerLeave(root);
    expect((engine as unknown as { strengthTarget: number }).strengthTarget).toBe(0);

    // Step decay via private method
    (engine as unknown as { stepInteraction: (dt: number) => void }).stepInteraction(0.5);
    expect(engine.interactionStrengthSmooth).toBeLessThan(1);

    engine.dispose();
    root.remove();
    canvas.remove();
    fallback.remove();
  });
});
