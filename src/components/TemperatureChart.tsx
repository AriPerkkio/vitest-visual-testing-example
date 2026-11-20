import { useId } from "preact/hooks";
import type { HourlyPoint, Units } from "../api/types";
import { formatHour, formatTemp, unitSymbol } from "../format";

interface Props {
  points: HourlyPoint[];
  units: Units;
  width?: number;
  height?: number;
}

const PADDING = { top: 28, right: 16, bottom: 28, left: 16 };

export function TemperatureChart({ points, units, width = 640, height = 220 }: Props) {
  const gradientId = useId();
  if (points.length < 2) return null;

  const temps = points.map((p) => p.temperature);
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  const x = (i: number) => PADDING.left + (i / (points.length - 1)) * innerW;
  const y = (t: number) => PADDING.top + (1 - (t - min) / (max - min)) * innerH;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.temperature).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${height - PADDING.bottom} L${x(0).toFixed(1)},${height - PADDING.bottom} Z`;

  const labelled = points.map((p, i) => ({ ...p, i })).filter(({ i }) => i % 3 === 0);

  return (
    <section class="card chart" aria-label="24-hour temperature">
      <h3 class="card__title">Next 24 hours ({unitSymbol(units)})</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        class="chart__svg"
        role="img"
        aria-label="Hourly temperature chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" class="chart__stop-top" />
            <stop offset="100%" class="chart__stop-bottom" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            class="chart__grid"
            x1={PADDING.left}
            x2={width - PADDING.right}
            y1={PADDING.top + f * innerH}
            y2={PADDING.top + f * innerH}
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} class="chart__line" />
        {labelled.map((p) => (
          <g key={p.time}>
            <circle class="chart__dot" cx={x(p.i)} cy={y(p.temperature)} r="3.5" />
            <text class="chart__value" x={x(p.i)} y={y(p.temperature) - 10} text-anchor="middle">
              {formatTemp(p.temperature)}
            </text>
            <text class="chart__label" x={x(p.i)} y={height - 8} text-anchor="middle">
              {formatHour(p.time)}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
