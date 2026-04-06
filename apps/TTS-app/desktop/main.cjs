const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        titleBarStyle: 'hidden',
        backgroundColor: '#0a0b0e',
        resizable: true,
        minimizable: true,
        maximizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true, // Switched to true for better security/stability
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    // Listen for state changes to sync UI
    mainWindow.on('maximize', () => mainWindow.webContents.send('window-state', true));
    mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-state', false));

    mainWindow.on('closed', () => (mainWindow = null));
}

// IPC Handlers
ipcMain.on('window-minimize', () => {
    const target = mainWindow || BrowserWindow.getFocusedWindow();
    if (target) {
        console.log('Main Process: Minimizing...');
        target.minimize();
    } else {
        console.error('Main Process: No window found to minimize');
    }
});

ipcMain.on('window-maximize', () => {
    const target = mainWindow || BrowserWindow.getFocusedWindow();
    if (target) {
        if (target.isMaximized()) {
            console.log('Main Process: Unmaximizing...');
            target.unmaximize();
        } else {
            console.log('Main Process: Maximizing...');
            target.maximize();
        }
    } else {
        console.error('Main Process: No window found to maximize');
    }
});

ipcMain.on('window-close', () => {
    const target = mainWindow || BrowserWindow.getFocusedWindow();
    if (target) {
        console.log('Main Process: Closing...');
        target.close();
    }
});

app.on('ready', () => {
    createWindow();

    // Custom Menu (Optional)
    Menu.setApplicationMenu(null);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
