import { bootApp } from './app/boot';

// Entry point for the NStep Code Motion Editor
window.addEventListener('DOMContentLoaded', () => {
  try {
    bootApp();
  } catch (err) {
    console.error('Failed to boot NStep Code Motion Editor:', err);
    document.body.innerHTML = `<div style="padding:20px; color:white; background:#1a1b26;">
      <h2>Critical Boot Error</h2>
      <pre>${err instanceof Error ? err.stack : String(err)}</pre>
    </div>`;
  }
});
