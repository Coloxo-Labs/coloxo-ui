export type PointerState = {
  /** Normalized 0..1 within the container. */
  x: number;
  y: number;
  /** Container-space pixels. */
  px: number;
  py: number;
  /** -1..1 relative to the container centre. */
  nx: number;
  ny: number;
  down: boolean;
  inside: boolean;
};

export type SurfaceOptions = {
  /** Canvas backing-store scale cap. Defaults to 2. */
  maxDpr?: number;
  /** Honour `prefers-reduced-motion` by rendering one static frame. Defaults to true. */
  respectReducedMotion?: boolean;
  /** Track pointer position. Defaults to true. */
  trackPointer?: boolean;
  /** Pause the loop while the element is outside the viewport. Defaults to true. */
  pauseOffscreen?: boolean;
};

export type FrameInfo = {
  /** Milliseconds since the previous frame, already clamped so tab-switches cannot jump. */
  dt: number;
  /** Seconds elapsed since the engine started, adjusted for paused time. */
  time: number;
  width: number;
  height: number;
  dpr: number;
  pointer: PointerState;
  /** Pointer movement since the previous frame, in normalized units. */
  pointerDelta: { x: number; y: number };
};

const MAX_DT = 1 / 15;

/**
 * Shared lifecycle for every visual component: sizing, DPR, pointer input, visibility,
 * reduced-motion and offscreen pausing. Subclasses only implement `draw`.
 *
 * Every visual in this library owns a canvas that fills its container, so centralising the
 * bookkeeping is what keeps 30 GPU effects from fighting over resize listeners and rAF handles.
 */
export abstract class VisualEngine {
  protected readonly container: HTMLElement;
  protected readonly canvas: HTMLCanvasElement;
  protected width = 0;
  protected height = 0;
  protected dpr = 1;

  protected readonly pointer: PointerState = {
    x: 0.5,
    y: 0.5,
    px: 0,
    py: 0,
    nx: 0,
    ny: 0,
    down: false,
    inside: false,
  };

  private reducedMotion = false;
  private prefersReduced = true;
  private hidden = false;
  private offscreen = false;
  private paused = false;
  private disposed = false;
  private started = false;
  private frameHandle = 0;
  private lastTimestamp = 0;
  private elapsed = 0;

  private readonly pauseOffscreen: boolean;
  private readonly trackPointer: boolean;
  private readonly maxDpr: number;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private mediaQuery: MediaQueryList | null = null;
  private prevPointer = { x: 0.5, y: 0.5 };

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, options: SurfaceOptions = {}) {
    this.container = container;
    this.canvas = canvas;
    this.maxDpr = options.maxDpr ?? 2;
    this.pauseOffscreen = options.pauseOffscreen ?? true;
    this.trackPointer = options.trackPointer ?? true;
    this.prefersReduced = options.respectReducedMotion ?? true;
  }

  /** Called once at the start of `start()`, before the first resize. Acquire contexts here. */
  protected init(): void {}

  /** Called once after the first successful resize. */
  protected abstract draw(frame: FrameInfo): void;
  /** Release GPU/DOM resources. Always call `super.dispose()`. */
  protected abstract release(): void;

  start(): void {
    if (this.disposed || this.started) return;
    this.started = true;
    this.init();
    this.observe();
    this.resize();
    this.startLoop();
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    if (paused) this.stopLoop();
    else this.startLoop();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener("change", this.onMotionChange);
      this.mediaQuery = null;
    }
    document.removeEventListener("visibilitychange", this.onVisibility);
    if (this.trackPointer) {
      const el = this.container;
      el.removeEventListener("pointermove", this.onPointerMove);
      el.removeEventListener("pointerdown", this.onPointerDown);
      el.removeEventListener("pointerup", this.onPointerUp);
      el.removeEventListener("pointerleave", this.onPointerLeave);
    }
    this.release();
  }

  protected get isStatic(): boolean {
    return this.prefersReduced && this.reducedMotion;
  }

  protected get isInteractive(): boolean {
    return this.pointer.inside;
  }

  /** Runs `draw` once with a zero delta; used for reduced-motion and paused states. */
  protected renderOnce(): void {
    if (!this.width || !this.height) return;
    this.draw({
      dt: 0,
      time: this.elapsed,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      pointer: this.pointer,
      pointerDelta: { x: 0, y: 0 },
    });
  }

  private observe(): void {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);
    }

    if (this.pauseOffscreen && typeof IntersectionObserver !== "undefined") {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        this.offscreen = !entry.isIntersecting;
        if (this.offscreen) this.stopLoop();
        else this.startLoop();
      });
      this.intersectionObserver.observe(this.container);
    }

    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      this.mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.reducedMotion = this.mediaQuery.matches;
      this.mediaQuery.addEventListener("change", this.onMotionChange);
    }

    document.addEventListener("visibilitychange", this.onVisibility);

    if (this.trackPointer) {
      const el = this.container;
      const passive = { passive: true } as AddEventListenerOptions;
      el.addEventListener("pointermove", this.onPointerMove, passive);
      el.addEventListener("pointerdown", this.onPointerDown, passive);
      el.addEventListener("pointerup", this.onPointerUp, passive);
      el.addEventListener("pointercancel", this.onPointerUp, passive);
      el.addEventListener("pointerleave", this.onPointerLeave, passive);
    }
  }

  private readonly onMotionChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
    if (this.reducedMotion) {
      this.stopLoop();
      this.renderOnce();
    } else {
      this.startLoop();
    }
  };

  private readonly onVisibility = (): void => {
    this.hidden = document.hidden;
    if (this.hidden) {
      this.stopLoop();
    } else {
      this.lastTimestamp = 0;
      this.startLoop();
    }
  };

  private updatePointer(event: PointerEvent): void {
    const rect = this.container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    this.pointer.px = px;
    this.pointer.py = py;
    this.pointer.x = px / rect.width;
    this.pointer.y = py / rect.height;
    this.pointer.nx = (px / rect.width) * 2 - 1;
    this.pointer.ny = -((py / rect.height) * 2 - 1);
    this.pointer.inside = true;
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.updatePointer(event);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.updatePointer(event);
    this.pointer.down = true;
  };

  private readonly onPointerUp = (): void => {
    this.pointer.down = false;
  };

  private readonly onPointerLeave = (): void => {
    this.pointer.down = false;
    this.pointer.inside = false;
  };

  private resize(): void {
    if (this.disposed) return;
    // Layout size, not the painted box: a CSS transform on an ancestor scales
    // getBoundingClientRect down, which would size the canvas to the scaled
    // result and leave the visual smaller than the space it fills.
    const width = Math.max(1, Math.round(this.container.clientWidth));
    const height = Math.max(1, Math.round(this.container.clientHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);

    if (width === this.width && height === this.height && dpr === this.dpr) return;

    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.onResize(width, height, dpr);

    if (this.isStatic || this.paused) this.renderOnce();
  }

  /** Hook for contexts that must reallocate buffers on size change. */
  protected onResize(_width: number, _height: number, _dpr: number): void {}

  private startLoop(): void {
    if (this.disposed || this.paused || this.hidden || this.offscreen) {
      if (this.isStatic) this.renderOnce();
      return;
    }
    if (this.isStatic) {
      this.renderOnce();
      return;
    }
    if (this.frameHandle) return;
    this.lastTimestamp = 0;
    this.frameHandle = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.frameHandle) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = 0;
    }
    this.lastTimestamp = 0;
  }

  private readonly tick = (timestamp: number): void => {
    this.frameHandle = 0;
    if (this.disposed || this.paused) return;

    const raw = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 0;
    this.lastTimestamp = timestamp;
    // Clamp so returning from a throttled tab does not teleport the simulation.
    const dt = Math.min(raw, MAX_DT);
    this.elapsed += dt;

    const pointerDelta = {
      x: this.pointer.x - this.prevPointer.x,
      y: this.pointer.y - this.prevPointer.y,
    };
    this.prevPointer = { x: this.pointer.x, y: this.pointer.y };

    this.draw({
      dt,
      time: this.elapsed,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      pointer: this.pointer,
      pointerDelta,
    });

    if (!this.disposed && !this.paused && !this.hidden && !this.offscreen) {
      this.frameHandle = requestAnimationFrame(this.tick);
    }
  };
}
