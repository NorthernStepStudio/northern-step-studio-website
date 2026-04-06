import type { NssServerHealth } from "../models/api.types.js";

export function getServerStatusLabel(serverHealth: NssServerHealth): string {
  return `Backend: ${serverHealth.status}`;
}
