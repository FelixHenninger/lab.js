import { Component } from '../core/component'
import { Plugin } from '../base/plugin'

export type LoggerPluginOptions = {
  title?: string
}

export default class Logger implements Plugin {
  title?: string

  constructor({ title }: LoggerPluginOptions = {}) {
    this.title = title
  }

  async handle(_: Component, event: string) {
    console.log(`Component ${this.title} received ${event}`)
    return Promise.resolve()
  }
}
