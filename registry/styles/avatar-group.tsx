import type { HTMLAttributes, ReactNode } from "react";
import { Avatar, type AvatarSize } from "./avatar";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  item: "ml--2 rounded-full first:ml-0",
  lg: "w-12 h-12",
  md: "w-10 h-10",
  overflow:
    "inline-flex items-center justify-center ml--2 rounded-full bg-cx-secondary text-cx-secondary font-sans text-xs leading-4 font-semibold",
  root: "inline-flex items-center",
  size2xl: "w-16 h-16",
  sm: "w-8 h-8",
  xl: "w-14 h-14",
  xs: "w-6 h-6",
};

export type AvatarGroupItem = {
  src?: string;
  alt?: string;
  initials?: string;
  key?: string;
};

export type AvatarGroupProps = HTMLAttributes<HTMLDivElement> & {
  items: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  /** Outer ring on each avatar (Untitled default look in stacks). */
  border?: boolean;
  overflowLabel?: ReactNode;
};

export function AvatarGroup({
  items,
  max = 5,
  size = "md",
  border = false,
  overflowLabel,
  className,
  ...rest
}: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = Math.max(0, items.length - max);
  const sizeClass = size === "2xl" ? CX.size2xl : CX[size];

  return (
    <div className={cx(CX.root, className)} role="group" {...rest}>
      {visible.map((item, index) => (
        <span key={item.key ?? item.src ?? item.initials ?? index} className={CX.item}>
          <Avatar
            src={item.src}
            alt={item.alt}
            initials={item.initials}
            size={size}
            border={border}
          />
        </span>
      ))}
      {overflow > 0 ? (
        <span className={cx(CX.overflow, sizeClass)} aria-label={`${overflow} more`}>
          {overflowLabel ?? `+${overflow}`}
        </span>
      ) : null}
    </div>
  );
}
