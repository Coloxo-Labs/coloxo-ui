import { ArrowDownIcon, ArrowUpIcon } from "../../icons";
import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "../Badge/Badge";
import { FeaturedIcon } from "../FeaturedIcon/FeaturedIcon";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import styles from "./Statistic.module.css";

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
    <div className={cx(styles.root, className)} data-size={size} {...rest}>
      {(featuredIcon || icon) && (
        <div className={styles.iconRow}>
          {featuredIcon ? (
            <FeaturedIcon type="light-circle" color="brand" size={size === "sm" ? "sm" : "md"}>
              {featuredIcon}
            </FeaturedIcon>
          ) : (
            <span className={styles.icon}>
              <Icon size="sm">{icon}</Icon>
            </span>
          )}
        </div>
      )}
      <div className={styles.label}>{label}</div>
      <div className={styles.valueRow}>
        {prefix ? <span className={styles.affix}>{prefix}</span> : null}
        <span className={styles.value}>{value}</span>
        {suffix ? <span className={styles.affix}>{suffix}</span> : null}
      </div>
      {(trend || description) && (
        <div className={styles.trendRow}>
          {trend ? (
            <Badge type="pill-color" color={trendColor} size="sm" className={styles.trendBadge}>
              <Icon size="xs">
                {direction === "down" ? <ArrowDownIcon /> : <ArrowUpIcon />}
              </Icon>
              {trend}
            </Badge>
          ) : null}
          {description ? <div className={styles.description}>{description}</div> : null}
        </div>
      )}
    </div>
  );
}
