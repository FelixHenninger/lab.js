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
    this.idColumns = ['id', 'participant', 'participant_id']
  }

  // TODO: An alternative implementation might save the context
  // at preparation time, and make the filename and identifier
  // dynamic properties instead of methods.
  makeFilename(context) {
    const d = new Date()

    const id = this.extractIdentifier(context)
    const date =
      `${ d.getFullYear() }-` +
      `${ twoDigit((d.getMonth() + 1).toString()) }-` +
      `${ twoDigit(d.getDate().toString()) }--` +
      `${ d.toTimeString().split(' ')[0] }`

    return `${ this.filePrefix }--` +
      `${ id ? (id + '--') : '' }` +
      `${ date }.${ this.fileType }`
  }

  extractIdentifier(context) {
    if (context.options.datastore) {
      const ds = context.options.datastore

      // Check whether any of the columns is present in the data --
      // if so, return its value
      for (const c of this.idColumns) {
        if (Object.keys(ds.state).includes(c)) {
          return ds.state[c]
        }
      }

      // If no value was found, return undefined
      return undefined
    } else {
      // If not datastore is present, also return undefined
      return undefined
    }
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
          context.options.datastore.download(
            this.fileType, this.makeFilename(context)
          )
          window.removeEventListener('beforeunload', unloadHandler)
        },
      )
      context.options.el.prepend(this.el)
    }
  }
}
