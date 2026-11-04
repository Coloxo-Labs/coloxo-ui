import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act } from "@testing-library/react";
import { Vortex } from "./Vortex";
import {
  clamp01,
  sanitizeColors,
  clampParticles,
  clampSpeed,
  clampRange,
} from "./vortexEngine";
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
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    POINTS: 0x0000,
    TRIANGLES: 0x0004,
    COLOR_BUFFER_BIT: 0x4000,
    BLEND: 0x0be2,
    SRC_ALPHA: 0x0302,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 0x0303,
    LINK_STATUS: 0x8b82,
    COMPILE_STATUS: 0x8b81,
    DEPTH_TEST: 0x0b71,
    TEXTURE_2D: 0x0de1,
    TEXTURE0: 0x84c0,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    LINEAR: 0x2601,
    CLAMP_TO_EDGE: 0x812f,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    FRAMEBUFFER: 0x8d40,
    COLOR_ATTACHMENT0: 0x8ce0,
    FRAMEBUFFER_COMPLETE: 0x8cd5,
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
    getAttribLocation: vi.fn((_p: unknown, name: string) => (name === "aSeed" ? 0 : 1)),
    getUniformLocation: vi.fn((_p: unknown, name: string) => loc(name)),
    createBuffer: vi.fn(() => ({})),
    deleteBuffer: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createTexture: vi.fn(() => ({})),
    deleteTexture: vi.fn(),
    bindTexture: vi.fn(),
    texParameteri: vi.fn(),
    texImage2D: vi.fn(),
    activeTexture: vi.fn(),
    createFramebuffer: vi.fn(() => ({})),
    deleteFramebuffer: vi.fn(),
    bindFramebuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    checkFramebufferStatus: vi.fn(() => 0x8cd5),
    createVertexArray: vi.fn(() => ({})),
    deleteVertexArray: vi.fn(),
    bindVertexArray: vi.fn(),
    useProgram: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    viewport: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    blendFunc: vi.fn(),
    drawArrays: vi.fn(),
    getExtension: vi.fn(() => null),
  };
}

describe("vortexEngine helpers", () => {
  it("falls back to defaults when colors are empty", () => {
    expect(sanitizeColors([])).toHaveLength(4);
    expect(sanitizeColors(undefined)).toHaveLength(4);
  });

  it("keeps valid color strings", () => {
    expect(sanitizeColors(["#fff", "  ", "rgb(0,0,0)"])).toEqual(["#fff", "rgb(0,0,0)"]);
  });

  it("clamps numeric props", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clampParticles(10)).toBe(40);
    expect(clampParticles(2000)).toBe(900);
    expect(clampSpeed(0)).toBe(0.1);
    expect(clampSpeed(9)).toBe(3);
    expect(clampRange(0.1)).toBe(0.25);
    expect(clampRange(5)).toBe(2);
  });
});

describe("Vortex", () => {
  let getContextSpy: any;
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
          arc: vi.fn(),
          fill: vi.fn(),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          canvas: document.createElement("canvas"),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as typeof HTMLCanvasElement.prototype.getContext);

    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    cafSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    getContextSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("renders children above a canvas", () => {
    const { getByText, container } = renderWithTheme(
      <Vortex>
        <h1>Hero</h1>
        <button type="button">Action</button>
      </Vortex>,
    );
    expect(getByText("Hero")).toBeTruthy();
    expect(getByText("Action")).toBeTruthy();
    expect(container.querySelector("canvas")).toBeTruthy();
    expect(container.querySelector("[data-cx-vortex]")).toBeTruthy();
  });

  it("marks paused state on the root", () => {
    const { container } = renderWithTheme(
      <Vortex paused>
        <span>Content</span>
      </Vortex>,
    );
    expect(container.querySelector("[data-paused='true']")).toBeTruthy();
  });

  it("disposes cleanly on unmount", () => {
    const { unmount, container } = renderWithTheme(
      <Vortex>
        <span>x</span>
      </Vortex>,
    );
    expect(container.querySelector("[data-cx-vortex]")).toBeTruthy();
    act(() => {
      unmount();
    });
    expect(container.querySelector("[data-cx-vortex]")).toBeNull();
    expect(cafSpy).toHaveBeenCalled();
  });

  it("uses WebGL when available", () => {
    renderWithTheme(
      <Vortex colors={["#072699", "#32B8FF"]} quality="low" intensity={1} particles={80}>
        <p>Panel</p>
      </Vortex>,
    );
    const types = getContextSpy.mock.calls.map((c: any[]) => c[0]);
    expect(types.some((t: string) => t === "webgl2" || t === "webgl")).toBe(true);
  });

  it("falls back to Canvas 2D when WebGL is unavailable", () => {
    getContextSpy.mockImplementation(((type: string) => {
      if (type === "2d") {
        return {
          setTransform: vi.fn(),
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          beginPath: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as any);

    const { container } = renderWithTheme(
      <Vortex>
        <span>ok</span>
      </Vortex>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});
