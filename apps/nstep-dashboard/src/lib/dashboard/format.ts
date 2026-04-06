import type { DashboardMetric, ProductKey } from "./contracts";
import { getProductMeta } from "./nav";

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDateTimeLong(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDurationMs(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "0ms";
  }
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }
  if (value < 60_000) {
    const seconds = value / 1000;
    return `${seconds >= 10 ? Math.round(seconds) : seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(value / 60_000);
  const remainingSeconds = Math.round((value % 60_000) / 1000);
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatRatio(value: number): string {
  if (value >= 0 && value <= 1) {
    return formatPercent(value);
  }

  if (value > 1 && value <= 100) {
    return `${Math.round(value)}%`;
  }

  return formatCompactNumber(value);
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatStatusLabel(value: string): string {
  const normalized = value.replace(/[_-]+/g, " ").trim();
  if (!normalized) {
    return value;
  }

  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function statusTone(value: string): string {
  const normalized = value.toLowerCase();
  if (["completed", "approved", "accepted", "succeeded", "delivered", "ok", "healthy", "pass", "live", "enabled"].includes(normalized)) {
    return "status-ok";
  }
  if (["failed", "rejected", "error", "critical", "fail"].includes(normalized)) {
    return "status-danger";
  }
  if (["semantic"].includes(normalized)) {
    return "status-info";
  }
  if (["procedural"].includes(normalized)) {
    return "status-ok";
  }
  if (["episodic"].includes(normalized)) {
    return "status-warn";
  }
  if (["waiting_approval", "pending", "running", "routing", "planning", "verifying", "queued", "warn", "warning", "offline", "disabled"].includes(normalized)) {
    return "status-warn";
  }
  return "status-info";
}

export function toneClass(metricTone: DashboardMetric["tone"]): string {
  if (metricTone === "success") {
    return "status-ok";
  }
  if (metricTone === "warning") {
    return "status-warn";
  }
  if (metricTone === "danger") {
    return "status-danger";
  }
  if (metricTone === "accent") {
    return "status-info";
  }
  return "";
}

export function productTitle(product: ProductKey): string {
  return getProductMeta(product).title;
}

export function productDescription(product: ProductKey): string {
  return getProductMeta(product).description;
}
