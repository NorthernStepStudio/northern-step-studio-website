export function apiUrl(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}
