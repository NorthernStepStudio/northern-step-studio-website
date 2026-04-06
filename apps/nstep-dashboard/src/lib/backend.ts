const DEFAULT_BACKEND_URL = "http://127.0.0.1:3060";

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

export function getBackendBaseUrl(): string {
  const configured = process.env.NSTEP_OS_API_URL?.trim();
  if (configured) {
    return configured;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("NSTEP_OS_API_URL must be configured in production.");
  }
  return DEFAULT_BACKEND_URL;
}

export function getBackendUrl(pathname: string): string {
  return new URL(pathname.replace(/^\/+/, ""), ensureTrailingSlash(getBackendBaseUrl())).toString();
}
