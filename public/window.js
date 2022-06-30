const { BrowserWindow, shell } = require('electron');
const path = require('path');

const { store } = require('./store');

let window = null;
let hasFrame = true;

function createWindow(options) {
  if (window !== null) {
    window.destroy();
  }

  window = new BrowserWindow({
    width: 800,
    height: 640,
    resizable: true,
    backgroundColor: '#202020',
    ...options,
    webPreferences: {
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  hasFrame = options?.frame ?? true;

  if (options?.show === true) {
    window.once('ready-to-show', event => {
      window.focus();
    });
  }

  window.webContents.setWindowOpenHandler(({ url }) => {
    const isSafeForExternalOpen = url => (
      ['http:', 'https:'].includes(new URL(url).protocol)
    );

    if (isSafeForExternalOpen(url)) {
      setImmediate(() => {
        shell.openExternal(url);
      });
    }

    return { action: 'deny' };
  });

  // https://github.com/electron/electron/issues/24910
  //window.on('close', () => {
  //  window.destroy();
  //});

  window.on('maximize', () => {
    if (store.get('preferences.windowMode') === 'windowed') {
      store.set('preferences.maximized', true);
    }
  });

  window.on('minimize', event => {
    if (store.get('preferences.minimizeToTray')) {
      event.preventDefault();
      window.hide();
    }
  });

  window.on('unmaximize', () => {
    if (store.get('preferences.windowMode') === 'windowed') {
      store.set('preferences.maximized', false);
    }
  });

  window.on('resize', () => {
    if (store.get('preferences.windowMode') === 'windowed') {
      const [width, height] = window.getSize();

      store.set('preferences.windowSize', {
        width,
        height
      });
    }
  });

  return window;
}

function getWindow() {
  return window;
}

function showWindow() {
  if (window === null) {
    return;
  }

  if (!window.isVisible()) {
    window.show();
  } else if (window.isMinimized()) {
    window.restore();
  }

  if (store.get('preferences.windowMode') === 'borderless') {
    window.maximize();
  }

  window.focus();
}

function windowHasFrame() {
  return hasFrame;
}

module.exports = { createWindow, getWindow, showWindow, windowHasFrame };
