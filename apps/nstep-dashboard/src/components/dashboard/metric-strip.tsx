import type { DashboardMetric } from "@/lib/dashboard/contracts";
import { formatCompactNumber, formatRatio } from "@/lib/dashboard/format";
import { toneClass } from "@/lib/dashboard/format";

export function DashboardMetricStrip({ metrics }: { readonly metrics: readonly DashboardMetric[] }) {
  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <div className={`metric-label ${toneClass(metric.tone)}`}>{metric.label}</div>
          <div className="metric-value">{renderMetricValue(metric.value)}</div>
          {metric.detail ? <div className="metric-note">{metric.detail}</div> : null}
          {metric.trend ? (
            <div className="metric-note">
              {metric.trend.label || formatTrend(metric.trend.direction)} {formatTrendValue(metric.trend.value)}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function renderMetricValue(value: string | number): string {
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return formatCompactNumber(value);
    }
    return formatRatio(value);
  }

  return value;
}

function formatTrend(direction: "up" | "down" | "flat"): string {
  if (direction === "up") {
    return "Up";
  }
  if (direction === "down") {
    return "Down";
  }
  return "Flat";
}

function formatTrendValue(value: number): string {
  if (Math.abs(value) >= 1) {
    return formatCompactNumber(value);
  }
  return formatRatio(value);
}
