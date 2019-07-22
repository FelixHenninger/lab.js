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
    },
  })

  studyWindow.on('close', (e) => {
    console.log('Prevented closing study window')
    e.preventDefault()
    return false
  })

  studyWindow.loadFile('src/windows/study/index.html')
  studyWindow.show()

  if (development) {
    studyWindow.webContents.openDevTools({ mode: 'detach' })
  }

  return studyWindow
}
