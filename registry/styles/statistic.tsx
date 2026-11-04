import { ArrowDownIcon, ArrowUpIcon } from "@/lib/icons";
import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "./badge";
import { FeaturedIcon } from "./featured-icon";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  affix: "text-lg leading-7 font-medium text-cx-tertiary",
  description: "text-sm leading-5 text-cx-tertiary",
  iconRow: "mb-1",
  label: "text-sm leading-5 text-cx-tertiary font-medium",
  root: "flex flex-col gap-2 font-sans min-w-0",
  trendBadge: "gap-1",
  trendRow: "flex items-center gap-2 mt-2 flex-wrap",
  value: "font-semibold text-cx-primary",
  valueRow: "flex items-baseline gap-1 min-w-0",
};

export type StatisticTrend = "up" | "down" | "neutral";

export type StatisticSize = "sm" | "md";

export type StatisticProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  value: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  trend?: ReactNode;
  trendDirection?: StatisticTrend;
  description?: ReactNode;
  icon?: ReactNode;
  featuredIcon?: ReactNode;
  /** `sm` densifies KPI tiles in dashboards; `md` is the default display size. */
  size?: StatisticSize;
};

export function Statistic({
  label,
  value,
  prefix,
  suffix,
  trend,
  trendDirection,
  description,
  icon,
  featuredIcon,
  size = "md",
  className,
  ...rest
}: StatisticProps) {
  const direction =
    trendDirection ??
    (typeof trend === "string" && trend.trim().startsWith("-") ? "down" : "up");

  const trendColor =
    direction === "down" ? "error" : direction === "neutral" ? "gray" : "success";

  return (
    <div className={cx(CX.root, className)} data-size={size} {...rest}>
      {(featuredIcon || icon) && (
        <div className={CX.iconRow}>
          {featuredIcon ? (
            <FeaturedIcon type="light-circle" color="brand" size={size === "sm" ? "sm" : "md"}>
              {featuredIcon}
            </FeaturedIcon>
          ) : (
            <span className={CX.icon}>
              <Icon size="sm">{icon}</Icon>
            </span>
          )}
        </div>
      )}
      <div className={CX.label}>{label}</div>
      <div className={CX.valueRow}>
        {prefix ? <span className={CX.affix}>{prefix}</span> : null}
        <span className={CX.value}>{value}</span>
        {suffix ? <span className={CX.affix}>{suffix}</span> : null}
      </div>
      {(trend || description) && (
        <div className={CX.trendRow}>
          {trend ? (
            <Badge type="pill-color" color={trendColor} size="sm" className={CX.trendBadge}>
              <Icon size="xs">
                {direction === "down" ? <ArrowDownIcon /> : <ArrowUpIcon />}
              </Icon>
              {trend}
            </Badge>
          ) : null}
          {description ? <div className={CX.description}>{description}</div> : null}
        </div>
      )}
    </div>
  );
}
