// Modules to control application life and create native browser window
import {app, BrowserWindow, ipcMain ,Menu, remote} from 'electron'
import {StudyWindow} from './study'
const url = require('url')
const path = require('path')

import {proto, clock, test_stream} from './test'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Check for development mode.
const inDevelopment = process.env.NODE_ENV !== 'production'

const template=[
  {
    label:'Test LSL',
    submenu:[
      {
        label:'Protocol Version',
        click(){
          proto();
        }
      },
      {
        label:'Local Clock',
        click(){
          clock();
        }
      },
      {
        label:'Stream',
        click(){
          test_stream();
        }
      }
    ]
  },
  {
    label:'Close',
    click(){
      app.quit();
    }
  }
]

function createWindow () {
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
    }
  })


  const mainMenu=Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(mainMenu);

  // and load the index.html of the app.
  mainWindow.loadFile('src/windows/main/index.html')

  // Open the DevTools if in development mode.
  if (inDevelopment) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  ipcMain.on('study.load', (e, filePaths) => {
    console.log('loading file paths from', filePaths)
    // const studyWindow = new StudyWindow(filePaths, {
    //   development: inDevelopment,
    // })
    //const window = remote.BrowserWindow;
    const win = new BrowserWindow({
      height: 600,
      width: 800,
      webPreferences: {
        nodeIntegration: true
      }
    });
  
    //win.loadFile('template.html');
    win.loadURL(url.format({
      pathname: path.join(__dirname, './windows/Studies/template.html'),
      protocol: 'file:',
      slashes: true
  }));

  win.webContents.openDevTools({mode:'detach'});
  
  ipcMain.on('JSON',(e,mssg)=>{
    win.webContents.send('send','dummy')
  })

  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

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
