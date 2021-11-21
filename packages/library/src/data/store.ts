import { saveAs } from 'file-saver'
import {
  cloneDeep,
  flatten,
  difference,
  intersection,
  sortedUniq,
  pick,
} from 'lodash'

import { Emitter } from '../base/util/emitter'
import { dateString } from './util/dates'
import { cleanData } from './util/clean'
import { toCsv } from './util/csv'

export type BaseRow = {
  sender: string
  sender_type: string
  sender_id: string
  timestamp: Date
  meta: object
  time_run: number
  time_render: number
  time_show: number
  time_end: number
  time_switch: number
  time_lock: number
}

export type Row = Partial<BaseRow> & Record<string, unknown>
export type Table = Array<Row>
export type FileFormat = 'csv' | 'json' | 'jsonl'

// Default column names -----------------------------------

const defaultIdColumns = [
  // TODO: Standardize the id column and document
  // a single preferred name for it
  'id',
  'participant',
  'participant_id',
]

const defaultMetadata = [
  ...defaultIdColumns,
  'sender',
  'sender_type',
  'sender_id',
  'timestamp',
  'meta',
]

// Data storage class -------------------------------------

export class Store extends Emitter {
  #state: Row
  private staging: Row
  data: Table

  constructor() {
    super()

    // Initialize empty state
    this.data = []
    this.#state = {}
    this.staging = {}
  }

  // Get and set individual values ------------------------
  set(key: Row): void
  set(key: string, value: any, suppressSetTrigger?: boolean): void
  set(key: string | Row, value?: any, suppressSetTrigger = false): void {
    let partial: Row = {}
    if (typeof key === 'object') {
      partial = key
    } else {
      partial[key] = value
    }

    this.#state = Object.assign(this.#state, partial)
    this.staging = Object.assign(this.staging, partial)

    if (!suppressSetTrigger) {
      this.emit('set')
    }
  }

  get(key: string) {
    return this.#state[key]
  }

  getAny(keys: string[] = []) {
    // Check whether any of the columns is present in the data --
    // if so, return its value
    for (const k of keys) {
      if (Object.keys(this.#state).includes(k)) {
        return this.#state[k]
      }
    }

    // If no value was found, return undefined
    return undefined
  }

  // The stateProxy property provides proxy-mediated access
  // to the datastore state, while saving changes to staging.
  // This will replace the datastore's state property. (TODO)
  state = new Proxy(
    {},
    {
      get: (_, prop: string) => this.get(prop),
      set: (_, prop: string, value: any) =>
        // TODO can we improve on this?
        (this.set(prop, value) as unknown as boolean) || true,
      has: (_, prop) => Reflect.has(this.#state, prop),
      ownKeys: () => Reflect.ownKeys(this.#state),
      getOwnPropertyDescriptor: (_, prop) =>
        Reflect.getOwnPropertyDescriptor(this.#state, prop),
    },
  )

  // Commit data to storage -------------------------------
  commit(): number {
    // Remember the index of the new entry
    const logIndex = this.data.push(cloneDeep(this.staging)) - 1
    this.staging = {}

    this.emit('commit')

    return logIndex
  }

  // Update saved data ------------------------------------
  update(index: number, callback = (d: Row): Row => d) {
    this.data[index] = callback(this.data[index] || {})
    this.emit('update')
  }

  // Erase collected data ---------------------------------
  clear() {
    this.emit('clear')

    // Clear local (transient) state
    this.data = []
    this.staging = {}
    this.#state = {}
  }

  _hydrate({ data = [], state = {} }: { data: Table; state: Row }) {
    this.data = data
    this.#state = state
  }

  // Extracting data --------------------------------------
  keys(includeState = false, prioritize = defaultMetadata) {
    // Extract all keys from the data collected
    let keys = this.data.map(e => Object.keys(e))

    // Include keys from state
    if (includeState) {
      keys.push(Object.keys(this.#state))
    }

    // Flatten the nested array
    const flatKeys = flatten(keys)

    // Sort alphabetically and remove duplicates
    // (sorting apparently needs to be done twice)
    flatKeys.sort()
    const uniqueKeys = sortedUniq(flatKeys).sort()

    // Bring certain columns to the front
    const prioritizedKeys = intersection(prioritize, uniqueKeys)
    const remainingKeys = difference(uniqueKeys, prioritizedKeys)

    return prioritizedKeys.concat(remainingKeys)
  }

  // Extract a single column for the data,
  // also filtering by sender, if desired
  extract(column: string, senderRegExp: RegExp | string = RegExp('.*')) {
    // If the filter is defined a a string,
    // convert it into the corresponding
    // regular expression.
    const filter =
      typeof senderRegExp === 'string'
        ? RegExp(`^${senderRegExp}$`)
        : senderRegExp

    // Filter the data using the sender column,
    // and then extract the column in question
    return this.data
      .filter(r => filter.test(r.sender ?? ''))
      .map(r => r[column])
  }

  // Select the columns that should be present in the data
  // Input is an array of strings, a string, or a filter function
  select(
    selector: string | string[] | ((key: string) => boolean),
    senderRegExp = RegExp('.*'),
  ) {
    let columns: string[]
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
          'a string, or a filter function.',
      )
    }

    // As above
    const filter =
      typeof senderRegExp === 'string'
        ? RegExp(`^${senderRegExp}$`)
        : senderRegExp

    return this.data
      .filter(r => filter.test(r.sender ?? ''))
      .map(r => pick(r, columns))
  }

  get cleanData() {
    return cleanData(this.data)
  }

  // Export data in various formats -----------------------
  exportJson(clean = true) {
    // Optionally export raw data
    const data = clean ? this.cleanData : this.data

    // Export data a JSON string
    return JSON.stringify(data)
  }

  exportJsonL(clean = true) {
    // Export data in the json-lines format
    // (see http://jsonlines.org/)

    // Optionally export raw data
    const data = clean ? this.cleanData : this.data

    return data.map(e => JSON.stringify(e)).join('\n')
  }

  exportCsv(separator = ',', clean = true) {
    // Export data as csv string
    // Optionally export raw data
    const data = clean ? this.cleanData : this.data

    // If exporting the cleaned data, remove keys
    // that start with an underscore
    const keys = this.keys().filter(k => !clean || !k.startsWith('_'))

    return toCsv(data, keys, separator)
  }

  exportBlob(format: FileFormat = 'csv', clean = true) {
    // Assemble the text representation
    // of the current data
    let text = ''

    if (format === 'json') {
      text = this.exportJson(clean)
    } else if (format === 'jsonl') {
      text = this.exportJsonL(clean)
    } else {
      text = this.exportCsv(undefined, clean)
    }

    const mime = {
      csv: 'text/csv',
      json: 'application/json',
      jsonl: 'application/jsonl',
    }[format]

    // Convert the so encoded data to a blob object
    return new Blob([text], { type: mime })
  }

  // Extract a participant id -----------------------------
  guessId(columns: string[] = defaultIdColumns) {
    return this.getAny(columns)
  }

  // Suggest a filename -----------------------------------
  makeFilename(prefix = 'study', extension = 'csv') {
    // Extract an id from the data, if available
    const id = this.guessId()

    return (
      prefix +
      '--' +
      (id ? `${id}--` : '') +
      dateString() +
      (extension ? `.${extension}` : '')
    )
  }

  download(format: FileFormat = 'csv', filename?: string) {
    return saveAs(
      this.exportBlob(format),
      filename ?? this.makeFilename('data', format),
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
}
