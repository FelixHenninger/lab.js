import { isPlainObject, throttle } from 'lodash'
import { Controller } from '../core'
import { Component } from '../core/component'
import { requestIdleCallback } from '../core/timing/shims'
import { Store } from '../data/store'
import { stackSummary } from '../base/util/iterators/interface'
import { autoSeed } from '../util/random/seed'

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
    top: -3px;

    a {
      text-decoration: none;

      &:hover {
        color: orange;
      }
    }

    svg {
      position: relative;
      top: 3.5px;
    }
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

  /* Layer peeking */
  .labjs-debug-overlay ul.labjs-debug-peek-layer {
  }

  .labjs-debug-overlay ul.labjs-debug-peek-layer li {
  }
  .labjs-debug-overlay ul.labjs-debug-peek-layer li.current > a > .labjs-debug-jump-title {
    font-weight: bold;
  }

  .labjs-debug-overlay ul.labjs-debug-peek-layer li a {
  }
  .labjs-debug-overlay ul.labjs-debug-peek-layer li a .labjs-debug-jump-type {
  }
</style>
<div class="labjs-debug-open labjs-debug-toggle">
  <div style="position:relative;top:3.75px;left:-2.75px">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.25rem">
      <path d="M13.024 9.25c.47 0 .827-.433.637-.863a4 4 0 0 0-4.094-2.364c-.468.05-.665.576-.43.984l1.08 1.868a.75.75 0 0 0 .649.375h2.158ZM7.84 7.758c-.236-.408-.79-.5-1.068-.12A3.982 3.982 0 0 0 6 10c0 .884.287 1.7.772 2.363.278.38.832.287 1.068-.12l1.078-1.868a.75.75 0 0 0 0-.75L7.839 7.758ZM9.138 12.993c-.235.408-.039.934.43.984a4 4 0 0 0 4.094-2.364c.19-.43-.168-.863-.638-.863h-2.158a.75.75 0 0 0-.65.375l-1.078 1.868Z" />
      <path fill-rule="evenodd" d="m14.13 4.347.644-1.117a.75.75 0 0 0-1.299-.75l-.644 1.116a6.954 6.954 0 0 0-2.081-.556V1.75a.75.75 0 0 0-1.5 0v1.29a6.954 6.954 0 0 0-2.081.556L6.525 2.48a.75.75 0 1 0-1.3.75l.645 1.117A7.04 7.04 0 0 0 4.347 5.87L3.23 5.225a.75.75 0 1 0-.75 1.3l1.116.644A6.954 6.954 0 0 0 3.04 9.25H1.75a.75.75 0 0 0 0 1.5h1.29c.078.733.27 1.433.556 2.081l-1.116.645a.75.75 0 1 0 .75 1.298l1.117-.644a7.04 7.04 0 0 0 1.523 1.523l-.645 1.117a.75.75 0 1 0 1.3.75l.644-1.116a6.954 6.954 0 0 0 2.081.556v1.29a.75.75 0 0 0 1.5 0v-1.29a6.954 6.954 0 0 0 2.081-.556l.645 1.116a.75.75 0 0 0 1.299-.75l-.645-1.117a7.042 7.042 0 0 0 1.523-1.523l1.117.644a.75.75 0 0 0 .75-1.298l-1.116-.645a6.954 6.954 0 0 0 .556-2.081h1.29a.75.75 0 0 0 0-1.5h-1.29a6.954 6.954 0 0 0-.556-2.081l1.116-.644a.75.75 0 0 0-.75-1.3l-1.117.645a7.04 7.04 0 0 0-1.524-1.523ZM10 4.5a5.475 5.475 0 0 0-2.781.754A5.527 5.527 0 0 0 5.22 7.277 5.475 5.475 0 0 0 4.5 10a5.475 5.475 0 0 0 .752 2.777 5.527 5.527 0 0 0 2.028 2.004c.802.458 1.73.719 2.72.719a5.474 5.474 0 0 0 2.78-.753 5.527 5.527 0 0 0 2.001-2.027c.458-.802.719-1.73.719-2.72a5.475 5.475 0 0 0-.753-2.78 5.528 5.528 0 0 0-2.028-2.002A5.475 5.475 0 0 0 10 4.5Z" clip-rule="evenodd" />
    </svg>
  </div>
</div>
<div class="labjs-debug-overlay">
  <div class="labjs-debug-overlay-menu">
    <div class="pull-right">
      <code>lab.js</code> debug tools&ensp;·&ensp;
      <a href="#" class="labjs-debug-data-download">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1rem">
          <title>Download data as CSV file</title>
          <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
          <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
        </svg>
      </a>&nbsp;
      <a href="#" class="labjs-debug-snapshot">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1rem">
          <title>Take snapshot to recreate study on reload</title>
          <path d="M3.75 2a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.28.53L8 10.06l3.72 3.72a.75.75 0 0 0 1.28-.53V2.75a.75.75 0 0 0-.75-.75h-8.5Z" />
        </svg>
      </a>&nbsp;
      <a href="#" class="labjs-debug-snapshot-reload">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1rem">
          <title>Reload study</title>
          <path fill-rule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z" clip-rule="evenodd" />
        </svg>
      </a>&nbsp;
      <a href="#" class="labjs-debug-snapshot-clear">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1rem">
          <title>Clear snapshot to start afresh</title>
          <path d="M13 2.75v7.775L4.475 2h7.775a.75.75 0 0 1 .75.75ZM3 13.25V5.475l4.793 4.793L4.28 13.78A.75.75 0 0 1 3 13.25ZM2.22 2.22a.75.75 0 0 1 1.06 0l10.5 10.5a.75.75 0 1 1-1.06 1.06L2.22 3.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </a>&nbsp;
      <a href="#" class="labjs-debug-alignment-toggle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1rem">
          <title>Toggle horizontal and vertical display</title>
          <path fill-rule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd" />
        </svg>
      </a>&nbsp;
      <span class="labjs-debug-close labjs-debug-toggle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1rem">
          <title>Close debug tools</title>
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      </span>
    </div>
    <div>
      <span class="labjs-debug-overlay-breadcrumbs"></span>
      &nbsp; <!-- prevent element from collapsing -->
    </div>
  </div>
  <div class="labjs-debug-overlay-contents">
    <div class="labjs-debug-overlay-peek"></div>
    <div class="labjs-debug-overlay-data"></div>
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

const renderItem = (
  level: number,
  index: number,
  peekData: stackSummary,
  currentStack: (string | undefined)[],
) => {
  const [idStack, title, type] = peekData[level][index]
  const currentId = currentStack[level + 1]
  const inStack = idStack.at(-1) === currentId
  const renderChildren = inStack && currentStack[level + 2] !== undefined

  return `
    <li ${inStack ? 'class="current"' : ''}>
      <a
        href=""
        data-labjs-debug-jump-id='${JSON.stringify(idStack)}'
      >
        <span class="labjs-debug-jump-title">${title}</span>
        <span class="labjs-debug-jump-type">(${type})</span>
        ${renderChildren ? renderLayer(peekData, level + 1, currentStack) : ''}
      </a>
    </li>
  `
}

const renderLayer = (
  peekData: stackSummary,
  level: number,
  currentStack: (string | undefined)[],
): string => {
  const items = peekData[level]

  return `
    <ul class="labjs-debug-peek-layer">
      ${
        items &&
        items
          .map((_, i) => renderItem(level, i, peekData, currentStack))
          .join('\n')
      }
    </ul>
  `
}

const renderPeek = (controller: Controller) => {
  const peekData = controller.iterator.peek()
  const currentStack = controller.currentStack.map(c => c.id)

  return renderLayer(peekData, 0, currentStack)
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

const snapshot = (context: Component, seed: string) => {
  // Calculate set of current ids
  const targetId = context.internals.controller.currentStack.slice(1).map(c => c.id)

  // Get data and state
  const data = context.global.datastore.data
  const state = context.state

  window.sessionStorage.setItem(
    'labjs-debug-snapshot',
    JSON.stringify({
      target: targetId,
      data,
      state,
      keep: true,
    }),
  )
  window.sessionStorage.setItem('labjs-debug-seed', seed)
}

const hydrate = async (component: Component, data: any) => {
  component.global.datastore._hydrate({ data: data.data, state: data.state })
  // This is a hack, designed to hide the fact that jumping
  // doesn't work before the study root component is fully prepared.
  // The idea is that preparation should be complete before
  // this fires.
  requestIdleCallback(async () => {
    await component.internals.controller.jump('jump', {
      targetStack: data.target,
    })
  })
}

// Plugin proper ---------------------------------------------------------------

export type DebugPluginOptions = {
  filePrefix?: string
}

type DebugPluginAlignment = 'horizontal' | 'vertical'

export default class Debug {
  filePrefix: string

  #isVisible?: boolean
  #alignment: DebugPluginAlignment
  #context?: Component
  #container?: Element
  #seed: string

  constructor({ filePrefix = 'study' }: DebugPluginOptions = {}) {
    this.filePrefix = filePrefix
    this.#alignment =
      (window.sessionStorage.getItem(
        'labjs-debug-alignment',
      ) as DebugPluginAlignment) ?? 'horizontal'
    this.#seed = window.sessionStorage.getItem('labjs-debug-seed') ?? autoSeed()
  }

  async handle(context: Component, event: string) {
    switch (event) {
      case 'plugin:add':
        return this.onInit(context)
      case 'prepare':
        return await this.onPrepare()
      default:
        return
    }
  }

  onInit(context: Component) {
    // Prepare internal state
    this.#isVisible = JSON.parse(
      window.sessionStorage.getItem('labjs-debug-visible') ?? 'false',
    ) as unknown as boolean
    this.#context = context

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
        snapshot(this.#context!, this.#seed)
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
        window.sessionStorage.removeItem('labjs-debug-seed')
      })

    this.#container
      .querySelector('.labjs-debug-alignment-toggle')!
      .addEventListener('click', e => {
        e.preventDefault()

        // Swap alignment
        if (this.#alignment === 'horizontal') {
          this.#alignment = 'vertical'
        } else {
          this.#alignment = 'horizontal'
        }

        window.sessionStorage.setItem('labjs-debug-alignment', this.#alignment)
        this.#updateBodyClassList()
      })

    this.#container
      .querySelector('.labjs-debug-overlay-breadcrumbs')!
      .addEventListener('click', e => {
        if (
          e.target instanceof HTMLSpanElement &&
          'labjsDebugBreadcrumb' in e.target.dataset
        ) {
          // Pull index from data attribute
          const index = parseInt(e.target.dataset['labjsDebugBreadcrumb']!)
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
        // Clicks may be caught by other elements;
        // in this case, find the next link
        const jumpLink = (e.target as HTMLElement)?.closest('a')

        if (jumpLink && 'labjsDebugJumpId' in jumpLink.dataset) {
          e.preventDefault()

          // Pull target id stack from data attribute
          const target = JSON.parse(jumpLink.dataset['labjsDebugJumpId']!)

          // Jump to target
          this.#context?.internals.controller.jump('jump', {
            targetStack: target,
          })
        }
      })

    // Add payload code to document
    document.body.appendChild(this.#container)
    this.#updateBodyClassList()

    // Setup RNG generation on context if not available
    this.#context.options.random = this.#context.options.random ?? {
      algorithm: 'alea',
      seed: this.#seed,
    }
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
    this.#updateBodyClassList()
    window.sessionStorage.setItem(
      'labjs-debug-visible',
      JSON.stringify(this.#isVisible),
    )
  }

  render() {
    if (this.#isVisible) {
      const controller = this.#context!.internals.controller
      const datastore = controller.global.datastore

      this.#container!.querySelector(
        '.labjs-debug-overlay-contents .labjs-debug-overlay-data',
      )!.innerHTML = renderStore(datastore)
      this.#container!.querySelector(
        '.labjs-debug-overlay-breadcrumbs',
      )!.innerHTML = renderBreadcrumbs(controller)
      this.#container!.querySelector('.labjs-debug-overlay-peek')!.innerHTML =
        renderPeek(controller)
    }
  }

  #updateBodyClassList() {
    document.body.classList.toggle('labjs-debug-visible', this.#isVisible)
    document.body.classList.toggle(
      'labjs-debug-horizontal',
      this.#alignment === 'horizontal',
    )
    document.body.classList.toggle(
      'labjs-debug-vertical',
      this.#alignment === 'vertical',
    )
  }
}
