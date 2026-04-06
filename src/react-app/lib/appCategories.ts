export const APP_CATEGORY_OPTIONS = [
  { value: "TOOL", label: "Tool" },
  { value: "GAME", label: "Game" },
  { value: "AI TOOL", label: "AI Tool" },
  { value: "EDUCATION", label: "Education" },
  { value: "FINANCE", label: "Finance" },
  { value: "HOME", label: "Home" },
  { value: "LEARNING", label: "Learning" },
] as const;

export function getAppCategoryLabel(category: string) {
  return APP_CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category;
}
