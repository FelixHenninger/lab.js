// Data saving --------------------------------------------

export class DataStore {
  constructor() {
    this.data = []
    this.staging = {}
    this.state = {}
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
  }

  // Extracting data --------------------------------------
  keys(leaders=['sender', 'sender_type', 'sender_id', 'timestamp']) {
    // Extract all keys from the data collected
    let keys = this.data.map(
      (e) => Object.keys(e)
      )

    // Flatten the nested array
    keys = _.flatten(keys)

    // Sort alphabetically and remove duplicates
    keys.sort()
    keys = _.unique(keys, true)
    keys.sort() // apparently need to be sorted again

    // Bring certain columns to the front
    let leaders_present = _.intersection(leaders, keys)
    let remaining_keys = _.difference(keys, leaders_present)

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
        (e) => sender_re.test(e.sender)
      )
      .map(
        (e) => e[column]
      )
  }

  // Export data in various formats -----------------------
  export_json() {
    // Export data a JSON string
    return JSON.stringify(this.data)
  }

  export_csv(separator=',') {
    // Export data as csv string

    let keys = this.keys()

    // Extract the data from each entry
    let csv_rows = this.data.map((e) => {
      let row_cells = keys.map((k) => {
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
    let blob = new Blob(
      [text], {type: "octet/stream"}
    )

    return blob
  }

  // Download data in a given format ----------------------
  download(filetype='csv', filename='data.csv') {
    let blob = this.export_blob(filetype)

    // Convert this blob, in turn, to a url
    let url = window.URL.createObjectURL(blob)

    // Create a link containing the url
    // just computed, and add it to the document
    let a = document.createElement('a')
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
}
