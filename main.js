const {app, BrowserWindow, ipcMain, Menu} = require('electron')

var configuration = require('./app/config/config');
const template    = configuration.menuTemplate();

let win

function createWindow () {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win = new BrowserWindow({width: 762, height: 706, titleBarStyle: 'hidden', resizable: false, transparent: true});
  win.loadURL(`file://${__dirname}/app/index.html`)
  win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
