import { api } from '../api.js';
import { state } from '../state.js';
import { context } from '../context.js';
import { renderLogs } from '../render/renderLogs.js';

export function setupUIBindings() {
    document.getElementById('expandAllLogsBtn').addEventListener('click', () => {
        document.querySelectorAll('.log-phase-group').forEach(d => d.open = true);
    });
    
    document.getElementById('collapseAllLogsBtn').addEventListener('click', () => {
        document.querySelectorAll('.log-phase-group').forEach(d => d.open = false);
    });
    
    document.getElementById('saveLogsBtn').addEventListener('click', () => {
        const logText = state.logs.map(l => `[${l.timestamp}] ${l.message}`).join('\n');
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `build-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
        a.click();
    });

    document.getElementById('autoScrollToggle').addEventListener('change', (e) => {
        context.logOptions.autoScroll = e.target.checked;
        renderLogs(state.logs, context.elements.logContainer, context.logOptions);
    });
    
    document.getElementById('showRawLogToggle').addEventListener('change', (e) => {
        context.logOptions.showRaw = e.target.checked;
        renderLogs(state.logs, context.elements.logContainer, context.logOptions);
    });
}
