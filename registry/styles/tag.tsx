import { XIcon } from "@/lib/icons";
import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  avatar: "w-4 h-4 rounded-full object-cover",
  close: "inline-flex border-none bg-transparent p-0 cursor-pointer",
  count: "text-cx-quaternary text-xs",
  dot: "w-1.5 h-1.5 rounded-full",
  label: "min-w-0",
  lg: "min-h-[2rem] py-0 px-3",
  md: "min-h-[1.75rem] py-0 px-2.5",
  root: "inline-flex items-center gap-1 bg-cx-primary border border-solid border-cx-primary rounded-md shadow-sm text-cx-secondary font-sans font-medium text-sm leading-5 whitespace-nowrap",
  sm: "min-h-[1.5rem] py-0 px-2",
};

export type TagSize = "sm" | "md" | "lg";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  size?: TagSize;
  onClose?: () => void;
  avatarSrc?: string;
  dot?: boolean;
  count?: number | string;
  children: ReactNode;
};

export function Tag({
  size = "md",
  onClose,
  avatarSrc,
  dot,
  count,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <span className={cx(CX.root, CX[size], className)} {...rest}>
      {dot ? <span className={CX.dot} aria-hidden="true" /> : null}
      {avatarSrc ? <img className={CX.avatar} src={avatarSrc} alt="" /> : null}
      <span className={CX.label}>{children}</span>
      {count != null ? <span className={CX.count}>{count}</span> : null}
      {onClose ? (
        <button type="button" className={CX.close} aria-label="Remove tag" onClick={onClose}>
          <Icon size="xs">
            <XIcon />
          </Icon>
        </button>
      ) : null}
    </span>
  );
}
