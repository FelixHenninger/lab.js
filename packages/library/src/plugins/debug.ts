
import { isPlainObject } from 'lodash'

const payload = `<style type="text/css">
  .labjs-debug-opener {
    font-size: 1.2rem;
    color: #8d8d8d;
    /* Box formatting */
    width: 40px;
    height: 32px;
    padding: 6px 8px;
    border-radius: 3px;
    border: 1px solid #e5e5e5;
    z-index: 3;
    background-color: white;
    /* Fixed position */
    position: fixed;
    bottom: 36px;
    right: -5px;
    /* Content centering */
    display: flex;
    align-items: center;
    justify-content: left;
  }

  .labjs-debug-toggle {
    cursor: pointer;
  }

  body.labjs-debugtools-visible .labjs-debug-opener {
    display: none;
  }

  .labjs-debug-overlay {
    font-family: "Arial", sans-serif;
    color: black;
    /* Box formatting */
    width: 100vw;
    height: 30vh;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 2;
    background-color: white;
    border-top: 2px solid #e5e5e5;
    display: none;
    overflow: scroll;
  }

  #labjs-debug.labjs-debug-large .labjs-debug-overlay {
    height: 100vh;
  }

  .labjs-debug-overlay-menu {
    font-size: 0.8rem;
    color: #8d8d8d;
    padding: 8px 12px 6px;
    border-bottom: 1px solid #e5e5e5;
  }

  .labjs-debug-overlay-menu a {
    color: #8d8d8d;
  }

  .labjs-debug-overlay-menu .pull-right {
    font-size: 1rem;
    float: right;
  }

  body.labjs-debugtools-visible .labjs-debug-overlay {
    display: block;
  }

  .labjs-debug-overlay-contents {
    padding: 12px;
  }

  .labjs-debug-overlay-contents table {
    font-size: 0.8rem;
  }

  .labjs-debug-overlay-contents table tr.labjs-debug-state {
    background-color: #f8f8f8;
  }

  /* Truncated cells */
  .labjs-debug-trunc {
    min-width: 200px;
    max-width: 400px;
  }
  .labjs-debug-trunc::after {
    content: "...";
    opacity: 0.5;
  }
</style>
<div class="labjs-debug-opener labjs-debug-toggle"><div>≡</div></div>
<div class="labjs-debug-overlay">
  <div class="labjs-debug-overlay-menu">
    <div class="pull-right">
      <span class="labjs-debug-toggle">&times;</span>
    </div>
    <code>lab.js</code> ·
    data preview ·
    <a href="#" class="labjs-debug-data-download">download csv</a>
  </div>
  <div class="labjs-debug-overlay-contents">
    Contents
  </div>
</div>`

const makeMessage = (msg: any) => `
  <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;">
    ${ msg }
  </div>`

const truncate = (s: any) => {
  // Restrict string length
  const output =
    s.length > 80
      ? `<div class="labjs-debug-trunc">${ s.substr(0, 100) }</div>`
      : s

  // Insert invisible space after commas,
  // allowing for line breaks
  return output.replace(/,/g, ',&#8203;')
}

const parseCell = (contents: any) => {
  switch (typeof contents) {
    case 'number':
      if (contents > 150) {
        return contents.toFixed(0)
      }
      return contents.toFixed(2)

    case 'string':
      return truncate(contents)
    case 'undefined':
      return ''
    case 'object':
      if (isPlainObject(contents)) {
        return truncate(JSON.stringify(contents))
      }
    default:
      return contents
  }
}

const formatCell = (c: any) => `<td>${ parseCell(c) }</td>`

const renderStore = (datastore: any) => {
  // Export keys including state
  const keys = datastore.keys(true)

  // Render header row
  const header = keys.map((k: any) => `<th>${ k }</th>`)

  // Render state and store
  const state = keys.map((k: any) => formatCell(datastore.state[k]))
  const store = datastore.data
    .slice()
    .reverse() // copy before reversing in place
    .map(
      (row: any) =>
        `<tr> ${ keys.map((k: any) => formatCell(row[k])).join('') } </tr>`,
    )

  // Export table
  return `
    <table>
      <tr>${ header.join('\n') }</tr>
      <tr class="labjs-debug-state">${ state.join('\n') }</tr>
      ${ store.join('\n') }
    </table>
  `
}

export default class Debug {
  container: any

  context: any

  filePrefix: any

  isVisible: any

  constructor({ filePrefix = 'study' } = {}) {
    this.filePrefix = filePrefix
  }

  handle(context: any, event: any) {
    switch (event) {
      case 'plugin:init':
        return this.onInit(context)
      case 'prepare':
        return this.onPrepare()
      default:
        return null
    }
  }

  onInit(context: any) {
    // Prepare internal state
    this.isVisible = false
    this.context = context

    // Prepare container element for debug tools
    this.container = document.createElement('div')
    this.container.id = 'labjs-debug'
    this.container.innerHTML = payload

    // Toggle visibility of debug window on clicks
    
    Array.from(
      this.container.querySelectorAll('.labjs-debug-toggle'),
    ).forEach((e: any) => e.addEventListener('click', () => this.toggle()))

    this.container
      .querySelector('.labjs-debug-overlay-menu')
      .addEventListener('dblclick', () =>
        this.container.classList.toggle('labjs-debug-large'),
      )

    this.container
      .querySelector('.labjs-debug-data-download')
      .addEventListener('click', (e: any) => {
        e.preventDefault()
        if (this.context.options.datastore) {
          this.context.options.datastore.download(
            'csv',
            context.options.datastore.makeFilename(this.filePrefix, 'csv'),
          )
        } else {
          alert('No datastore to download from')
        }
      })

    // Add payload code to document
    document.body.appendChild(this.container)
  }

  onPrepare() {
    if (this.context.options.datastore) {
      // The display needs to be rerendered both
      // when variable values are set and when data
      // are committed, because the set event is not
      // triggered when data are committed, even if
      // data are changed.
      this.context.options.datastore.on('set', () => this.render())
      this.context.options.datastore.on('commit', () => this.render())
      this.context.options.datastore.on('update', () => this.render())
    }
  }

  toggle() {
    this.isVisible = !this.isVisible
    this.render()
    document.body.classList.toggle('labjs-debugtools-visible')
  }

  render() {
    if (this.isVisible) {
      let contents
      if (!this.context.options.datastore) {
        contents = makeMessage('No data store found in component')
      } else {
        contents = renderStore(this.context.options.datastore)
      }

      this.container.querySelector(
        '.labjs-debug-overlay-contents',
      ).innerHTML = contents
    }
  }
}
