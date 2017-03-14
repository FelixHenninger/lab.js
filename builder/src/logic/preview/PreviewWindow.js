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
      `api/${ this.instanceId }/index.html`,
      'labjs_preview',
      'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no'
    )
    if (this.window) {
      this.window.addEventListener(
        'unload', () => this.checkWindow()
      )
      // Trigger callback
      this.stateChangeCallback('opened')
    } else {
      // TODO: This catches failed calls to window.open
      // due to a popup blocker or the like. Note that
      // it is not a complete solution: If a popup is
      // blocked, the call will fail silently, without
      // allocating the window property.
      // This is why, when a popup blocker is active,
      // the preview button does not change into a reload
      // button immediately -- only when the reload is
      // no longer blocked (usually on the second refresh),
      // does the icon change.
      console.log(
        'Window.open did not result in a window object.',
        'Probably there is a popup blocker active?'
      )
    }
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
