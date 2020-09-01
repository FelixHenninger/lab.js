const unloadHandler = (e: any) => {
  const warning = 'Are you sure you want to close this window?'
  e.returnValue = warning
  return warning
};

export default class Download {
  el: any;

  filePrefix: any;

  fileType: any;

  constructor({
    filePrefix,
    fileType
  }: any = {}) {
    this.el = null
    this.filePrefix = filePrefix || 'study'
    this.fileType = fileType || 'csv'
  }

  handle(context: any, event: any) {
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
          context.options.datastore.download(
            this.fileType,
            context.options.datastore.makeFilename(
              this.filePrefix,
              this.fileType,
            ),
          )
          window.removeEventListener('beforeunload', unloadHandler)
        },
      )
      context.options.el.prepend(this.el)
    }
  }
}
