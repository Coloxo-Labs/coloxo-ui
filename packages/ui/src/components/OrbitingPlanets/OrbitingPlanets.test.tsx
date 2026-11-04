import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act } from "@testing-library/react";
import { OrbitingPlanets } from "./OrbitingPlanets";
import {
  clamp01,
  clampSpeed,
  clampCentralSize,
  normalizePlanets,
  DEFAULT_PLANETS,
  MAX_PLANETS,
} from "./orbitingPlanetsEngine";
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
    DYNAMIC_DRAW: 0x88e8,
    FLOAT: 0x1406,
    UNSIGNED_SHORT: 0x1403,
    UNSIGNED_BYTE: 0x1401,
    TRIANGLES: 0x0004,
    TRIANGLE_STRIP: 0x0005,
    LINE_STRIP: 0x0003,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    DEPTH_TEST: 0x0b71,
    LEQUAL: 0x0203,
    BLEND: 0x0be2,
    SRC_ALPHA: 0x0302,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    ONE: 1,
    TEXTURE_2D: 0x0de1,
    TEXTURE0: 0x84c0,
    RGBA: 0x1908,
    LINEAR: 0x2601,
    CLAMP_TO_EDGE: 0x812f,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    FRAMEBUFFER: 0x8d40,
    COLOR_ATTACHMENT0: 0x8ce0,
    FRAMEBUFFER_COMPLETE: 0x8cd5,
    LINK_STATUS: 0x8b82,
    COMPILE_STATUS: 0x8b81,
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
    getAttribLocation: vi.fn((_p: unknown, name: string) => {
      if (name === "aNormal") return 1;
      if (name === "aSide" || name === "aCenter" || name === "aSeed") return 2;
      return 0;
    }),
    getUniformLocation: vi.fn((_p: unknown, name: string) => loc(name)),
    createBuffer: vi.fn(() => ({})),
    deleteBuffer: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createVertexArray: vi.fn(() => ({})),
    deleteVertexArray: vi.fn(),
    bindVertexArray: vi.fn(),
    createTexture: vi.fn(() => ({})),
    deleteTexture: vi.fn(),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    activeTexture: vi.fn(),
    createFramebuffer: vi.fn(() => ({})),
    deleteFramebuffer: vi.fn(),
    bindFramebuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    checkFramebufferStatus: vi.fn(() => 0x8cd5),
    useProgram: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniformMatrix3fv: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    viewport: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    depthFunc: vi.fn(),
    depthMask: vi.fn(),
    blendFunc: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    getExtension: vi.fn(() => null),
  };
}

describe("orbitingPlanetsEngine helpers", () => {
  it("clamps numeric props", () => {
    expect(clamp01(2)).toBe(1);
    expect(clampSpeed(0)).toBe(0.1);
    expect(clampCentralSize(0.1)).toBe(0.35);
    expect(clampCentralSize(3)).toBe(1.2);
  });

  it("provides default planets and caps count at 16", () => {
    expect(DEFAULT_PLANETS.length).toBe(6);
    expect(normalizePlanets(undefined)).toHaveLength(DEFAULT_PLANETS.length);
    expect(MAX_PLANETS).toBe(16);
    const many = Array.from({ length: 24 }, (_, i) => ({
      ...DEFAULT_PLANETS[0]!,
      id: `x${i}`,
    }));
    expect(normalizePlanets(many)).toHaveLength(MAX_PLANETS);
  });

  it("fills missing ids", () => {
    const out = normalizePlanets([{ ...DEFAULT_PLANETS[0]!, id: "" }]);
    expect(out[0]!.id).toBe("planet-0");
  });
});

describe("OrbitingPlanets", () => {
  let getContextSpy: any;

  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((
      type: string,
    ) => {
      if (type === "2d") {
        const target: any = {
          canvas: document.createElement("canvas"),
          createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
          createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        };
        return new Proxy(target, {
          get(t, prop) {
            if (prop in t) return t[prop];
            return vi.fn();
          },
        }) as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("renders children above a canvas", () => {
    const { getByText, container } = renderWithTheme(
      <OrbitingPlanets>
        <h1>Hero</h1>
        <button type="button">Action</button>
      </OrbitingPlanets>,
    );
    expect(getByText("Hero")).toBeTruthy();
    expect(getByText("Action")).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(container.querySelector("[data-cx-orbiting-planets]")).toBeTruthy();
  });

  it("marks paused state", () => {
    const { container } = renderWithTheme(
      <OrbitingPlanets paused>
        <span>x</span>
      </OrbitingPlanets>,
    );
    expect(container.querySelector("[data-paused='true']")).toBeTruthy();
  });

  it("disposes on unmount", () => {
    const { unmount, container } = renderWithTheme(
      <OrbitingPlanets>
        <span>x</span>
      </OrbitingPlanets>,
    );
    act(() => {
      unmount();
    });
    expect(container.querySelector("[data-cx-orbiting-planets]")).toBeNull();
  });

  it("falls back to static when WebGL is unavailable", () => {
    getContextSpy.mockImplementation(() => null);
    const { container } = renderWithTheme(
      <OrbitingPlanets>
        <span>ok</span>
      </OrbitingPlanets>,
    );
    const root = container.querySelector("[data-cx-orbiting-planets]") as HTMLElement;
    const fallback = root.firstElementChild as HTMLElement;
    expect(fallback.style.display).toBe("block");
    expect(fallback.style.backgroundImage).toContain("gradient");
  });

  it("requests a canvas 2D context", () => {
    renderWithTheme(
      <OrbitingPlanets quality="low">
        <span>x</span>
      </OrbitingPlanets>,
    );
    const types = getContextSpy.mock.calls.map((c: any[]) => c[0]);
    expect(types.some((t: string) => t === "2d")).toBe(true);
  });
});
