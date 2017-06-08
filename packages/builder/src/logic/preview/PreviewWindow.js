export default class Preview {
  constructor(url, stateChangeCallback) {
    this.url = url
    this.stateChangeCallback = stateChangeCallback

    this.window = null
    window.addEventListener(
      'beforeunload', () => { this.close() }
    )
  }

  // Open, close, reload, ... the preview window
  open() {
    this.window = window.open(
      this.url, 'labjs_preview',
      'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no'
    )
    // Catching an edge case here, where the window
    // would open to about:blank, and not move from
    // there if the content was reloaded
    this.window.addEventListener(
      'load', () => (this.window.location = this.url), { once: true }
    )
    this.window.addEventListener(
      'unload', () => this.checkWindow(), { once: true }
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

  openIfNecessary() {
    if (this.window === null || this.window.closed) {
      this.open()
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
          'unload', () => this.checkWindow(), { once: true }
        )
      }
    }, 25)
  }

}
