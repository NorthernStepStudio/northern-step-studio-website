/**
 * NStep Build Center - Premium App Card Rendering
 */

import { normalizeApp } from '../utils/normalizeApp.js';

export function renderAppList(apps, container, onAction) {
    if (!apps || apps.length === 0) {
        container.innerHTML = '<div class="empty-state">No apps discovered. Click "Scan Workspace" to start.</div>';
        return;
    }

    container.innerHTML = '';
    const listDiv = document.createElement('div');
    listDiv.className = 'discovery-grid';

    apps.forEach((rawApp, idx) => {
        try {
            const app = normalizeApp(rawApp);
            if (!app) return;

            const card = document.createElement('div');
            card.className = `app-card ${app.credentialState.toLowerCase()}`;
            
            const statusLabel = app.credentialState;

            card.innerHTML = `
                <div class="app-card-header">
                    <div class="app-title-info">
                        <div class="app-name">${app.displayName || app.id}</div>
                        <div class="app-path">${app.appRoot}</div>
                    </div>
                    <span class="badge ${app.isProduction ? 'production' : 'private'}">${app.classificationLabel}</span>
                </div>
                
                <div class="app-card-body" style="font-size: 0.7rem; margin-top: 0.5rem; color: var(--text-secondary);">
                    <div style="display: flex; gap: 1rem; opacity: 0.8;">
                        <span>Keystore: <b>${app.keystoreSource}</b></span>
                        <span>Source: <b>${app.passwordSource}</b></span>
                    </div>
                    <div style="margin-top: 0.25rem; font-style: italic;">${app.safeMessage}</div>
                </div>

                <div class="app-card-footer">
                    <div class="status-info">
                        <span class="status-dot ${app.credentialState.toLowerCase()}"></span>
                        <span>${statusLabel}</span>
                    </div>
                    <button class="btn-select-action" data-action="select">Select & Fill</button>
                </div>
            `;

            // Click anywhere on card to select
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    onAction('select', app);
                }
            });

            // Button click
            const btn = card.querySelector('.btn-select-action');
            if (btn) {
                btn.addEventListener('click', () => onAction('select', app));
            }

            listDiv.appendChild(card);
        } catch (err) {
            console.error(`[Render] Failed to render app at index ${idx}:`, err, rawApp);
        }
    });

    container.appendChild(listDiv);
}
