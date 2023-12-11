import { Component } from '../core/component'
import { Plugin } from '../base/plugin'

export type PostMessagePluginOptions = {
  origin?: string
  target?: Window
  messageType?: string
}

export default class PostMessage implements Plugin {
  origin: string
  target: Window
  messageType: string

  constructor({ origin, target, messageType }: PostMessagePluginOptions = {}) {
    this.origin = origin ?? '*'
    this.target = target ?? window.parent
    this.messageType = messageType ?? 'labjs.data'
  }
  
  handle(context: Component, event: string) {
    if (event === 'lock') {
      this.target.postMessage(
        {
          type: this.messageType,
          metadata: {
            payload: 'full',
            url: window.location.href,
          },
          raw: context.global.datastore.data,
          json: context.global.datastore.exportJson(),
          csv: context.global.datastore.exportCsv(),
        },
        this.origin,
      )
    }
  }
}
