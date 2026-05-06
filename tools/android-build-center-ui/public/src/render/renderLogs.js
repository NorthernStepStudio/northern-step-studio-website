/**
 * NStep Build Center - Premium Log Rendering with Phase Grouping
 */

export function renderLogs(logs, container, options = {}) {
    if (!logs || logs.length === 0) {
        container.innerHTML = '<div class="log-line info">Ready to build...</div>';
        return;
    }

    // Default options
    const { autoScroll = true, showRaw = false } = options;

    if (showRaw) {
        renderRawLogs(logs, container, autoScroll);
    } else {
        renderGroupedLogs(logs, container, autoScroll);
    }
}

function renderGroupedLogs(logs, container, autoScroll) {
    const groups = [];
    let currentGroup = null;

    // Pattern-based phase detection (refine based on build-apk.ps1 output)
    const phaseMarkers = [
        { pattern: '--- PHASE:', name: m => m.replace(/--- PHASE: (.*) ---/, '$1') },
        { pattern: '== NStep Android Build Center', name: () => 'Initialization' },
        { pattern: 'Validating credentials', name: () => 'Security Check' },
        { pattern: 'Setting up signing', name: () => 'Signing Configuration' },
        { pattern: 'Running build command', name: () => 'Gradle Execution' },
        { pattern: 'Build successful', name: () => 'Completion' },
        { pattern: 'Build failed', name: () => 'Failure' }
    ];

    logs.forEach(log => {
        const marker = phaseMarkers.find(m => log.message.includes(m.pattern));
        if (marker) {
            const phaseName = marker.name(log.message);
            currentGroup = { phase: phaseName, logs: [], timestamp: log.timestamp };
            groups.push(currentGroup);
        } else if (!currentGroup) {
            currentGroup = { phase: 'Preparation', logs: [], timestamp: log.timestamp };
            groups.push(currentGroup);
        }
        currentGroup.logs.push(log);
    });

    container.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'log-phase-list';

    groups.forEach((group, index) => {
        const details = document.createElement('details');
        details.className = 'log-phase-group';
        
        // Intelligence:
        // - Always expand the last phase if it's running
        // - Always expand a failed phase
        // - Successful phases stay collapsed by default
        const isLast = index === groups.length - 1;
        const criticalMarkers = ['FAILED_PRECHECK:', 'Task :app:packageRelease FAILED', 'Task :app:signRelease FAILED', 'Build failed'];
        const hasFailure = group.logs.some(l => 
            criticalMarkers.some(m => l.message.includes(m)) || 
            (l.message.includes('FAILED') && !l.message.includes(':app:createBundleReleaseJsAndAssets'))
        );
        
        if (isLast || hasFailure) {
            details.open = true;
        }

        const summary = document.createElement('summary');
        summary.className = 'log-phase-header';
        summary.innerHTML = `
            <div class="phase-header-left">
                <span class="phase-status-dot ${hasFailure ? 'failed' : (isLast ? 'running' : 'success')}"></span>
                <span class="phase-name">${group.phase}</span>
            </div>
            <span class="phase-count">${group.logs.length} lines</span>
        `;

        const content = document.createElement('div');
        content.className = 'log-phase-content';
        
        group.logs.forEach(log => {
            const line = document.createElement('div');
            line.className = `log-line ${log.source}`;
            line.textContent = log.message;
            content.appendChild(line);
        });

        details.appendChild(summary);
        details.appendChild(content);
        list.appendChild(details);
    });

    container.appendChild(list);
    if (autoScroll) container.scrollTop = container.scrollHeight;
}

function renderRawLogs(logs, container, autoScroll) {
    container.innerHTML = '';
    const pre = document.createElement('pre');
    pre.style.padding = '1rem';
    logs.forEach(log => {
        const line = document.createElement('div');
        line.className = `log-line ${log.source}`;
        line.textContent = log.message;
        pre.appendChild(line);
    });
    container.appendChild(pre);
    if (autoScroll) container.scrollTop = container.scrollHeight;
}
