import FileSaver from 'file-saver'

import { isObject, flatten, difference, intersection,
  uniq, pick, omitBy, debounce } from 'lodash'
import { EventHandler } from './util/eventAPI'

// Default column names -----------------------------------

const defaultIdColumns = [
  // TODO: Standardize the id column and document
  // a single preferred name for it
  'id', 'participant', 'participant_id'
]

const defaultMetadata = [
  ...defaultIdColumns,
  'sender', 'sender_type', 'sender_id',
  'timestamp', 'meta',
]

// Helper functions ---------------------------------------

const escapeCsvCell = (c) => {
  // Stringify non-primitive data
  if (isObject(c)) {
    c = JSON.stringify(c)
  }

  // Escape CSV cells as per RFC 4180
  if (typeof c === 'string') {
    // Replace double quotation marks by
    // double double quotation marks
    c = c.replace(/"/g, '""')

    // Surround a cell if it contains a comma,
    // (double) quotation marks, or a line break
    if (/[,"\n]+/.test(c)) {
      c = `"${ c }"`
    }
  }

  return c
}

const twoDigit = x => x.toString().padStart(2, '0')

const dateString = (d=new Date()) =>
  `${ d.getFullYear() }-` +
  `${ twoDigit((d.getMonth() + 1).toString()) }-` +
  `${ twoDigit(d.getDate().toString()) }--` +
  `${ d.toTimeString().split(' ')[0] }`

// Data storage class -------------------------------------

// eslint-disable-next-line import/prefer-default-export
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
          this.state = Object.assign({}, ...this.data)

          // Remove metadata from current state
          // (It would otherwise be added anew
          // with the next commit)
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
  set(key, value, fromCommit=false) {
    let attrs = {}
    if (typeof key === 'object') {
      attrs = key
    } else {
      attrs[key] = value
    }

    this.state = Object.assign(this.state, attrs)
    this.staging = Object.assign(this.staging, attrs)

    if (!fromCommit) {
      this.triggerMethod('set')
    }
  }

  get(key) {
    return this.state[key]
  }

  // Commit data to storage -------------------------------
  commit(key={}, value) {
    this.set(key, value, true)

    // Remember the index of the new entry
    const logIndex = this.data.push(
      this.staging
    ) - 1

    // Make persistent data copy if desired
    if (this.storage) {
      this.storage.setItem('lab.js-data', JSON.stringify(this.data))
    }
    // TODO: The differentiation of set and commit
    // events is not entirely clean. In particular,
    // data can be changed from a call to the commit
    // method, and the set method is called regardless
    // of whether new data are supplied.
    // Presently, the set trigger is not called if
    // new data are provided to commit rather than
    // via the set method directly.
    // Possibly, the set call should be made contingent
    // upon the presence of to-be-updated data, so
    // that the set event occurs only if new values
    // are actually set. These changes should also be
    // reflected in the debug plugin.
    this.triggerMethod('commit')

    this.staging = {}

    return logIndex
  }

  // Update saved data ------------------------------------
  update(index, handler=d => d) {
    this.data[index] = handler(this.data[index] || {})
    this.triggerMethod('update')
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
  keys(includeState=false, metadata=defaultMetadata) {
    // Extract all keys from the data collected
    let keys = this.data.map(
      e => Object.keys(e),
    )

    // Include keys from state
    if (includeState) {
      keys.push(Object.keys(this.state))
    }

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

  // Select the columns that should be present in the data
  // Input is an array of strings, a string, or a filter function
  select(selector) {
    let columns
    if (typeof selector === 'function') {
      columns = this.keys().filter(selector)
    } else if (typeof selector === 'string') {
      columns = [selector]
    } else {
      columns = selector
    }

    if (!Array.isArray(columns)) {
      throw new Error(
        'The input parameter should be either an array of strings, ' +
        'a string, or a filter function.'
      )
    }

    return this.data
      .map(
        e => pick(e, columns)
      )
  }

  get cleanData() {
    // Filter keys that start with an underscore
    return this.data.map(
      line => omitBy(line, (v, k) => k.startsWith('_'))
    )
  }

  // Export data in various formats -----------------------
  exportJson(clean=true) {
    // Optionally export raw data
    const data = clean ? this.cleanData : this.data

    // Export data a JSON string
    return JSON.stringify(data)
  }

  exportCsv(separator=',', clean=true) {
    // Export data as csv string
    // Optionally export raw data
    const data = clean ? this.cleanData : this.data

    // If exporting the cleaned data, remove keys
    // that start with an underscore
    const keys = this.keys()
      .filter(k => !clean || !k.startsWith('_'))

    // Extract the data from each entry
    const rows = data.map((e) => {
      const cells = keys.map((k) => {
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
    rows.unshift(keys.join(separator))

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
    return new Blob(
      [text], { type: 'octet/stream' },
    )
  }

  // Extract a participant id -----------------------------
  get id() {
    // Check whether any of the standard participant id columns
    // is present in the data -- if so, return its value
    for (const c of defaultIdColumns) {
      if (Object.keys(this.state).includes(c)) {
        return this.state[c]
      }
    }

    // If no value was found, return undefined
    return undefined
  }

  // Suggest a filename -----------------------------------
  makeFilename(prefix='study', filetype='csv') {
    // Extract an id from the data, if available
    const id = this.id

    return prefix + '--' +
      ( id ? `${ id }--` : '' ) + dateString() +
      ( filetype ? `.${ filetype }` : '')
  }

  // Download data in a given format ----------------------
  download(filetype='csv', filename='data.csv') {
    // TODO: Generate a filename on-the-fly
    return FileSaver.saveAs(
      this.exportBlob(filetype),
      filename,
    )
  }

  // Display data on the console
  show() {
    return console.table(
      this.data,
      this.keys(), // Use a neater column order
    )
  }

  // Send data via POST request ---------------------------
  transmit(url, metadata={},
    { headers:customHeaders={}, incremental=false, encoding='json' }={}
  ) {
    this.triggerMethod('transmit')

    // Determine start of transmission
    let slice
    if (incremental) {
      // Start from last transmitted row
      slice = this._lastIncrementalTransmission
      this._lastIncrementalTransmission = this.data.length
    } else {
      // Start from beginning
      slice = 0
    }

    // Data is always sent as an array of entries
    const data = this.cleanData.slice(slice)

    // Encode data
    let body, defaultHeaders = {}
    if (encoding === 'form') {
      // Encode data as form fields
      body = new FormData()
      body.append('metadata', JSON.stringify({ slice, ...metadata }))
      body.append('url', window.location.href)
      body.append('data', JSON.stringify(data))
    } else {
      // JSON encoding is the default
      body = JSON.stringify({
        metadata: {
          slice,
          ...metadata,
        },
        url: window.location.href,
        data: data,
      })
      defaultHeaders = {
        'Accept': 'application/json', // eslint-disable-line quote-props
        'Content-Type': 'application/json',
      }
    }

    return fetch(url, {
      method: 'post',
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      body,
      credentials: 'include',
    })
  }

  // Incremental transmission -----------------------------
  _debouncedTransmit = debounce(
    this.transmit,
    2500
  )
  _lastIncrementalTransmission = 0

  queueIncrementalTransmission(url, metadata, options) {
    this._debouncedTransmit(
      url, metadata, {
      incremental: true,
      ...options
    })
  }

  flushIncrementalTransmissionQueue() {
    this._debouncedTransmit.flush()
  }

  cancelIncrementalTransmissionQueue() {
    this._debouncedTransmit.cancel()
  }
}
