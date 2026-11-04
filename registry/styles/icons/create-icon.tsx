import type { SVGProps } from "react";
import { forwardRef, type ReactNode } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function createIcon(displayName: string, children: ReactNode) {
  const Icon = forwardRef<SVGSVGElement, IconSvgProps>(function Icon(
    { size = 24, width, height, ...rest },
    ref,
  ) {
    const w = width ?? size;
    const h = height ?? size;
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={w}
        height={h}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
      >
        {children}
      </svg>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}
