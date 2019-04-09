import { uuid4 } from '../util/random'

const dataNotYetTransmitted = (e) => {
  const warning = 'Are you sure you want to close this window?'
  e.returnValue = warning
  return warning
}

export default class Transmit {
  constructor(options={}) {
    this.url = options.url
    this.metadata = options.metadata || {}
    this.metadata.id = this.metadata.id || uuid4()
    this.dataNotYetTransmitted = false;

    // Updates need to be disabled explicitly
    this.updates = {
      incremental: !(options.updates && options.updates.incremental === false),
      full: !(options.updates && options.updates.full === false),
    }
    this.callbacks = options.callbacks || {}
    this.headers = options.headers || {}
    this.encoding = options.encoding || 'json'
  }

  handle(context, event) {
    const url = this.url
    const metadata = this.metadata

    switch (event) {
      case 'prepare':
        if (this.updates.incremental) {
          // Set commit handler on data store
          // (inside the handler, this refers to the store)
          context.options.datastore.on('idle', function() {
            this.queueIncrementalTransmission(
              url,
              { ...metadata, payload: 'incremental' },
              { headers: this.headers, encoding: this.encoding }
            )
          })
        }
        // Trigger setup callback
        if (this.callbacks.setup) {
          this.callbacks.setup.call(this)
        }
        break
      case 'epilogue':
        if (this.updates.full) {
          this.transmitFull(context)
        }
        break
      default:
    }
  }

  setDataNotYetTransmitted(notTransmitted) {
    if (notTransmitted == this.dataNotYetTransmitted)
      return;

    if (notTransmitted)
      window.addEventListener('beforeunload', dataNotYetTransmitted)
    else
      window.removeEventListener('beforeunload', dataNotYetTransmitted)
    this.dataNotYetTransmitted = notTransmitted;
  }

  transmitFull(context) {

    const url = this.url
    const metadata = this.metadata

    this.setDataNotYetTransmitted(true)

    context.options.datastore
      .transmit(
        url,
        { ...metadata, payload: 'full' },
        { headers: this.headers, encoding: this.encoding }
      ).then(response => {
        if ( ! response.ok)
          throw response;
        this.clearFailure(context)
        this.setDataNotYetTransmitted(false)
        if (this.updates.incremental) {
          context.options.datastore.flushIncrementalTransmissionQueue()
        }
        return response
      }).then(
        this.callbacks.full
      ).catch(error => {
        this.reportFailure(context)
      })
  }

  reportFailure(context) {

    const RETRY = 'Retry'
    const RETRYING = 'Retrying ...'

    if ( ! this.el) {
      // Insert download popover
      this.el = document.createElement('div')
      this.el.className = 'popover'
      this.el.innerHTML = `
        <div class="alert text-center">
          Data upload failed <button>${ RETRY }</button>
        </div>
      `
      this.retryButton = this.el.querySelector('button')
      this.retryButton.addEventListener(
        'click',
        () => {
          this.transmitFull(context)
          this.retryButton.textContent = RETRYING
          this.retryButton.disabled = true;
        }
      )
      context.options.el.prepend(this.el)
    }
    else {
      this.retryButton.textContent = RETRY
      this.retryButton.disabled = false;
    }
  }

  clearFailure(context) {
    if (this.el) {
      context.options.el.removeChild(this.el);
    }
  }
}
