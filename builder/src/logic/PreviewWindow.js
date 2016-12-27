export default class Preview {
  constructor(instanceId, stateChangeCallback) {
    this.instanceId = instanceId
    this.stateChangeCallback = stateChangeCallback

    this.window = null
    window.addEventListener(
      'beforeunload', () => { this.close() }
    )
  }

  // Open, close, reload, ... the preview window
  open() {
    this.window = window.open(
      `api/${ this.instanceId }/preview/script.js`, // should be index.html
      'labjs_preview',
      'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no'
    )
    this.window.addEventListener(
      'unload', () => this.checkWindow()
    )
    // Trigger callback
    this.stateChangeCallback('opened')
  }

  close() {
    if (this.window) {
      this.window.close()
    }
  }

  reload() {
    this.window.location.reload()
    this.window.focus()
  }

  openOrReload() {
    if (this.window === null || this.window.closed) {
      this.open()
    } else {
      this.reload()
    }
  }

  // Check window status
  checkWindow() {
    // This function is run when the unload event
    // on the preview window is caught, to check
    // whether the window was closed or just reloaded
    window.setTimeout(() => {
      if (this.window.closed) {
        // Detected closed window, removing reference
        this.window = null
        this.stateChangeCallback('closed')
      } else {
        // Window is still open, renew unload listener
        this.window.addEventListener(
          'unload', () => this.checkWindow()
        )
      }
    }, 250)
  }

}
