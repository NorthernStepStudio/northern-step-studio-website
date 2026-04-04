import type { ReactNode } from "react";

export const BRAND_NAME = "Northern Step Studio";
const BRAND_PATTERN = new RegExp(BRAND_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");

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
  if (!text.includes(BRAND_NAME)) {
    return [text];
  }

  const parts = text.split(BRAND_PATTERN);
  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(part);
    }

    if (index < parts.length - 1) {
      nodes.push(
        <span key={`${BRAND_NAME}-${index}`} className={accentClassName}>
          {BRAND_NAME}
        </span>
      );
    }
  });

  return nodes;
}

export function brandifyMarkdown(content: string): string {
  return content.replace(BRAND_PATTERN, `**${BRAND_NAME}**`);
}

export function isBrandText(children: ReactNode): boolean {
  const text = flattenChildren(children).trim();
  return text === BRAND_NAME || text === `${BRAND_NAME} (NStep)`;
}
