import { padStart } from 'lodash'

// TODO: Replace lodash function with
// String.prototype.padStart as soon as
// browser compatibility allows.
const twoDigit = x => padStart(x, 2, '0')

const unloadHandler = (e) => {
  const warning = 'Are you sure you want to close this window?'
  e.returnValue = warning
  return warning
}

export default class Download {
  constructor({ filePrefix, fileType }) {
    this.el = null
    this.filePrefix = filePrefix || 'study'
    this.fileType = fileType || 'csv'
  }

  get filename() {
    const d = new Date()

    const date =
      `${ d.getFullYear() }-` +
      `${ twoDigit((d.getMonth() + 1).toString()) }-` +
      `${ twoDigit(d.getDate().toString()) }--` +
      `${ d.toTimeString().split(' ')[0] }`

    return `${ this.filePrefix }-${ date }.${ this.fileType }`
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
          context.options.datastore.download(this.fileType, this.filename)
          window.removeEventListener('beforeunload', unloadHandler)
        },
      )
      context.options.el.prepend(this.el)
    }
  }
}
