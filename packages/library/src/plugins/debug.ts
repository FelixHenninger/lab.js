import { isPlainObject, throttle } from 'lodash'
import { Controller } from '../base'
import { Component } from '../base/component'
import { Store } from '../data/store'

// Overlay UI container --------------------------------------------------------

const payload = `<style type="text/css">
  .labjs-debug-open {
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

  body.labjs-debug-visible .labjs-debug-open {
    display: none;
  }

  body.labjs-debug-visible.labjs-debug-vertical > .container.fullscreen {
    width: calc(50vw - 2 * var(--padding-internal));
  }

  .labjs-debug-overlay {
    font-family: var(--font-family, "Arial", sans-serif);
    color: black;
    /* Box formatting, exact positions defined below */
    position: fixed;
    z-index: 2;
    background-color: white;
    display: none;
    overflow: scroll;
    contain: strict;
  }

  body.labjs-debug-horizontal .labjs-debug-overlay {
    width: 100vw;
    height: 30vh;
    bottom: 0;
    left: 0;
    border-top: 2px solid var(--color-border, #e5e5e5);
  }

  body.labjs-debug-vertical .labjs-debug-overlay {
    width: 50vw;
    height: 100vh;
    top: 0;
    right: 0;
    border-left: 2px solid var(--color-border, #e5e5e5);
  }

  #labjs-debug.labjs-debug-large .labjs-debug-overlay {
    height: 100vh;
  }

  .labjs-debug-overlay-menu {
    position: sticky;
    top: 0px;
    font-size: 0.8rem;
    padding: 8px 12px 6px;
    color: var(--color-gray-content, #8d8d8d);
    background-color: white;
    border-bottom: 1px solid var(--color-border, #e5e5e5);
  }

  .labjs-debug-overlay-menu a {
    color: var(--color-gray-content, #8d8d8d);
  }

  .labjs-debug-overlay-menu .pull-right {
    float: right;
    position: relative;
    top: -4px;
  }

  .labjs-debug-overlay-menu .pull-right .labjs-debug-close {
    font-size: 1rem;
    margin-left: 0.5em;
    position: relative;
    top: 1px;
  }

  body.labjs-debug-visible .labjs-debug-overlay {
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
<div class="labjs-debug-open labjs-debug-toggle">
  <div style="position:relative;top:3.2px;left:-1.5px">
    <svg width="21" height="21" viewBox="0 0 16.93 16.93" xmlns="http://www.w3.org/2000/svg">
      <ellipse style="fill:currentColor" cx="8.47" cy="4.49" rx="2.49" ry=".89"/>
      <ellipse style="fill:none;stroke:currentColor;stroke-width:1.1" cx="8.47" cy="9.07" rx="4.65" ry="5.44"/>
      <path style="fill:none;stroke:currentColor;stroke-width:.2" d="M12.33 6c0 .9-1.73 1.63-3.86 1.63C6.33 7.63 4.6 6.9 4.6 6"/>
      <path style="fill:none;stroke:currentColor;stroke-width:.2" d="M8.47 7.58v6.8"/>
      <path style="fill:none;stroke:currentColor;stroke-width:.9" d="M5.65 2.12s.22 1.13.78 1.76M1.94 9.95s1.15-.1 1.89-.31M3.26 13.8s1.29-.6 1.55-1.13M2.54 5.6s1 .76 1.74 1.02M11.29 2.12s-.23 1.13-.78 1.76M15 9.95s-1.16-.1-1.9-.31M13.68 13.8s-1.3-.6-1.56-1.13M14.39 5.6s-1 .76-1.73 1.02"/>
    </svg>
  </div>
</div>
<div class="labjs-debug-overlay">
  <div class="labjs-debug-overlay-menu">
    <div class="pull-right">
      <code>lab.js</code> debug tools ·
      <a href="#" class="labjs-debug-data-download">📦 csv</a>
      <a href="" class="labjs-debug-snapshot">📌 Snapshot</a>
      <a href="" class="labjs-debug-snapshot-reload">Reload</a>
      <a href="" class="labjs-debug-snapshot-clear">Clear</a>
      <a href="" class="labjs-debug-alignment-toggle">Toggle alignment</a>
      <span class="labjs-debug-close labjs-debug-toggle">&times;</span>
    </div>
    <div>
      <span class="labjs-debug-overlay-breadcrumbs"></span>
      &nbsp; <!-- prevent element from collapsing -->
    </div>
  </div>
  <div class="labjs-debug-overlay-peek">
  </div>
  <div class="labjs-debug-overlay-contents">
    Contents
  </div>
</div>`

// Data display ----------------------------------------------------------------

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

// Peek UI ---------------------------------------------------------------------

type peekItem = [string[], string, string]
type peekLevel = peekItem[]

const renderItem = (i: peekItem) => `
  <a
    href=""
    data-labjs-debug-jump-id='${JSON.stringify(i[0])}'
  >
    ${i[1]} (${i[2]})
  </a>`

const renderPeek = (controller: Controller) => {
  const peekData: peekLevel[] = controller.iterator //
    .peek() as any as peekLevel[]

  return peekData
    .map(
      d => `
        <ul>
          ${d.map(i => `<li>${renderItem(i)}</li>`).join('\n')}
        </ul>
      `,
    )
    .join('')
}

// Breadcrumbs and skip UI -----------------------------------------------------

const renderBreadcrumbs = (controller: Controller) => {
  const stack = controller.currentStack.map((c, i) => {
    const title =
      i === 0 && c.options.title === 'root' ? 'Experiment' : c.options.title

    return {
      title: title ?? `Untitled ${c.type}`,
      type: c.type,
    }
  })

  return stack
    .map((c, i) => `<span data-labjs-debug-breadcrumb="${i}">${c.title}</span>`)
    .join(' <span style="opacity: 0.5">/</span> ')
}

// Hydration logic -------------------------------------------------------------

const snapshot = (context: Component, target?: string[]) => {
  // Calculate set of current ids
  const targetId =
    target ??
    context.internals.controller.currentStack
      .slice(1)
      .map((c: Component) => c.id)

  // Get data and state
  const data = context!.global.datastore.data
  const state = context!.state

  window.sessionStorage.setItem(
    'labjs-debug-snapshot',
    JSON.stringify({
      target: targetId,
      data,
      state,
      keep: true,
    }),
  )
}

const hydrate = async (component: Component, data: any) => {
  component.global.datastore._hydrate({ data: data.data, state: data.state })
  await component.internals.controller.jump('fastforward', {
    target: data.target,
  })
}

// Plugin proper ---------------------------------------------------------------

export type DebugPluginOptions = {
  filePrefix?: string
}

export default class Debug {
  filePrefix: string

  #isVisible?: boolean
  #alignment: 'horizontal' | 'vertical' = 'horizontal'
  #context?: Component
  #container?: Element

  constructor({ filePrefix = 'study' }: DebugPluginOptions = {}) {
    this.filePrefix = filePrefix
  }

  async handle(context: Component, event: string) {
    switch (event) {
      case 'plugin:init':
        return this.onInit(context)
      case 'prepare':
        return await this.onPrepare()
      default:
        return null
    }
  }

  onInit(context: Component) {
    // Prepare internal state
    this.#isVisible = false
    this.#context = context

    document.body.classList.add('labjs-debug-horizontal')

    // Prepare container element for debug tools
    this.#container = document.createElement('div')
    this.#container.id = 'labjs-debug'
    this.#container.innerHTML = payload

    // Toggle visibility of debug window on clicks
    Array.from(this.#container.querySelectorAll('.labjs-debug-toggle')).forEach(
      e => e.addEventListener('click', () => this.toggle()),
    )

    this.#container
      .querySelector('.labjs-debug-overlay-menu')!
      .addEventListener('dblclick', () =>
        this.#container!.classList.toggle('labjs-debug-large'),
      )

    this.#container
      .querySelector('.labjs-debug-data-download')!
      .addEventListener('click', e => {
        e.preventDefault()
        this.#context?.internals.controller.global.datastore.download(
          'csv',
          context.global.datastore.makeFilename(this.filePrefix, 'csv'),
        )
      })

    this.#container
      .querySelector('.labjs-debug-snapshot')!
      .addEventListener('click', e => {
        e.preventDefault()
        snapshot(this.#context!)
      })

    this.#container
      .querySelector('.labjs-debug-snapshot-reload')!
      .addEventListener('click', e => {
        e.preventDefault()
        window.location.reload()
      })

    this.#container
      .querySelector('.labjs-debug-snapshot-clear')!
      .addEventListener('click', e => {
        e.preventDefault()
        window.sessionStorage.removeItem('labjs-debug-snapshot')
      })

    this.#container
      .querySelector('.labjs-debug-alignment-toggle')!
      .addEventListener('click', e => {
        e.preventDefault()

        // Swap alignment
        if (this.#alignment == 'horizontal') {
          // TODO: Factor out body class updates to use class property
          document.body.classList.remove('labjs-debug-horizontal')
          document.body.classList.add('labjs-debug-vertical')
          this.#alignment = 'vertical'
        } else {
          document.body.classList.remove('labjs-debug-vertical')
          document.body.classList.add('labjs-debug-horizontal')
          this.#alignment = 'horizontal'
        }
      })

    this.#container
      .querySelector('.labjs-debug-overlay-breadcrumbs')!
      .addEventListener('click', e => {
        if (
          e.target instanceof HTMLSpanElement &&
          'labjsDebugBreadcrumb' in e.target.dataset
        ) {
          // Pull index from data attribute
          const index = e.target.dataset['labjsDebugBreadcrumb']!
          // Access corresponding component
          const component =
            this.#context?.internals.controller.currentStack[index]
          // Trigger abort for this component
          this.#context?.internals.controller.jump('abort', {
            sender: component,
          })
        }
      })

    this.#container
      .querySelector('.labjs-debug-overlay-peek')!
      .addEventListener('click', e => {
        if (
          e.target instanceof HTMLAnchorElement &&
          'labjsDebugJumpId' in e.target.dataset
        ) {
          e.preventDefault()

          // Pull target id stack from data attribute
          const target = JSON.parse(e.target.dataset['labjsDebugJumpId']!)

          // Create snapshot with this target
          snapshot(this.#context!, target)

          // Reload page to rehydrate
          window.location.reload()
        }
      })

    // Add payload code to document
    document.body.appendChild(this.#container)
  }

  async onPrepare() {
    if (this.#context!.internals.controller) {
      const throttledRender = throttle(() => this.render(), 100)

      // Rerender after flips
      const controller = this.#context!.internals.controller
      controller.on('flip', throttledRender)

      // Listen for datastore updates too, just in case
      // (it's really doubtful whether we need the commit event,
      // but for now, we decided better safe than sorry)
      const datastore = controller.global.datastore
      datastore.on('set', throttledRender)
      datastore.on('commit', throttledRender)
      datastore.on('update', throttledRender)

      if (window.sessionStorage.getItem('labjs-debug-snapshot')) {
        const { target, data, state, keep } = JSON.parse(
          //@ts-ignore TODO
          window.sessionStorage.getItem('labjs-debug-snapshot'),
        )
        await hydrate(this.#context!, { target, data, state })
        if (!this.#isVisible) {
          this.toggle()
        }
      }
    }
  }

  toggle() {
    this.#isVisible = !this.#isVisible
    this.render()
    document.body.classList.toggle('labjs-debug-visible')
  }

  render() {
    if (this.#isVisible) {
      const controller = this.#context!.internals.controller
      const datastore = controller.global.datastore

      this.#container!.querySelector(
        '.labjs-debug-overlay-contents',
      )!.innerHTML = renderStore(datastore)
      this.#container!.querySelector(
        '.labjs-debug-overlay-breadcrumbs',
      )!.innerHTML = renderBreadcrumbs(controller)
      this.#container!.querySelector('.labjs-debug-overlay-peek')!.innerHTML =
        renderPeek(controller)
    }
  }
}
