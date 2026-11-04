"use client";

import { useId, type CSSProperties } from "react";
import { cx } from "../../utils/cx";
import { ChartTooltip } from "../ChartTooltip";
import styles from "./BarChart.module.css";

export type BarChartDatum = { label: string; [key: string]: string | number };
export type BarChartSeries = { key: string; label: string; color?: string };
export type BarChartColor =
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
export type BarChartProps = {
  data: BarChartDatum[];
  series: BarChartSeries[];
  /** Accessible chart name. */
  label: string;
  /** Primary palette color; the second series uses a 45% lighter tint. */
  color?: BarChartColor;
  layout?: "vertical" | "horizontal";
  stacked?: boolean;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  valueFormatter?: (value: number) => string;
  className?: string;
  style?: CSSProperties;
};

const COLORS: Record<BarChartColor, string> = {
  brand: "var(--cx-brand-600)",
  gray: "var(--cx-neutral-600)",
  error: "var(--cx-red-600)",
  warning: "var(--cx-yellow-600)",
  success: "var(--cx-green-600)",
  blue: "var(--cx-blue-600)",
  indigo: "var(--cx-indigo-500)",
  purple: "var(--cx-purple-500)",
  pink: "var(--cx-pink-500)",
  orange: "var(--cx-orange-500)",
};

/** Solid second-series fills — avoid `color-mix(var(...))` which some SVG engines drop. */
const COLORS_SOFT: Record<BarChartColor, string> = {
  brand: "var(--cx-brand-300)",
  gray: "var(--cx-neutral-300)",
  error: "var(--cx-red-300)",
  warning: "var(--cx-yellow-300)",
  success: "var(--cx-green-300)",
  blue: "var(--cx-blue-300)",
  indigo: "var(--cx-indigo-300)",
  purple: "var(--cx-purple-300)",
  pink: "var(--cx-pink-300)",
  orange: "var(--cx-orange-300)",
};
const formatValue = (value: number) => value.toLocaleString();
const valueOf = (row: BarChartDatum, key: string) => {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

/** Responsive bar chart with shared tooltips and an accessible data table. */
export function BarChart({
  data,
  series,
  label,
  color = "brand",
  layout = "vertical",
  stacked = false,
  height = 280,
  showLegend = true,
  showGrid = true,
  valueFormatter = formatValue,
  className,
  style,
}: BarChartProps) {
  const id = useId();
  const palette = [COLORS[color], COLORS_SOFT[color]];
  const seriesColor = (item: BarChartSeries, index: number) =>
    item.color ?? palette[index % palette.length]!;
  const horizontal = layout === "horizontal";
  const chartHeight = Number.isFinite(height) ? Math.max(160, height) : 280;
  const width = 640;
  // Extra left gutter so currency / dense tick labels are not clipped by parent overflow.
  const left = horizontal ? 108 : 72;
  const top = 16;
  const plotWidth = width - left - 20;
  const plotHeight = chartHeight - top - 36;
  let minimum = 0;
  let maximum = 0;
  for (const row of data) {
    const values = series.map((item) => valueOf(row, item.key));
    minimum = Math.min(
      minimum,
      stacked ? values.reduce((sum, value) => sum + Math.min(0, value), 0) : Math.min(0, ...values),
    );
    maximum = Math.max(
      maximum,
      stacked ? values.reduce((sum, value) => sum + Math.max(0, value), 0) : Math.max(0, ...values),
    );
  }
  if (minimum === maximum) maximum = minimum + 1;
  const scale = (value: number) =>
    horizontal
      ? left + ((value - minimum) / (maximum - minimum)) * plotWidth
      : top + ((maximum - value) / (maximum - minimum)) * plotHeight;
  const band = (horizontal ? plotHeight : plotWidth) / Math.max(1, data.length);
  const barSize = (band * 0.68) / (stacked ? 1 : Math.max(1, series.length));
  const empty = !data.length || !series.length;

  return (
    <figure className={cx(styles.root, className)} style={style} aria-label={label}>
      {empty ? (
        <div className={styles.empty} style={{ height: chartHeight }}>
          No data available
        </div>
      ) : (
        <>
          <svg
            className={styles.chart}
            viewBox={`0 0 ${width} ${chartHeight}`}
            role="img"
            aria-labelledby={`${id}-title ${id}-description`}
          >
            <title id={`${id}-title`}>{label}</title>
            <desc id={`${id}-description`}>
              Bar chart. Values are also provided in the accompanying data table. Focus a bar to
              read its value.
            </desc>
            {Array.from({ length: 5 }, (_, index) => {
              const value = minimum + ((maximum - minimum) * index) / 4;
              const position = scale(value);
              return (
                <g key={index}>
                  {showGrid && (
                    <line
                      className={styles.grid}
                      x1={horizontal ? position : left}
                      x2={horizontal ? position : width - 20}
                      y1={horizontal ? top : position}
                      y2={horizontal ? top + plotHeight : position}
                    />
                  )}
                  <text
                    className={styles.tick}
                    fontSize={12}
                    x={horizontal ? position : left - 10}
                    y={horizontal ? chartHeight - 12 : position + 4}
                    textAnchor={horizontal ? "middle" : "end"}
                  >
                    {valueFormatter(value)}
                  </text>
                </g>
              );
            })}
            <line
              className={styles.axis}
              x1={horizontal ? scale(0) : left}
              x2={horizontal ? scale(0) : width - 20}
              y1={horizontal ? top : scale(0)}
              y2={horizontal ? top + plotHeight : scale(0)}
            />
            {data.map((row, rowIndex) => {
              let positive = 0;
              let negative = 0;
              const categoryPosition = (horizontal ? top : left) + band * (rowIndex + 0.5);
              return (
                <g key={rowIndex}>
                  <text
                    className={styles.tick}
                    fontSize={12}
                    x={horizontal ? left - 10 : categoryPosition}
                    y={horizontal ? categoryPosition + 4 : chartHeight - 12}
                    textAnchor={horizontal ? "end" : "middle"}
                  >
                    {row.label.length > 12 ? `${row.label.slice(0, 11)}…` : row.label}
                  </text>
                  {series.map((item, seriesIndex) => {
                    const value = valueOf(row, item.key);
                    const start = stacked ? (value >= 0 ? positive : negative) : 0;
                    if (value >= 0) positive += value;
                    else negative += value;
                    const from = scale(start);
                    const to = scale(start + value);
                    const categoryStart =
                      categoryPosition - band * 0.34 + (stacked ? 0 : seriesIndex * barSize);
                    return (
                      <ChartTooltip
                        key={item.key}
                        label={row.label}
                        items={[
                          {
                            label: item.label,
                            value: valueFormatter(value),
                            color: seriesColor(item, seriesIndex)!,
                          },
                        ]}
                      >
                        <rect
                          className={styles.bar}
                          tabIndex={0}
                          role="img"
                          aria-label={`${row.label}, ${item.label}: ${valueFormatter(value)}`}
                          x={horizontal ? Math.min(from, to) : categoryStart}
                          y={horizontal ? categoryStart : Math.min(from, to)}
                          width={
                            horizontal
                              ? Math.abs(to - from)
                              : Math.max(1, barSize - (stacked ? 0 : 3))
                          }
                          height={
                            horizontal
                              ? Math.max(1, barSize - (stacked ? 0 : 3))
                              : Math.abs(to - from)
                          }
                          rx={stacked ? 0 : 4}
                          fill={seriesColor(item, seriesIndex)}
                        />
                      </ChartTooltip>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          {showLegend && (
            <ul className={styles.legend} aria-label="Chart legend">
              {series.map((item, index) => (
                <li key={item.key}>
                  <span
                    className={styles.swatch}
                    style={{ background: seriesColor(item, index) }}
                    aria-hidden="true"
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
          <table className={styles.srOnly}>
            <caption>{label} — data</caption>
            <thead>
              <tr>
                <th scope="col">Category</th>
                {series.map((item) => (
                  <th scope="col" key={item.key}>
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <th scope="row">{row.label}</th>
                  {series.map((item) => (
                    <td key={item.key}>{valueFormatter(valueOf(row, item.key))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </figure>
  );
}
