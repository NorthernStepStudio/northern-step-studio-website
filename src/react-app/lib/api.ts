function getApiBaseUrl() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  return backendUrl ? backendUrl.replace(/\/$/, "") : "";
}

export function apiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), {
    credentials: "include",
    ...init,
  });
}
