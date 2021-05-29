import { Component } from '../base/component'
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

  async handle(context: Component, event: string) {
    if (event === 'lock') {
      this.target.postMessage(
        {
          type: this.messageType,
          metadata: {
            payload: 'full',
            url: window.location.href,
          },
          raw: context.options.datastore.data,
          json: context.options.datastore.exportJson(),
          csv: context.options.datastore.exportCsv(),
        },
        this.origin,
      )
    }
  }
}
