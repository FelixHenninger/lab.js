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
    /* Box formatting */
    width: 100vw;
    height: 20vh;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 2;
    background-color: white;
    border-top: 2px solid #e5e5e5;
    display: none;
    overflow: scroll;
  }

  .labjs-debug-overlay-menu {
    font-size: 0.8rem;
    color: #8d8d8d;
    padding: 8px 12px 6px;
    border-bottom: 1px solid #e5e5e5;
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
    overflow-y: auto;
  }

  .labjs-debug-overlay-contents table {
    font-size: 0.8rem;
  }

  .labjs-debug-overlay-contents table tr.labjs-debug-state {
    background-color: #f8f8f8;
  }
</style>
<div class="labjs-debug-opener labjs-debug-toggle"><div>≡</div></div>
<div class="labjs-debug-overlay">
  <div class="labjs-debug-overlay-menu">
    <div class="pull-right">
      <span class="labjs-debug-toggle">&times;</span>
    </div>
    <code>lab.js</code> · data preview
  </div>
  <div class="labjs-debug-overlay-contents">
    Contents
  </div>
</div>`

const makeMessage = msg => `
  <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;">
    ${ msg }
  </div>`

const parseCell = (contents) => {
  switch (typeof contents) {
    case 'number':
      if (contents > 150) {
        return contents.toFixed(0)
      } else {
        return contents.toFixed(2)
      }
    case 'undefined':
      return ''
    default:
      return contents
  }
}

const renderStore = datastore => {
  // Export keys including state
  const keys = datastore.keys(true)

  // Render header row
  const header = keys.map(k => `<th>${ k }</th>`)

  // Render state and store
  const state = keys.map(k => `<td>${ parseCell(datastore.state[k]) }</td>`)
  const store = datastore.data
    .slice().reverse() // copy before reversing in place
    .map(
      row => `<tr> ${ keys.map(k => `<td>${ parseCell(row[k]) }</td>`).join('') } </tr>`,
    ).join('\n')

  // Export table
  return `
    <table>
      <tr>${ header.join('\n') }</tr>
      <tr class="labjs-debug-state">${ state.join('\n') }</tr>
      ${ store }
    </table>
  `
}

export default class Debug {
  handle(context, event) {
    switch (event) {
      case 'plugin:init':
        return this.onInit(context)
      case 'prepare':
        return this.onPrepare()
      default:
        return null
    }
  }

  onInit(context) {
    // Prepare internal state
    this.isVisible = false
    this.context = context

    // Prepare container element for debug tools
    this.container = document.createElement('div')
    this.container.id = 'labjs-debug'
    this.container.innerHTML = payload

    // Toggle visibility of debug window on clicks
    this.container
      .querySelectorAll('.labjs-debug-toggle')
      .forEach(
        e => e.addEventListener('click', () => this.toggle()),
      )

    // Add payload code to document
    document.body.appendChild(this.container)
  }

  onPrepare() {
    // TODO: The view could also update
    // when state variables are set, but there currently
    // is no trigger in the data store
    if (this.context.options.datastore) {
      this.context.options.datastore
        .on('commit', () => this.render())
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

      this.container
        .querySelector('.labjs-debug-overlay-contents')
        .innerHTML = contents
    }
  }
}
