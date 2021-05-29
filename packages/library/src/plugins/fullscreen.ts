import { Component } from '../base/component'
import { Plugin } from '../base/plugin'
import {
  launch as launchFullscreen,
  exit as exitFullscreen,
  launch,
} from '../util/fullscreen'

export type FullscreenOptions = {
  message?: string
  hint?: string
  close?: boolean
}

export default class FullscreenPlugin implements Plugin {
  message: string
  hint: string
  close: boolean

  constructor({ message, hint, close }: FullscreenOptions = {}) {
    this.message = message || 'This experiment requires full screen display'
    this.hint = hint || 'Please click to continue in full screen mode'
    this.close = close ?? true
  }

  async handle(context: Component, event: string) {
    if (event === 'before:run' && !document.fullscreenElement) {
      // Create and show overlay (sorry Merle, no Alpacas here :-/ )
      const overlay = document.createElement('div')
      overlay.innerHTML = `
        <div
          class="modal w-m content-horizontal-center content-vertical-center text-center"
        >
          <p>
            <span class="font-weight-bold">
              ${this.message}
            </span><br>
            <span class="text-muted">
              ${this.hint}
            </span>
          </p>
        </div>
      `
      overlay.classList.add(
        'overlay',
        'content-vertical-center',
        'content-horizontal-center',
      )
      document.body.appendChild(overlay)

      // Halt all activity until confirmation of the fullscreen switch
      await new Promise(resolve => {
        overlay.addEventListener(
          'click',
          async e => {
            await launchFullscreen(document.documentElement)
            document.body.removeChild(overlay)
            resolve(null)
          },
          { once: true },
        )
      })
    } else if (event === 'end' && this.close) {
      exitFullscreen()
    }
  }
}
