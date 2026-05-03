export function apiUrl(path: string) {
  const resolvedPath = path.startsWith("/") ? path : `/${path}`;
  if (!import.meta.env.DEV) {
    console.debug(`[API] Resolved URL: ${resolvedPath} (from: ${path})`);
  }
  return resolvedPath;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}
