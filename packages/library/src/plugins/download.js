const unloadHandler = (e) => {
  const warning = 'Are you sure you want to close this window?'
  e.returnValue = warning
  return warning
}

export default class Download {
  constructor() {
    this.el = null
  }

  handle(context, event) {
    if (event === 'end' && context.options.datastore) {
      // Make sure the window isn't accidentally closed
      window.addEventListener('beforeunload', unloadHandler)

      // Insert download popover
      this.el = document.createElement('div')
      this.el.className = 'popover'
      this.el.innerHTML = `
        <div class="alert text-center">
          <strong>Download data</strong>
        </div>
      `
      this.el.addEventListener(
        'click',
        () => {
          context.options.datastore.download()
          window.removeEventListener('beforeunload', unloadHandler)
        },
      )
      context.options.el.prepend(this.el)
    }
  }
}
