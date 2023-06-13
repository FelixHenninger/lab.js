import { Component } from '../core/component'
import { Plugin } from '../base/plugin'

const subtractFrom: Record<string, string> = {
  blur: 'focus',
  focus: 'blur',
  mouseover: 'mouseout',
  mouseout: 'mouseover',
  visibilitychange: 'visibilitychange',
}

export default class PageFocusPlugin implements Plugin {
  count: boolean
  notify: boolean
  message: string
  lastTimestamps: Record<string, number> = {}

  _handleEvent!: (ev: Event) => void

  constructor({
    notify = true,
    count = false,
    message,
  }: {
    notify?: boolean
    count?: boolean
    message?: string
  } = {}) {
    this.notify = notify
    this.count = count
    this.message =
      message ??
      'Please do not switch to another window' +
        'or minimize the browser while the study is running.'
  }

  async handle(context: Component, event: string) {
    if (event === 'run') {
      this._handleEvent = e => this.logEvent(e, context)
      window.addEventListener('focus', this._handleEvent)
      window.addEventListener('blur', this._handleEvent)
      window.addEventListener('visibilitychange', this._handleEvent)
    } else if (event === 'end') {
      window.removeEventListener('focus', this._handleEvent)
      window.removeEventListener('blur', this._handleEvent)
      window.removeEventListener('visibilitychange', this._handleEvent)
    }
  }

  logEvent(e: Event, context: Component) {
    const ds = context.internals.controller.global.datastore
    const staging = ds.staging
    if (!staging.paradata) {
      staging.paradata = []
    }

    if (this.count) {
      if (staging[`${e.type}Count`] === undefined) {
        staging[`${e.type}Count`] = 1
      } else {
        staging[`${e.type}Count`]++
      }
    }

    // Save last observed timestamps for every event type
    this.lastTimestamps[e.type] = e.timeStamp
    const matchingEvent = subtractFrom[e.type]

    // Prepare the data to add to the dataset
    const log: Record<string, any> = {
      event: e.type,
      ts: e.timeStamp,
      duration: e.timeStamp - this.lastTimestamps[matchingEvent],
    }

    if (e.type === 'visibilitychange') {
      log.visibilityState = document.visibilityState
    }

    ds.staging.paradata.push(log)

    // Warn participants if they leave the window
    if (this.notify && e.type === 'blur') {
      alert(this.message)
    }
  }
}
