const payload = `<style type="text/css">
  .labjs-debug-opener {
    font-size: 1.25rem;
    color: #8d8d8d;
    /* Box formatting */
    width: 30px;
    height: 30px;
    padding: 4px;
    border-radius: 3px;
    z-index: 3;
    background-color: white;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
    /* Fixed position */
    position: fixed;
    bottom: 36px;
    right: 36px;
    /* Content centering */
    display: flex;
    align-content: center;
    justify-content: center;
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
  }

  .labjs-debug-overlay-contents {
    padding: 12px;
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
</style>
<div class="labjs-debug-opener labjs-debug-toggle"><div>≡</div></div>
<div class="labjs-debug-overlay">
  <div class="labjs-debug-overlay-menu">
    <div class="pull-right">
      <span class="labjs-debug-toggle">&times;</span>
    </div>
    <code>lab.js</code> · debug tools
  </div>
  <div class="labjs-debug-overlay-contents">
    Contents
  </div>
</div>`

const makeMessage = msg => `
  <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center;">
    ${ msg }
  </div>`

export default class Debug {
  handle(context, event) {
    switch (event) {
      case 'plugin:init':
        return this.onInit(context)
      case 'prepare':
        return this.onPrepare()
      default:
        return
    }
  }

  onInit(context) {
    // Prepare internal state
    this.visible = false
    this.context = context
    console.log('context', context)

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
    this.render()
  }

  toggle() {
    this.visible = !this.visible
    document.body.classList.toggle('labjs-debugtools-visible')
  }

  render() {
    let contents
    if (!this.context.options.datastore) {
      contents = makeMessage('No data store found in component')
    } else {
      contents = 'foo'
    }

    this.container
      .querySelector('.labjs-debug-overlay-contents')
      .innerHTML = contents
  }
}
