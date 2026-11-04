import { XIcon } from "@/lib/icons";
import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  avatar: "w-4 h-4 rounded-full object-cover ml-0.5 mr-1.5",
  badgeColor: "rounded-md",
  badgeModern: "rounded-md bg-cx-primary border-cx-primary text-cx-secondary shadow-sm",
  close:
    "inline-flex ml-1 mr-0.5 p-0 border-none bg-transparent text-inherit opacity-60 cursor-pointer hover:opacity-100",
  colorBlue: "bg-cx-blue-50 border-cx-blue-200 text-cx-blue-700",
  colorBrand: "bg-cx-brand-50 border-cx-brand-200 text-cx-brand-700",
  colorError: "bg-cx-red-50 border-cx-red-200 text-cx-red-700",
  colorGray: "bg-cx-neutral-50 border-cx-neutral-200 text-cx-neutral-700",
  colorIndigo: "bg-cx-indigo-50 border-cx-indigo-200 text-cx-indigo-700",
  colorOrange: "bg-cx-orange-50 border-cx-orange-200 text-cx-orange-700",
  colorPink: "bg-cx-pink-50 border-cx-pink-200 text-cx-pink-700",
  colorPurple: "bg-cx-purple-50 border-cx-purple-200 text-cx-purple-700",
  colorSuccess: "bg-cx-green-50 border-cx-green-200 text-cx-green-700",
  colorWarning: "bg-cx-yellow-50 border-cx-yellow-200 text-cx-yellow-700",
  dot: "w-1.5 h-1.5 rounded-full mr-1.5 shrink-0",
  label: "min-w-0",
  lg: "min-h-[1.75rem] py-1 px-3 text-sm leading-5 rounded-lg",
  md: "min-h-[1.5rem] py-0.5 px-2.5 text-sm leading-5",
  pillColor: "rounded-full",
  root: "inline-flex items-center font-sans font-medium border border-solid border-transparent whitespace-nowrap leading-none",
  sm: "min-h-[1.375rem] py-0.5 px-2 text-xs leading-4",
};

export type BadgeType = "pill-color" | "badge-color" | "badge-modern";
export type BadgeColor =
  | "brand"
  | "gray"
  | "error"
  | "warning"
  | "success"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "orange";

export type BadgeSize = "sm" | "md" | "lg";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  type?: BadgeType;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  avatarSrc?: string;
  onClose?: () => void;
  children: ReactNode;
};

const colorClass = {
  brand: CX.colorBrand,
  gray: CX.colorGray,
  error: CX.colorError,
  warning: CX.colorWarning,
  success: CX.colorSuccess,
  blue: CX.colorBlue,
  indigo: CX.colorIndigo,
  purple: CX.colorPurple,
  pink: CX.colorPink,
  orange: CX.colorOrange,
} as const;

const typeClass = {
  "pill-color": CX.pillColor,
  "badge-color": CX.badgeColor,
  "badge-modern": CX.badgeModern,
} as const;

export function Badge({
  type = "pill-color",
  color,
  size = "md",
  dot,
  avatarSrc,
  onClose,
  className,
  children,
  ...rest
}: BadgeProps) {
  const resolvedColor = color ?? "brand";
  const applyColor = type !== "badge-modern";

  return (
    <span
      className={cx(
        CX.root,
        typeClass[type],
        applyColor && colorClass[resolvedColor],
        CX[size],
        className,
      )}
      {...rest}
    >
      {dot ? <span className={CX.dot} aria-hidden="true" /> : null}
      {avatarSrc ? <img className={CX.avatar} src={avatarSrc} alt="" /> : null}
      <span className={CX.label}>{children}</span>
      {onClose ? (
        <button type="button" className={CX.close} aria-label="Remove" onClick={onClose}>
          <Icon size="xs">
            <XIcon />
          </Icon>
        </button>
      ) : null}
    </span>
  );
}
