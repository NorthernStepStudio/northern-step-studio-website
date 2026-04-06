const { contextBridge, ipcRenderer } = require('electron');

// Expose window controls to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    onWindowStateChange: (callback) => ipcRenderer.on('window-state', (event, isMaximized) => callback(isMaximized))
});
