import { BrowserWindow, session, ipcMain } from 'electron'
import { getFiles } from './util'

const awaitMessage = (channel, message) =>
  // Return a promise that resolves once a message is sent
  // via an IPC channel.
  // TODO: Timeouts and error management
  new Promise(resolve => channel.once(message, resolve))

export class StudyWindow {
  constructor(filePaths, { development = false }) {
    this.development = development
    this.root = undefined

    // Create new session for the study window.
    // (because the partition string does not start with 'persist',
    // this is an in-memory session; note also the random partition name)
    this.session = session.fromPartition(`labjs-study-${Math.random()}`)

    // Trigger study loading sequence
    this.load(filePaths)
  }

  // Study window loading sequence ---------------------------------------------
  // To load the study, the window goes through a series of steps
  // that first load a dummy page, then inject the study content
  // into a cache from which the service worker can load it,
  // and finally reload the window with the study content in place.
  // The following functions coordinate these steps, waiting for
  // the necessary actions to complete before moving on. Importantly,
  // the first steps take place before the window is visible, and
  // are therefore hidden from the user.
  // This sequence is based on the author's not-entirely-complete
  // understanding of what is going on, and it is not implausible
  // that all of this logic is just coincidentally waiting long enough
  // for the actual process to take place unperturbed.
  createWindow() {
    // Create (initially hidden) study window
    this.window = new BrowserWindow({
      title: 'Study',
      show: false,
      // Fullscreen *and* kiosk mode
      fullscreen: !this.development,
      kiosk: !this.development,
      // Restrict window controls
      closable: false,
      minimizable: this.development,
      fullscreenable: true,
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

    // Setup locking mechanism to prevent users from
    // accidentally closing the window
    this.locked = true
    this.closeAttempts = 0
    ipcMain.on('study.unlock', () => {
      console.log('unlocking study')
      this.locked = false
    })

    // Prevent users from closing the window in a locked state
    this.window.on('close', e => {
      // Close the window after 10 unsuccessful attepts
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
    this.window.on('page-title-updated', e => {
      e.preventDefault()
    })
  }

  // First, load the loading page, which sets up
  // the (nearly-empty) cache and the service worker
  async loadInitial() {
    console.log('Study window: Loading initial content')
    const domReady = awaitMessage(this.window.webContents, 'dom-ready')
    const workerActive = awaitMessage(ipcMain, 'study.did-activate-worker')
    this.window.loadFile('src/windows/study/index.html')
    return Promise.all([domReady, workerActive])
  }

  // After loading the framework page, inject the study data
  // into the cache, so that the service worker can serve it
  async injectData(files) {
    console.log('Study window: Injecting data')
    const cacheUpdated = awaitMessage(ipcMain, 'study.did-update-cache')
    this.window.webContents.send('study.update', files)
    return await cacheUpdated
  }

  // With the study data in place, reload the page
  async loadInjected() {
    console.log('Study window: Reloading with injecting data')
    const domReady = awaitMessage(this.window.webContents, 'dom-ready')
    this.window.reload()
    return await domReady
  }

  // All together now
  async load(paths) {
    const [prefix, files] = await getFiles(paths)
    this.root = prefix
    await this.createWindow()
    await this.loadInitial()
    await this.injectData(files)
    // TODO: There is a magic moment between injecting the data
    // and reloading the page that isn't captured by our code,
    // so we insert a minute delay. It would be great to figure
    // out how to more accurately determine when the window can
    // be reloaded, but this escapes me so far. :-/
    await new Promise(resolve => setTimeout(resolve, 20))
    await this.loadInjected()

    console.log('Study window: Done loading')
    this.window.show()

    // Attach dev tools in development mode
    if (this.development) {
      this.window.webContents.openDevTools({ mode: 'detach' })
    }
  }
}
