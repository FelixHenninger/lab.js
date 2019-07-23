import {BrowserWindow} from 'electron'

export const createStudyWindow = (development=false) => {
  const studyWindow = new BrowserWindow({
    title: 'Study',
    show: false,
    // Fullscreen *and* kiosk mode
    fullscreen: !development,
    kiosk: !development,
    // Show a background color while loading
    backgroundColor: 'white',
    // Sandbox the web page
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: `${__dirname}/windows/study/preload.js`,
    },
  })

  studyWindow.on('close', (e) => {
    console.log('Prevented closing study window')
    e.preventDefault()
    return false
  })

  studyWindow.loadFile('src/windows/study/index.html')
  studyWindow.show()

  studyWindow.webContents.on('did-finish-load', () => {
    console.log('sending event to study window')
    studyWindow.webContents.send('ping', 'Hey I can send messages!')
  })

  if (development) {
    studyWindow.webContents.openDevTools({ mode: 'detach' })
  }

  return studyWindow
}
