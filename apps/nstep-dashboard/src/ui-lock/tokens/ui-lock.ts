export const STUDIOOS_UI_LOCK_VERSION = "2026-05-09";

export const STUDIOOS_UI_LOCK_AREAS = [
  "studio-shell",
  "dashboard-layout",
  "cards",
  "sidebar",
  "topbar",
] as const;

export const STUDIOOS_UI_LOCK_POLICY =
  "UI freeze: preserve approved dashboard visual layout unless explicitly unlocked.";
