/**
 * NStep Build Center - State Management
 */

export const state = {
    apps: [],
    buildStatus: { running: false, status: 'idle' },
    logs: [],
    selectedAppId: null,
    settings: { autoGenerateForPrivateApps: true },
    
    // Callbacks for when state changes
    listeners: [],
    
    subscribe(fn) {
        this.listeners.push(fn);
    },
    
    notify() {
        this.listeners.forEach(fn => fn(this));
    },
    
    setApps(apps) {
        this.apps = apps;
        this.notify();
    },
    
    setBuildStatus(status) {
        this.buildStatus = status;
        this.notify();
    },
    
    addLog(log) {
        this.logs.push(log);
        this.notify();
    },
    
    setLogs(logs) {
        this.logs = logs;
        this.notify();
    },
    
    selectApp(id) {
        this.selectedAppId = id;
        this.notify();
    },
    
    setSettings(s) {
        this.settings = s;
        this.notify();
    }
};
