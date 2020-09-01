import { ensureHighResTime } from './timing'

export const logTimestamp = (columnName: any) => (function(e: any) {
  e.preventDefault()
  // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
  this.data[columnName] = ensureHighResTime(e.timeStamp)
});
