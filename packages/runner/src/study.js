import {BrowserWindow, session, ipcMain} from 'electron'

export class StudyWindow {
  constructor(development=false) {
    // Create new session for the study window.
    // (because the partition string does not start with 'persist',
    // this is an in-memory session; note also the random partition name)
    this.session = session.fromPartition(`labjs-study-${Math.random()}`)

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
        session: this.session,
      },
    })

    // Setup locking
    this.locked = true
    this.closeAttempts = 0
    ipcMain.on('study.unlock', () => {
      console.log('unlocking study')
      this.locked = false
    })

    // Prevent users from closing the window in a locked state
    this.window.on('close', (e) => {
      if (this.locked && this.closeAttempts < 10) {
        this.closeAttempts += 1
        console.log('Lock prevented user from closing study window')
        e.preventDefault()
        return false
      } else {
        console.log('Closing unlocked study window')
      }
    })

    // Prevent changes to the window title
    this.window.on('page-title-updated', (e) => {
      e.preventDefault()
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
