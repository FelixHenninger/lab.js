import { ensureHighResTime } from './timing'
import { Component } from '../base/component'

export const logTimestamp = (columnName: string) =>
  function (this: Component, e: InputEvent) {
    e.preventDefault()
    this.data[columnName] = ensureHighResTime(e.timeStamp)
  }
