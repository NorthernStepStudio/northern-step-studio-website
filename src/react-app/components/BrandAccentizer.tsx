import { useEffect } from "react";
import { BRAND_NAME } from "@/react-app/lib/brand";

const HIGHLIGHT_ATTR = "data-brand-highlighted";
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "PRE",
  "CODE",
  "SVG",
  "MATH",
]);

function shouldSkipElement(element: Element | null): boolean {
  if (!element) {
    return true;
  }

  if (element.closest(`[${HIGHLIGHT_ATTR}]`)) {
    return true;
  }

  return SKIP_TAGS.has(element.tagName);
}

function accentizeTextNode(node: Text): void {
  const text = node.nodeValue;
  if (!text || !text.includes(BRAND_NAME)) {
    return;
  }

  if (shouldSkipElement(node.parentElement)) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const parts = text.split(BRAND_NAME);

  parts.forEach((part, index) => {
    if (part) {
      fragment.appendChild(document.createTextNode(part));
    }

    if (index < parts.length - 1) {
      const accent = document.createElement("span");
      accent.className = "text-accent";
      accent.setAttribute(HIGHLIGHT_ATTR, "true");
      accent.textContent = BRAND_NAME;
      fragment.appendChild(accent);
    }
  });

  node.replaceWith(fragment);
}

function walkAndAccentize(root: ParentNode | Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  nodes.forEach(accentizeTextNode);
}

function processMutationRecords(records: MutationRecord[]): void {
  const roots = new Set<Node>();

  records.forEach((record) => {
    if (record.target.nodeType === Node.TEXT_NODE) {
      roots.add(record.target);
    }

    record.addedNodes.forEach((node) => {
      roots.add(node);
    });
  });

  roots.forEach((root) => {
    if (root.nodeType === Node.TEXT_NODE) {
      accentizeTextNode(root as Text);
      return;
    }

    walkAndAccentize(root);
  });
}

export default function BrandAccentizer() {
  useEffect(() => {
    if (typeof document === "undefined" || !document.body) {
      return;
    }

    let frame = 0;

    const schedule = (records?: MutationRecord[]) => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(() => {
        if (records && records.length > 0) {
          processMutationRecords(records);
          return;
        }

        walkAndAccentize(document.body);
      });
    };

    schedule();

    const observer = new MutationObserver((records) => {
      schedule(records);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return null;
}
