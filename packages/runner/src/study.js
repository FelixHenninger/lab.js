import {BrowserWindow} from 'electron'

export class StudyWindow {
  constructor(development=false) {
    // Create (initially hidden) study window
    this.window = new BrowserWindow({
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

    // Prevent users from closing the window in a locked state
    this.window.on('close', (e) => {
      if (development) {
        console.log('Would have prevented user from closing study window')
      } else {
        console.log('Prevented user from closing study window')
        e.preventDefault()
        return false
      }
    })

    this.window.webContents.on('did-finish-load', () => {
      console.log('sending event to study window')
      this.window.webContents.send('ping', 'Hey I can send messages!')
    })

    // Load study page
    this.window.loadFile('src/windows/study/index.html')

    // Attach dev tools in development mode
    if (development) {
      this.window.webContents.openDevTools({ mode: 'detach' })
    }
  }

  show() {
    this.window.show()
  }
}
