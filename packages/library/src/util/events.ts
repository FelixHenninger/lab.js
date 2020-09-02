import { ensureHighResTime } from './timing'

export const logTimestamp = (columnName: any) =>
  function(e: any) {
    e.preventDefault()
    
    this.data[columnName] = ensureHighResTime(e.timeStamp)
  }
