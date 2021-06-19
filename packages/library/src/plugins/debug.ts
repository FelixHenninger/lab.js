import { isPlainObject, throttle } from 'lodash'
import { Controller } from '../base'
import { Component } from '../base/component'
import { Store } from '../data/store'

const payload = `<style type="text/css">
  .labjs-debug-opener {
    font-size: 1.2rem;
    color: var(--color-gray-content, #8d8d8d);
    /* Box formatting */
    width: 40px;
    height: 32px;
    padding: 6px 8px;
    border-radius: 3px;
    border: 1px solid var(--color-border, #e5e5e5);
    z-index: 3;
    background-color: var(--color-background, white);
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
    font-family: var(--font-family, "Arial", sans-serif);
    color: black;
    /* Box formatting */
    width: 100vw;
    height: 30vh;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 2;
    background-color: white;
    border-top: 2px solid var(--color-border, #e5e5e5);
    display: none;
    overflow: scroll;
  }

  #labjs-debug.labjs-debug-large .labjs-debug-overlay {
    height: 100vh;
  }

  .labjs-debug-overlay-menu {
    font-size: 0.8rem;
    color: var(--color-gray-content, #8d8d8d);
    padding: 8px 12px 6px;
    border-bottom: 1px solid var(--color-border, #e5e5e5);
  }

  .labjs-debug-overlay-menu a {
    color: var(--color-gray-content, #8d8d8d);
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
    background-color: var(--color-gray-background, #f8f8f8);
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

const makeMessage = (msg: string) => `
  <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;">
    ${msg}
  </div>`

const truncate = (s: string) => {
  // Restrict string length
  const output =
    s.length > 80
      ? `<div class="labjs-debug-trunc">${s.substr(0, 100)}</div>`
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
      } else {
        return contents.toFixed(2)
      }
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

const formatCell = (c: any) => `<td>${parseCell(c)}</td>`

const renderStore = (datastore: Store) => {
  // Export keys including state
  const keys = datastore.keys(true)

  // Render header row
  const header = keys.map(k => `<th>${k}</th>`)

  // Render state and store
  //@ts-ignore FIXME: This shouldn't work, maybe make state public (this is also used elsewhere)
  const state = keys.map(k => formatCell(datastore.state[k]))
  const store = datastore.data
    .slice() // copy before reversing in place
    .reverse()
    .map(row => `<tr> ${keys.map(k => formatCell(row[k])).join('')} </tr>`)

  // Export table
  return `
    <table>
      <tr>${header.join('\n')}</tr>
      <tr class="labjs-debug-state">${state.join('\n')}</tr>
      ${store.join('\n')}
    </table>
  `
}

export type DebugPluginOptions = {
  filePrefix?: string
}

export default class Debug {
  filePrefix: string

  private isVisible?: boolean
  private context?: Component
  private container?: Element

  constructor({ filePrefix = 'study' }: DebugPluginOptions = {}) {
    this.filePrefix = filePrefix
  }

  async handle(context: Component, event: string) {
    switch (event) {
      case 'plugin:init':
        return this.onInit(context)
      case 'prepare':
        return this.onPrepare()
      default:
        return null
    }
  }

  onInit(context: Component) {
    // Prepare internal state
    this.isVisible = false
    this.context = context

    // Prepare container element for debug tools
    this.container = document.createElement('div')
    this.container.id = 'labjs-debug'
    this.container.innerHTML = payload

    // Toggle visibility of debug window on clicks
    Array.from(this.container.querySelectorAll('.labjs-debug-toggle')).forEach(
      e => e.addEventListener('click', () => this.toggle()),
    )

    this.container
      .querySelector('.labjs-debug-overlay-menu')!
      .addEventListener('dblclick', () =>
        this.container!.classList.toggle('labjs-debug-large'),
      )

    this.container
      .querySelector('.labjs-debug-data-download')!
      .addEventListener('click', e => {
        e.preventDefault()
        this.context!.internals.controller.global.datastore.download(
          'csv',
          context.options.datastore.makeFilename(this.filePrefix, 'csv'),
        )
      })

    // Add payload code to document
    document.body.appendChild(this.container)
  }

  onPrepare() {
    if (this.context!.internals.controller) {
      const throttledRender = throttle(() => this.render(), 100)

      // Rerender after flips
      const controller = this.context!.internals.controller
      controller.on('flip', throttledRender)

      // Listen for datastore updates too, just in case
      // (it's really doubtful whether we need the commit event,
      // but for now, we decided better safe than sorry)
      const datastore = controller.global.datastore
      datastore.on('set', throttledRender)
      datastore.on('commit', throttledRender)
      datastore.on('update', throttledRender)
    }
  }

  toggle() {
    this.isVisible = !this.isVisible
    this.render()
    document.body.classList.toggle('labjs-debugtools-visible')
  }

  render() {
    if (this.isVisible) {
      const controller = this.context!.internals.controller
      const datastore = controller.global.datastore

      this.container!.querySelector(
        '.labjs-debug-overlay-contents',
      )!.innerHTML = renderStore(datastore)
    }
  }
}
