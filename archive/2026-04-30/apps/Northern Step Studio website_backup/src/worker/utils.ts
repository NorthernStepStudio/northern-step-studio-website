export function normalizeEmailAddress(email: string | undefined | null): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

export function isValidEmailAddress(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function normalizeSingleLineText(text: string | undefined | null, maxLength: number = 255): string {
  if (!text) return "";
  return text.trim().substring(0, maxLength);
}

export function normalizeMultilineText(text: string | undefined | null, maxLength: number = 2000): string {
  if (!text) return "";
  return text.substring(0, maxLength);
}
