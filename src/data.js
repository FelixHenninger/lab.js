// Data saving --------------------------------------------

let metadata_keys = ['sender', 'sender_type', 'sender_id', 'timestamp']

export class DataStore {
  constructor(options={}) {
    // Setup persistent storage, if requested
    if (options.persistence === 'session') {
      this.storage = sessionStorage
    } else if (options.persistence === 'local') {
      this.storage = localStorage
    } else {
      this.storage = null
    }

    // Clear persistent storage
    if (options.persistence_clear) {
      this.clear()
    }

    // Remember to trigger fallback if something
    // goes wrong
    let use_fallback = true

    // Recover state from storage, if present,
    // otherwise initialize empty data array
    if (this.storage) {
      // Check for preexisting data
      const existing_data = this.storage.getItem('lab.js-data')

      // Perform initialization
      if (existing_data) {
        // Fail gracefully if JSON parsing fails
        try {
          this.data = JSON.parse(existing_data)
          this.state = Object.assign(...this.data)

          // Remove metadata from current state
          metadata_keys.forEach(key => {
            if (this.state.hasOwnProperty(key)) {
              delete this.state[key]
            }
          })

          // Everything went well,
          // skip initialization of data and state
          use_fallback = false
        } catch(err) {
          // If an error occurs, play it safe
          use_fallback = true
        }
      }
    }

    // Initialize empty data and state
    // if no existing data were found,
    // or data were invalid
    if (use_fallback) {
      this.data = []
      this.state = {}
    }

    // Initialize empty staging data
    this.staging = {}
  }

  // Get and set individual values ------------------------
  set(key, value) {
    let attrs = {}
    if (typeof key == 'object') {
      attrs = key
    } else {
      attrs[key] = value
    }

    this.state = _.assign(this.state, attrs)
    this.staging = _.assign(this.staging, attrs)
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
  }

  // Erase collected data ---------------------------------
  clear(persistence=true, state=false) {
    // Clear persistent state
    if (persistence && this.storage) {
      // TODO: Maybe limit this
      // to specific keys?
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
  keys(leaders=metadata_keys) {
    // Extract all keys from the data collected
    let keys = this.data.map(
      e => Object.keys(e)
      )

    // Flatten the nested array
    keys = _.flatten(keys)

    // Sort alphabetically and remove duplicates
    keys.sort()
    keys = _.unique(keys, true)
    keys.sort() // apparently need to be sorted again

    // Bring certain columns to the front
    const leaders_present = _.intersection(leaders, keys)
    const remaining_keys = _.difference(keys, leaders_present)

    keys = leaders_present.concat(remaining_keys)

    return keys
  }

  // Extract a single column for the data,
  // also filtering by sender, if desired
  extract(column, sender_re=RegExp('.*')) {
    // If a string is provided, assume that
    // the user is performing an exact search.
    // Convert the string into the corresponding
    // regular expression.
    if (typeof sender_re === 'string') {
      sender_re = RegExp('^' + sender_re + '$')
    }

    // Filter the data using the sender column,
    // and then extract the column in question
    return this.data
      .filter(
        e => sender_re.test(e.sender)
      )
      .map(
        e => e[column]
      )
  }

  // Export data in various formats -----------------------
  export_json() {
    // Export data a JSON string
    return JSON.stringify(this.data)
  }

  export_csv(separator=',') {
    // Export data as csv string

    const keys = this.keys()

    // Extract the data from each entry
    const csv_rows = this.data.map(e => {
      const row_cells = keys.map(k => {
        if (e.hasOwnProperty(k)) {
          return e[k]
        } else {
          return null
        }
      })

      // TODO: Escape commas and quotes
      return row_cells.join(separator)
    })

    // Prepend column names
    csv_rows.unshift(keys.join(separator))

    return csv_rows.join('\r\n')
  }

  export_blob(filetype='csv') {
    // Assemble the text representation
    // of the current data
    let text = ''

    if (filetype == 'json') {
      text = this.export_json()
    } else {
      text = this.export_csv()
    }

    // Convert the so encoded data to a blob object
    const blob = new Blob(
      [text], {type: "octet/stream"}
    )

    return blob
  }

  // Download data in a given format ----------------------
  download(filetype='csv', filename='data.csv') {
    const blob = this.export_blob(filetype)

    // Convert this blob, in turn, to a url
    const url = window.URL.createObjectURL(blob)

    // Create a link containing the url
    // just computed, and add it to the document
    const a = document.createElement('a')
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
      this.keys() // Use a neater column order
    )
  }

  // Send data via POST request ---------------------------
  transmit(url, metadata={}) {
    return fetch(url, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meta: metadata,
        url: window.location.href,
        data: this.data
      })
    })
  }
}
