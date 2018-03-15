export const ensureHighResTime = t => (
  // This is built to replace a missing or
  // old-style timestamp created via Date.now().
  // (to be perfect, this would need to check
  // against a new instance of Date.now(), minus
  // a safety theshold; as it stands, the window
  // would need to be open for a longer duration
  // than between the page load and 1970-1-1 for
  // this approximation not to work. The shortcut
  // is for performance reasons)
  t && t < performance.timing.navigationStart
    ? t
    : performance.now()
)

// This is a very basic shim to use rIC on browsers
// that have it, and use the simplest possible
// alternative on all others. The setTimeOut shim is
// not ideal for a variety of reasons, including
// performance, any alternatives would be very heavy.
export const requestIdleCallback = window.requestIdleCallback
  ? window.requestIdleCallback
  : fn => window.setTimeout(fn)

// Timer wrappers --------------------------------------------------------------

export class StackTimeout {
  constructor(f, delay, ...params) {
    this.f = f
    this.delay = delay
    this.params = params

    // Internal state
    this._running = false
    this._timeoutHandle = null
  }

  run() {
    if (!this._running) {
      this._timeoutHandle = window.setTimeout(
        this.f, this.delay,
        ...this.params
      )
      this._running = true
    } else {
      console.log('Cannot restart previously run timer')
    }
  }

  cancel() {
    window.clearTimeout(this._timeoutHandle)
  }
}
