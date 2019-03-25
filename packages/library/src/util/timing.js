export const timingParameters = {
  frameInterval: 16.68,
}

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

const thresholds = {
  'overshoot': 1,
  'closest': 1.5,
  'undershoot': 2,
}

export class FrameTimeout {
  constructor(f, delay, ...params) {
    this.delay = delay
    this.f = f
    this.params = params

    // Internal state
    this._running = false
    this._timeoutHandle = undefined
    this._animationFrameHandle = undefined
    this._lastAnimationFrame = undefined

    // Target timestamp
    this.targetTime = undefined

    // Timing mode
    this.mode = 'closest'

    // Bind tick method
    this.tick = this.tick.bind(this)
  }

  tick(frameTime=performance.now(), frameSynced=false) {
    // Estimate the current frame interval, falling back
    // onto the minimum observed interval if necessary
    const frameInterval =
      (frameTime - this._lastAnimationFrame) || timingParameters.frameInterval

    // Update minimum frame interval if necessary
    if (frameInterval < timingParameters.frameInterval) {
      timingParameters.frameInterval = frameInterval
    }

    // Calculate the remaining time in frames
    // (at the current frame rate)
    const remainingFrames = (this.targetTime - frameTime) / frameInterval

    if (remainingFrames <= thresholds[this.mode]) {
      // Fire callback
      this.f(frameTime, ...this.params)
    } else if (this.targetTime - frameTime < 200) {
      // Check again on the next frame
      this._animationFrameHandle = window.requestAnimationFrame(
        t => this.tick(t, true)
      )
      // Only use timestamp for frame duration estimation
      // if the call is actually frame-synced
      if (frameSynced) {
        this._lastAnimationFrame = frameTime
      }
    } else {
      // Wait a little longer
      // (to be exact, wait for half of the remaining time, minus 100ms)
      this._timeoutHandle = window.setTimeout(
        this.tick,
        (this.targetTime - frameTime - 100) / 2
      )
    }
  }

  run(now=performance.now()) {
    if (!this._running) {
      // Set target time in milliseconds
      this.targetTime = this.targetTime || now + this.delay
      this.tick()
      this._running = true
    } else {
      console.log('Cannot restart previously run timer')
    }
  }

  cancel() {
    window.clearTimeout(this._timeoutHandle)
    window.cancelAnimationFrame(this._animationFrameHandle)
  }
}
