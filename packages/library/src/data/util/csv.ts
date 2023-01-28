import { isObject } from 'lodash'

import { Row } from '../store'

export const escapeCell = (c: any): string => {
  // Stringify non-primitive data
  if (isObject(c)) {
    c = JSON.stringify(c)
  }

  // Escape CSV cells as per RFC 4180
  if (typeof c === 'string') {
    // Replace double quotation marks with double double quotation marks
    c = c.replace(/"/g, '""')

    // Surround a cell if it contains a comma,
    // (double) quotation marks, or a line break
    if (/[,"\n]+/.test(c)) {
      c = `"${c}"`
    }

    // Escape any symbols that Excel might interpret as formulas
    // (see https://owasp.org/www-community/attacks/CSV_Injection)
    if (/^[=+\-@\r\t]/.test(c)) {
      c = `'${c}`
    }
  }

  return c
}

export const toCsv = (
  data: Row[],
  columns: string[],
  separator = ',',
): string => {
  // Extract the data from each entry
  const rows = data.map(e => {
    const cells = columns.map(k => {
      if (Object.hasOwnProperty.call(e, k)) {
        return e[k]
      } else {
        return null
      }
    })

    return cells
      .map(escapeCell) // Escape special characters in cells
      .join(separator) // Separate cells
  })

  // Prepend column names
  rows.unshift(columns.map(escapeCell).join(separator))

  // Join rows
  return rows.join('\r\n')
}
