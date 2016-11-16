import { assign, difference, flatten, intersection, uniq } from 'lodash'
import { EventHandler } from './util/eventAPI'

// Data saving --------------------------------------------

const defaultMetadata = ['sender', 'sender_type', 'sender_id', 'timestamp']

const escapeCsvCell = (c) => {
  // Escape CSV cells as per RFC 4180

  if (typeof c === 'string') {
    // Replace double quotation marks by
    // double double quotation marks
    c = c.replace(/"/, '""')

    // Surround a cell if it contains a comma,
    // (double) quotation marks, or a line break
    if (/[,"\n]+/.test(c)) {
      c = `"${ c }"`
    }
  }

  return c
}

export class Store extends EventHandler {
  constructor(options={}) {
    // Construct the underlying EventHandler
    super(options)

    // Setup persistent storage, if requested
    if (options.persistence === 'session') {
      this.storage = sessionStorage
    } else if (options.persistence === 'local') {
      this.storage = localStorage
    } else {
      this.storage = null
    }

    // Clear persistent storage
    if (options.clearPersistence) {
      this.clear()
    }

    // Remember to trigger fallback if something
    // goes wrong
    let fallback = true

    // Recover state from storage, if present,
    // otherwise initialize empty data array
    if (this.storage) {
      // Check for preexisting data
      const data = this.storage.getItem('lab.js-data')

      // Perform initialization
      if (data) {
        // Fail gracefully if JSON parsing fails
        try {
          this.data = JSON.parse(data)
          this.state = Object.assign(...this.data)

          // Remove metadata from current state
          defaultMetadata.forEach((key) => {
            if (Object.hasOwnProperty.call(this.state, key)) {
              delete this.state[key]
            }
          })

          // Everything went well,
          // skip initialization of data and state
          fallback = false
        } catch (err) {
          // If an error occurs, play it safe
          fallback = true
        }
      }
    }

    // Initialize empty data and state
    // if no existing data were found,
    // or data were invalid
    if (fallback) {
      this.data = []
      this.state = {}
    }

    // Initialize empty staging data
    this.staging = {}
  }

  // Get and set individual values ------------------------
  set(key, value) {
    let attrs = {}
    if (typeof key === 'object') {
      attrs = key
    } else {
      attrs[key] = value
    }

    this.state = assign(this.state, attrs)
    this.staging = assign(this.staging, attrs)
  }

  get(key) {
    return this.state[key]
  }

  // Commit data to storage -------------------------------
  commit(key={}, value) {
    this.set(key, value)
    this.data.push(this.staging)
    this.staging = {}

    // Make persistent data copy if desired
    if (this.storage) {
      this.storage.setItem('lab.js-data', JSON.stringify(this.data))
    }

    this.triggerMethod('commit')
  }

  // Erase collected data ---------------------------------
  clear(persistence=true, state=false) {
    this.triggerMethod('clear')

    // Clear persistent state
    if (persistence && this.storage) {
      // TODO: Maybe limit this to specific keys?
      this.storage.clear()
    }

    // Clear local (transient) state
    if (state) {
      this.data = []
      this.staging = {}
      this.state = {}
    }
  }

  // Extracting data --------------------------------------
  keys(metadata=defaultMetadata) {
    // Extract all keys from the data collected
    let keys = this.data.map(
      e => Object.keys(e),
    )

    // Flatten the nested array
    keys = flatten(keys)

    // Sort alphabetically and remove duplicates
    // (sorting apparently needs to be done twice)
    keys.sort()
    keys = uniq(keys, true).sort()

    // Bring certain columns to the front
    const availableMetadata = intersection(metadata, keys)
    const remainder = difference(keys, availableMetadata)

    return availableMetadata.concat(remainder)
  }

  // Extract a single column for the data,
  // also filtering by sender, if desired
  extract(column, senderRegExp=RegExp('.*')) {
    // If a string is provided, assume that
    // the user is performing an exact search.
    // Convert the string into the corresponding
    // regular expression.
    if (typeof senderRegExp === 'string') {
      senderRegExp = RegExp(`^${ senderRegExp }$`)
    }

    // Filter the data using the sender column,
    // and then extract the column in question
    return this.data
      .filter(
        e => senderRegExp.test(e.sender),
      )
      .map(
        e => e[column],
      )
  }

  // Export data in various formats -----------------------
  exportJson() {
    // Export data a JSON string
    return JSON.stringify(this.data)
  }

  exportCsv(separator=',') {
    // Export data as csv string

    // Extract the data from each entry
    const rows = this.data.map((e) => {
      const cells = this.keys().map((k) => {
        if (Object.hasOwnProperty.call(e, k)) {
          return e[k]
        } else {
          return null
        }
      })

      return cells
        .map(escapeCsvCell) // Escape special characters in cells
        .join(separator) // Separate cells
    })

    // Prepend column names
    rows.unshift(this.keys().join(separator))

    // Join rows
    return rows.join('\r\n')
  }

  exportBlob(filetype='csv') {
    // Assemble the text representation
    // of the current data
    let text = ''

    if (filetype === 'json') {
      text = this.exportJson()
    } else {
      text = this.exportCsv()
    }

    // Convert the so encoded data to a blob object
    const blob = new Blob(
      [text], { type: 'octet/stream' },
    )

    return blob
  }

  // Download data in a given format ----------------------
  download(filetype='csv', filename='data.csv') {
    const blob = this.exportBlob(filetype)

    // Convert this blob, in turn, to a url
    const url = window.URL.createObjectURL(blob)

    // Create a link containing the url
    // just computed, and add it to the document
    const a = document.createElement('a')
    // FIXME: The following lines fail in Safari
    a.style = 'display: none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)

    // Simulate a click on the link
    a.click()

    // Remove the link after a short delay
    window.setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }, 100)
  }

  // Display data on the console
  show() {
    return console.table(
      this.data,
      this.keys(), // Use a neater column order
    )
  }

  // Send data via POST request ---------------------------
  transmit(url, metadata={}) {
    this.triggerMethod('transmit')

    return fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: metadata,
        url: window.location.href,
        data: this.data,
      }),
    })
  }
}
