import type { CSSProperties, ReactNode } from "react";
import { numeric, rgbTriple } from "../../_internal/visuals/color";
import { GlslVisual } from "../_shared/GlslVisual";
import { RIFT_SCAN_FRAGMENT } from "../_shared/shaders/atmosphereShaders";
import type { VisualQuality } from "../_shared/types";

export type DimensionalRiftScannerProps = {
  children?: ReactNode;
  /** Scan sweep speed, 0 to 1.5. Default 0.3. */
  scanSpeed?: number;
  /** Scanline thickness, 0.005 to 0.3. Default 0.045. */
  scanWidth?: number;
  /** Glitch intensity, 0 to 1. Default 0.4. */
  corruption?: number;
  /** Surface grid density, 4 to 60. Default 18. */
  gridDensity?: number;
  /** Afterglow length above the scanline, 0 to 0.5. Default 0.18. */
  trailLength?: number;
  /** Scan colour. Default cyan. */
  scanColor?: string;
  /** Surface colour. Default Coloxo blue. */
  baseColor?: string;
  paused?: boolean;
  respectReducedMotion?: boolean;
  quality?: VisualQuality;
  className?: string;
  style?: CSSProperties;
};

/**
 * A dimensional scanner: a bright line sweeps the frame and reveals a corrupted structural surface
 * only in its immediate path, with horizontal tear bands keyed to the frame's own time step.
 */
export function DimensionalRiftScanner({
  children,
  scanSpeed,
  scanWidth,
  corruption,
  gridDensity,
  trailLength,
  scanColor = "#22D3EE",
  baseColor = "#2348FF",
  paused = false,
  quality = "medium",
  className,
  style,
}: DimensionalRiftScannerProps) {
  return (
    <GlslVisual
      source={RIFT_SCAN_FRAGMENT}
      uniforms={{
        uScanSpeed: numeric(scanSpeed, 0.3, 0, 1.5),
        uScanWidth: numeric(scanWidth, 0.045, 0.005, 0.3),
        uCorruption: numeric(corruption, 0.4, 0, 1),
        uGridDensity: numeric(gridDensity, 18, 4, 60),
        uTrail: numeric(trailLength, 0.18, 0, 0.5),
        uScanColor: rgbTriple(scanColor, { r: 0.13, g: 0.83, b: 0.93 }),
        uBaseColor: rgbTriple(baseColor, { r: 0.14, g: 0.28, b: 1 }),
      }}
      dataAttribute="data-cx-rift-scanner"
      backdrop="radial-gradient(circle at 50% 50%, #060a1a 0%, #010206 78%)"
      paused={paused}
      quality={quality}
      className={className}
      style={style}
    >
      {children}
    </GlslVisual>
  );
}
