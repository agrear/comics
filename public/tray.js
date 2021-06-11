const { app, Menu, nativeImage, Tray } = require('electron');
const { join } = require('path');

let tray = null;

function createTray() {
  const icon = nativeImage.createFromPath(join(__dirname, 'logo50.png'));
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([{
    label: 'Quit',
    type: 'normal',
    click: () => app.quit()
  }]);

  tray.setToolTip('Comics');
  tray.setContextMenu(contextMenu);

  return tray;
}

function getTray() {
  return tray;
}

module.exports = { createTray, getTray };
