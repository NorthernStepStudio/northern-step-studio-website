import type { ReactNode } from "react";

export const BRAND_NAME = "Northern Step Studio";
const BRAND_PATTERN = new RegExp(BRAND_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
const BRAND_NORMALIZED = BRAND_NAME.toLowerCase();

function flattenChildren(children: ReactNode): string {
  if (children === null || children === undefined || typeof children === "boolean") {
    return "";
  }

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(flattenChildren).join("");
  }

  return "";
}

export function brandifyText(text: string, accentClassName = "text-accent"): ReactNode[] {
  if (!BRAND_PATTERN.test(text)) {
    BRAND_PATTERN.lastIndex = 0;
    return [text];
  }

  BRAND_PATTERN.lastIndex = 0;
  const parts = text.split(BRAND_PATTERN);
  const matches = text.match(BRAND_PATTERN) ?? [];
  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(part);
    }

    if (index < matches.length) {
      nodes.push(
        <span key={`${BRAND_NAME}-${index}`} className={accentClassName}>
          {matches[index]}
        </span>
      );
    }
  });

  return nodes;
}

export function brandifyMarkdown(content: string): string {
  BRAND_PATTERN.lastIndex = 0;
  return content.replace(BRAND_PATTERN, "**$&**");
}

export function isBrandText(children: ReactNode): boolean {
  const text = flattenChildren(children).trim();
  const normalized = text.toLowerCase();

  return normalized === BRAND_NORMALIZED || normalized === `${BRAND_NORMALIZED} (nstep)`;
}
