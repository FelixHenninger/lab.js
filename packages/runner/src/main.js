// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, Menu, remote } from 'electron'
import { StudyWindow } from './study'

import { proto, clock, test_stream } from './LSL_test'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.mainWindow = null

// Check for development mode.
const inDevelopment = process.env.NODE_ENV !== 'production'

const menuEntries = [
  {
    label: 'Test LSL',
    submenu: [
      {
        label: 'Protocol Version',
        click() {
          proto()
        },
      },
      {
        label: 'Local Clock',
        click() {
          clock()
        },
      },
      {
        label: 'Stream',
        click() {
          test_stream()
        },
      },
    ],
  },
  {
    label: 'Close',
    click() {
      app.quit()
    },
  },
]

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'lab.js',
    width: 350,
    height: 500,
    resizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      partition: 'labjs-main',
    },
  })

  const mainMenu = Menu.buildFromTemplate(menuEntries)

  Menu.setApplicationMenu(mainMenu)

  // and load the index.html of the app.
  mainWindow.loadFile('src/windows/main/index.html')

  // Open the DevTools if in development mode.
  if (inDevelopment) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

 

}


ipcMain.on('temp',(e,m)=>{
  let win =new BrowserWindow({
    title: 'temp',
    width: 550,
    height: 500,
    resizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      partition: 'labjs-main',}
  })

  win.loadFile('src/windows/temp/temp.html')
  win.webContents.openDevTools({ mode: 'detach' })
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
