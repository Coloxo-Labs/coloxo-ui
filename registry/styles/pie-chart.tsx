"use client";

import { useId, type CSSProperties } from "react";
import { cx } from "@/lib/utils";
import { ChartTooltip } from "./chart-tooltip";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  centerLabel: "text-xs",
  chart: "block w-full max-w-full h-auto",
  empty: "grid text-cx-tertiary text-sm",
  legend: "flex justify-center flex-wrap gapy-3 gapx-4 pt-3 px-0 pb-0 m-0 text-xs text-cx-secondary",
  percentage: "text-[13px] font-semibold pointer-events-none",
  root: "relative w-full min-w-0 m-0 font-sans text-cx-primary",
  slice: "transition-opacity focus-visible:outline",
  srOnly: "absolute w-px h-px p-0 m-px overflow-hidden whitespace-nowrap border-0",
  swatch: "w-2.5 h-2.5",
  total: "font-semibold",
};

export type PieChartDatum = { label: string; value: number; color?: string };
export type PieChartProps = {
  data: PieChartDatum[];
  label: string;
  /** Hole radius as a percentage of the outer radius. Zero creates a pie. */
  innerRadius?: number;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  centerLabel?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
};

const COLORS = ["var(--cx-brand-600)", "var(--cx-brand-400)", "var(--cx-blue-400)", "var(--cx-green-600)", "var(--cx-orange-500)"];
const formatValue = (value: number) => value.toLocaleString();
const cleanValue = (value: number) => Number.isFinite(value) && value > 0 ? value : 0;
const point = (radius: number, angle: number) => `${160 + radius * Math.cos(angle)},${160 + radius * Math.sin(angle)}`;

function slicePath(start: number, end: number, inner: number) {
  const middle = (start + end) / 2;
  const outer = `M ${point(140, start)} A 140 140 0 0 1 ${point(140, middle)} A 140 140 0 0 1 ${point(140, end)}`;
  return inner > 0
    ? `${outer} L ${point(inner, end)} A ${inner} ${inner} 0 0 0 ${point(inner, middle)} A ${inner} ${inner} 0 0 0 ${point(inner, start)} Z`
    : `${outer} L 160 160 Z`;
}

/** Responsive pie and donut charts with keyboard-readable values and a data table. */
export function PieChart({ data, label, innerRadius = 0, height = 280, showLegend = true, showLabels = false, centerLabel, valueFormatter = formatValue, className, style }: PieChartProps) {
  const id = useId();
  const rows = data.map((item) => ({ ...item, value: cleanValue(item.value) }));
  const largest = Math.max(0, ...rows.map((item) => item.value));
  const weightTotal = largest ? rows.reduce((sum, item) => sum + item.value / largest, 0) : 0;
  const total = rows.reduce((sum, item) => sum + item.value, 0);
  const inner = (Number.isFinite(innerRadius) ? Math.min(80, Math.max(0, innerRadius)) : 0) * 1.4;
  const chartHeight = Number.isFinite(height) ? Math.max(160, height) : 280;
  let angle = -Math.PI / 2;

  return <figure className={cx(CX.root, className)} style={style} aria-label={label}>
    {!weightTotal ? <div className={CX.empty} style={{ height: chartHeight }}>No data available</div> : <>
      <svg
        className={CX.chart}
        style={{ width: `min(100%, ${chartHeight}px)` }}
        viewBox="0 0 320 320"
        role="img"
        aria-label={label}
        aria-describedby={`${id}-description`}
      >
        <desc id={`${id}-description`}>Category shares of the total. Focus a slice to read its value. Values are also provided in the accompanying data table.</desc>
        {rows.map((item, index) => {
          if (!item.value) return null;
          const share = (item.value / largest) / weightTotal;
          const start = angle;
          angle += share * Math.PI * 2;
          const middle = (start + angle) / 2;
          const textRadius = inner > 0 ? (140 + inner) / 2 : 92;
          const description = `${item.label}: ${valueFormatter(item.value)} (${(share * 100).toFixed(1)}%)`;
          return <g key={index}>
            <ChartTooltip label={item.label} items={[{ label: "Value", value: valueFormatter(item.value), color: item.color ?? COLORS[index % COLORS.length]!, supportingText: `${(share * 100).toFixed(1)}% of total` }]}>
              <path className={CX.slice} d={slicePath(start, angle, inner)} fill={item.color ?? COLORS[index % COLORS.length]} tabIndex={0} role="img" aria-label={description} />
            </ChartTooltip>
            {showLabels && share >= 0.06 && <text className={CX.percentage} x={160 + textRadius * Math.cos(middle)} y={160 + textRadius * Math.sin(middle)} textAnchor="middle" dominantBaseline="middle" aria-hidden="true">{Math.round(share * 100)}%</text>}
          </g>;
        })}
        {inner > 0 && centerLabel && <g aria-hidden="true"><text className={CX.total} x={160} y={156} textAnchor="middle">{valueFormatter(total)}</text><text className={CX.centerLabel} x={160} y={178} textAnchor="middle">{centerLabel}</text></g>}
      </svg>
      {showLegend && <ul className={CX.legend} aria-label="Chart legend">{rows.map((item, index) => <li key={index}><span className={CX.swatch} style={{ background: item.color ?? COLORS[index % COLORS.length] }} aria-hidden="true" />{item.label}</li>)}</ul>}
      <table className={CX.srOnly}><caption>{label} — data</caption><thead><tr><th scope="col">Category</th><th scope="col">Value</th><th scope="col">Share</th></tr></thead><tbody>{rows.map((item, index) => <tr key={index}><th scope="row">{item.label}</th><td>{valueFormatter(item.value)}</td><td>{((item.value / largest) / weightTotal * 100).toFixed(1)}%</td></tr>)}</tbody></table>
    </>}
  </figure>;
}
