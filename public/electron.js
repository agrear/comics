const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

const { registerIPC } = require('./ipc');
const { store } = require('./store');
const { createTray } = require('./tray');
const { createWindow, getWindow, showWindow } = require('./window');

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (getWindow()) {
      showWindow();
    }
  });

  app.whenReady().then(() => {
    const tray = createTray();
    tray.on('click', showWindow);  // Restore window when tray clicked

    registerIPC();

    const windowMode = store.get('preferences.windowMode');
    const show = !process.argv.includes('--hidden');

    let window;
    if (windowMode === 'windowed') {
      window = createWindow({
        ...store.get('preferences.windowSize'),
        center: true,
        show
      });

      if (show && store.get('preferences.maximized')) {
        window.maximize();
      }
    } else if (windowMode === 'borderless') {
      window = createWindow({
        frame: false,
        movable: false,
        resizable: false,
        show
      });

      if (show) {
        window.maximize();
      }
    } else if (windowMode === 'fullscreen') {
      window = createWindow({
        fullscreen: true,
        show
      });
    }

    if (isDev) {
      window.loadURL('http://localhost:3000/');
    } else {
      window.loadFile(path.join(__dirname, '../build/index.html'));
    }

    if (isDev) {
      window.webContents.openDevTools();
    } else {
      window.removeMenu();
    }
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
