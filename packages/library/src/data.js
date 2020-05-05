import { saveAs } from 'file-saver'

import { isObject, cloneDeep, flatten,
  difference, intersection, uniq,
  pick, omitBy } from 'lodash'
import { EventHandler } from './util/eventAPI'
import { fetch as fetchRetry, debounceAsync } from './util/network'

// Default column names -----------------------------------

const defaultIdColumns = [
  // TODO: Standardize the id column and document
  // a single preferred name for it
  'id', 'participant', 'participant_id',
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

const cleanData = data =>
  // Filter keys that start with an underscore
  data.map(
    line => omitBy(line, (v, k) => k.startsWith('_'))
  )

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

  // The stateProxy property provides proxy-mediated access
  // to the datastore state, while saving changes to staging.
  // Over time, as proxies are more widespread in browsers,
  // this will replace the datastore's state property. (TODO)
  stateProxy = (BUILD_FLAVOR !== 'legacy'
    ? new window.Proxy({}, {
        get: (_, prop) => this.get(prop),
        set: (_, prop, value) => this.set(prop, value) || true,
        has: (_, prop) => Reflect.has(this.state, prop),
        ownKeys: () => Reflect.ownKeys(this.state),
        getOwnPropertyDescriptor: (_, prop) =>
          Reflect.getOwnPropertyDescriptor(this.state, prop),
      })
    : undefined
  )

  // Commit data to storage -------------------------------
  commit(key={}, value) {
    this.set(key, value, true)

    // Remember the index of the new entry
    const logIndex = this.data.push(
      cloneDeep(this.staging)
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
    // If the filter is defined a a string,
    // convert it into the corresponding
    // regular expression.
    const filter = typeof senderRegExp === 'string'
      ? RegExp(`^${ senderRegExp }$`)
      : senderRegExp

    // Filter the data using the sender column,
    // and then extract the column in question
    return this.data
      .filter(
        e => filter.test(e.sender),
      ).map(
        e => e[column],
      )
  }

  // Select the columns that should be present in the data
  // Input is an array of strings, a string, or a filter function
  select(selector, senderRegExp=RegExp('.*')) {
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

    // As above
    const filter = typeof senderRegExp === 'string'
      ? RegExp(`^${ senderRegExp }$`)
      : senderRegExp

    return this.data
      .filter(
        e => filter.test(e.sender),
      ).map(
        e => pick(e, columns),
      )
  }

  get cleanData() {
    return cleanData(this.data)
  }

  // Export data in various formats -----------------------
  exportJson(clean=true) {
    // Optionally export raw data
    const data = clean ? this.cleanData : this.data

    // Export data a JSON string
    return JSON.stringify(data)
  }

  exportJsonL(clean=true) {
    // Export data in the json-lines format
    // (see http://jsonlines.org/)

    // Optionally export raw data
    const data = clean ? this.cleanData : this.data

    return data.map(e => JSON.stringify(e)).join('\n')
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
    rows.unshift(
      keys
        .map(escapeCsvCell)
        .join(separator)
    )

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
    const { id } = this

    return prefix + '--' +
      (id ? `${ id }--` : '') + dateString() +
      (filetype ? `.${ filetype }` : '')
  }

  // Download data in a given format ----------------------
  download(filetype='csv', filename='data.csv') {
    // TODO: Generate a filename on-the-fly
    return saveAs(
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
  transmit(url, metadata={}, {
    incremental=false, encoding='json',
    headers: customHeaders={}, retry={},
  }={}) {
    this.triggerMethod('transmit')

    // Determine start and end of transmission
    const slice = incremental
      ? this._lastIncrementalTransmission // ... from last transmitted row
      : 0                                 // ... from beginning
    const sliceEnd = this.data.length

    // Data is always sent as an array of entries
    // (we slice first and then clean data to save some time,
    // rather than using the cleanData property and then slicing)
    const data = cleanData(this.data.slice(slice))

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
        data,
      })
      defaultHeaders = {
        'Accept': 'application/json', // eslint-disable-line quote-props
        'Content-Type': 'application/json',
      }
    }

    return fetchRetry(url, {
      method: 'post',
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      body,
      credentials: 'include',
      retry: {
        times: incremental ? 2 : 3,
        ...retry,
      },
    }).then(r => {
      // If an incremental transmission was successful,
      // remember the point to which data was transmitted.
      if (incremental) {
        this._lastIncrementalTransmission = sliceEnd
      }

      // Pass on response
      return r
    })
  }

  // Incremental transmission -----------------------------
  _debouncedTransmit = debounceAsync(
    this.transmit,
    2500,
  )
  _lastIncrementalTransmission = 0

  queueIncrementalTransmission(url, metadata, options) {
    return this._debouncedTransmit(url, metadata, {
      incremental: true,
      ...options,
    })
  }

  flushIncrementalTransmissionQueue() {
    this._debouncedTransmit.flush()
  }

  cancelIncrementalTransmissionQueue() {
    this._debouncedTransmit.cancel()
  }
}
