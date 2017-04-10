import { toString, toNumber } from 'lodash'

export const makeType = (value, type) => {
  if (type === undefined) {
    // Return value unchanged
    return value
  } else {
    // Convert types
    switch (type) {
      case 'string':
        // Trim strings to avoid problems
        // caused by invisible spaces
        return toString(value).trim()
      case 'number':
        return value.trim() === '' ? null : toNumber(value)
      case 'boolean':
        // Only 'true' and 'false' are
        // accepted as values.
        // eslint-disable-next-line default-case
        switch (value.trim()) {
          case 'true':
            return true
          case 'false':
            return false
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return null
    }
  }
}
