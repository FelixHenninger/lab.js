import { ensureHighResTime } from './timing'

export const logTimestamp = columnName =>
  function(e) {
    e.preventDefault()
    this.data[columnName] = ensureHighResTime(e.timeStamp)
  }
