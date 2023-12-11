// Stack-based timeout ---------------------------------------------------------

export class StackTimeout {
  f: Function
  delay: number
  params: any[]

  private running: boolean
  private timeoutHandle: null | number

  constructor(f: Function, delay: number, ...params: any[]) {
    this.f = f
    this.delay = delay
    this.params = params

    // Internal state
    this.running = false
    this.timeoutHandle = null
  }

  run() {
    if (!this.running) {
      this.timeoutHandle = window.setTimeout(this.f, this.delay, ...this.params)
      this.running = true
    } else {
      console.log('Cannot restart previously run timer')
    }
  }

  cancel() {
    if (this.timeoutHandle) {
      window.clearTimeout(this.timeoutHandle)
    }
  }
}

// Frame-based timeout ---------------------------------------------------------

export const timingParameters = {
  frameInterval: 16.68,
}

const thresholds = {
  overshoot: 1,
  closest: 1.5,
  undershoot: 2,
}

export class FrameTimeout {
  f: Function
  delay: number
  params: any[]

  mode: 'undershoot' | 'closest' | 'overshoot'
  targetTime: undefined | number

  private running: boolean
  private timeoutHandle: undefined | number
  private animationFrameHandle: undefined | number
  private lastAnimationFrame: undefined | number

  constructor(f: Function, delay: number, ...params: any[]) {
    this.delay = delay
    this.f = f
    this.params = params

    // Internal state
    this.running = false
    this.timeoutHandle = undefined
    this.animationFrameHandle = undefined
    this.lastAnimationFrame = undefined

    // Target timestamp
    this.targetTime = undefined

    // Timing mode
    this.mode = 'closest'

    // Bind tick method
    this.tick = this.tick.bind(this)
  }

  tick(frameTime = performance.now(), frameSynced = false) {
    // Estimate the current frame interval, falling back
    // onto the minimum observed interval if necessary
    const frameInterval =
      frameTime - this.lastAnimationFrame! || timingParameters.frameInterval

    // Update minimum frame interval if necessary
    if (frameInterval < timingParameters.frameInterval) {
      timingParameters.frameInterval = frameInterval
    }

    // Calculate the remaining time in frames
    // (at the current frame rate)
    const remainingFrames = (this.targetTime! - frameTime) / frameInterval

    if (remainingFrames <= thresholds[this.mode]) {
      // Fire callback
      this.f(frameTime, ...this.params)
    } else if (this.targetTime! - frameTime < 200) {
      // Check again on the next frame
      this.animationFrameHandle = window.requestAnimationFrame(t =>
        this.tick(t, true),
      )
      // Only use timestamp for frame duration estimation
      // if the call is actually frame-synced
      if (frameSynced) {
        this.lastAnimationFrame = frameTime
      }
    } else {
      // Wait a little longer
      // (to be exact, wait for half of the remaining time, minus 100ms)
      this.timeoutHandle = window.setTimeout(
        this.tick,
        (this.targetTime! - frameTime - 100) / 2,
      )
    }
  }

  run(now = performance.now()) {
    if (!this.running) {
      // Set target time in milliseconds
      this.targetTime = this.targetTime || now + this.delay
      this.tick()
      this.running = true
    } else {
      console.log('Cannot restart previously run timer')
    }
  }

  cancel() {
    window.clearTimeout(this.timeoutHandle)
    window.cancelAnimationFrame(this.animationFrameHandle!)
  }
}
