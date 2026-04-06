"use client";

import { useState } from "react";

export function CopyPromptButton({
  prompt,
  label = "Copy master prompt",
  doneLabel = "Copied",
}: {
  prompt: string;
  label?: string;
  doneLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCopy() {
    try {
      setError(null);
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was blocked. Copy the text manually from the panel below.");
    }
  }

  return (
    <div className="space-y-2">
      <button className="btn-secondary" onClick={onCopy} type="button">
        {copied ? doneLabel : label}
      </button>
      {error ? <p className="text-xs text-rose-200">{error}</p> : null}
    </div>
  );
}
