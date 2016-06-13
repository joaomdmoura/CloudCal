var google_integration = require('./helpers/google_calendar_integration');
var configuration      = require('./config/config');

const electron        = require('electron');
const {ipcMain}       = electron
const {app}           = electron;
const {BrowserWindow} = electron;
const {Menu}          = electron;
const template        = configuration.menuTemplate();

let win;

function createWindow() {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win = new BrowserWindow({width: 700, height: 1000, titleBarStyle: 'hidden'});
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', () => {
    win = null;
  });

  // Open the DevTools.
  // win.webContents.openDevTools();

  google_integration.googleSync(win);

  ipcMain.on('addEvent', (event) => {
    eventWin = new BrowserWindow({width: 600, height: 400});
    eventWin.loadURL(`file://${__dirname}/pages/new_event.html`);
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
