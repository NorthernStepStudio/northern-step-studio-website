/**
 * NStep Build Center - Advanced Build Status Rendering
 */

export function renderBuildStatus(status, container) {
    if (!status) return;

    const isRunning = status.running;
    const statusCode = String(status.status || 'idle').toUpperCase();
    
    // Calculate elapsed time for display
    let elapsedStr = '00:00';
    if (status.startedAt) {
        const start = new Date(status.startedAt).getTime();
        const end = status.endedAt ? new Date(status.endedAt).getTime() : Date.now();
        const diff = Math.max(0, Math.floor((end - start) / 1000));
        
        const hours = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        const secs = diff % 60;
        
        if (hours > 0) {
            elapsedStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        } else {
            elapsedStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
    }

    const startTimeStr = status.startedAt ? new Date(status.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

    container.innerHTML = `
        <div class="status-header">
            <h3>Build Status</h3>
            <span class="status-badge ${status.status}">${statusCode}</span>
        </div>
        
        <div class="status-grid">
            <div class="status-row">
                <span class="label">App:</span>
                <span class="value">${status.currentApp || 'None'}</span>
            </div>
            <div class="status-row">
                <span class="label">Type:</span>
                <span class="value">${String(status.buildType || '-').toUpperCase()}</span>
            </div>
            <div class="status-row">
                <span class="label">Started:</span>
                <span class="value">${startTimeStr}</span>
            </div>
            <div class="status-row">
                <span class="label">Elapsed:</span>
                <span class="value highlight">${elapsedStr}</span>
            </div>
            <div class="status-row">
                <span class="label">Phase:</span>
                <span class="value">${status.currentPhase || 'Idle'}</span>
            </div>
        </div>

        ${status.status === 'success' && status.outputPath ? `
            <div class="artifact-card success" style="border-left: 4px solid var(--success); background: rgba(0, 255, 136, 0.05); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <div class="artifact-title" style="color: var(--success); font-weight: 800; font-size: 0.9rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>🚀</span> ARTIFACT READY
                </div>
                <div class="artifact-path" style="font-family: 'Fira Code', monospace; font-size: 0.65rem; word-break: break-all; opacity: 0.8; margin-bottom: 0.75rem;">${status.outputPath}</div>
                <div class="artifact-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.7rem; flex: 1;" onclick="window.api.openFolder('${status.outputPath.replace(/\\/g, '\\\\')}')">OPEN FOLDER</button>
                    <button class="btn-icon" style="padding: 0.4rem; font-size: 0.7rem;" onclick="navigator.clipboard.writeText('${status.outputPath.replace(/\\/g, '\\\\')}')">COPY PATH</button>
                </div>
            </div>
        ` : ''}

        ${status.status === 'failed' && status.errorSummary ? `
            <div class="artifact-card failed">
                <div class="artifact-title">Build Failed</div>
                <div class="error-summary">${status.errorSummary}</div>
                <div class="artifact-actions">
                    <button class="btn-icon" onclick="navigator.clipboard.writeText('${status.errorSummary.replace(/'/g, "\\'")}')">Copy Error</button>
                </div>
            </div>
        ` : ''}
        
        ${status.savedLogPath ? `
            <div class="log-info">
                <span class="label">Log:</span>
                <span class="value path" title="${status.savedLogPath}">${status.savedLogPath.split('\\').pop()}</span>
            </div>
        ` : ''}
    `;

    // Phase Summary Progress
    if (status.phaseSummary && status.phaseSummary.length > 0) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'phase-summary-list';
        summaryDiv.innerHTML = '<h4>Phase Progress</h4>';
        
        status.phaseSummary.forEach(p => {
            const row = document.createElement('div');
            row.className = `phase-summary-row ${p.status}`;
            const icon = p.status === 'success' ? '✓' : (p.status === 'running' ? '●' : (p.status === 'failed' ? '✗' : '○'));
            row.innerHTML = `
                <span class="phase-icon">${icon}</span>
                <span class="phase-name-small">${p.name}</span>
                <span class="phase-meta">${p.lineCount} lines</span>
            `;
            summaryDiv.appendChild(row);
        });
        container.appendChild(summaryDiv);
    }

    // Explicit Location Info
    const infoDiv = document.createElement('div');
    infoDiv.style.marginTop = '1rem';
    infoDiv.style.fontSize = '0.65rem';
    infoDiv.style.opacity = '0.6';
    infoDiv.style.borderTop = '1px solid var(--border)';
    infoDiv.style.paddingTop = '0.5rem';
    infoDiv.innerHTML = `
        <div><b>Save Location:</b></div>
        <div>Northern Step Studio/build-artifacts/</div>
    `;
    container.appendChild(infoDiv);
}
