import { NSS_PRESETS } from "../../config/presets.js";

export function getPresetTitle(presetId: string): string {
  return NSS_PRESETS.find((preset) => preset.id === presetId)?.title ?? presetId;
}

export function suggestPresetIdFromPath(pathValue: string | undefined): string {
  const normalized = (pathValue ?? "").toLowerCase();
  return NSS_PRESETS.map((preset) => preset.id).find((id) => normalized.includes(id)) ?? "general-nss-studio";
}
