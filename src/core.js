// Version
export const version = '2015'

// Define status codes
const status = Object.freeze({
  initialized:  0,
  prepared:     1,
  running:      2,
  done:         3
})

// Generic building block for experiment
export class BaseElement extends EventHandler {
  constructor(options={}) {
    // Construct the EventHandler first
    super(options)

    // Setup a document node within which
    // the element operates
    this.el = options.el || null

    // Save the type of element as well as
    // its position in the hierarchy
    this.title = options.title || null
    this.element_type = this.constructor.name
    this.id = options.id || null

    // Save element status
    this.status = status.initialized

    // Setup responses
    this.responses = options.responses || {}
    this.response_correct = options.response_correct || null

    // Setup data handling
    this.data = options.data || {}
    this.datastore = options.datastore || null
    this.datacommit = options.datacommit || null

    // Setup media handling
    this.media = options.media || {}
    this.media.images = this.media.images || []
    this.media.audio = this.media.audio || []

    // Set a timeout, if a useful value is provided
    // (this somewhat convoluted query is necessary
    // because a zero value evaluates to false in JS)
    this.timeout = options.timeout || options.timeout === 0 ?
      options.timeout : null

    // Setup console output grouping
    // when the element is run
    if (this.debug) {
      this.on('before:run', () => console.group(this.element_type))
      this.on('after:end', () => console.groupEnd())
    }
  }

  // Actions ----------------------------------------------
  prepare() {
    // Prepare an element prior to its display,
    // for example by pre-loading or pre-rendering
    // content

    // Setup automatic event handling for responses
    Object.keys(this.responses).forEach(
      eventString => {
        this.events[eventString] = function(e) {
          // Save response
          this.data.response = this.responses[eventString]

          // Save ideal response and response veracity
          if (this.response_correct !== null) {
            this.data.response_correct = this.response_correct
            this.data.correct =
              this.data.response === this.response_correct
          }

          // End screen
          this.end('response')
        }
      }
    )

    // Prepare timeout
    if (this.timeout !== null) {
      // By default, the timeout is not met
      this.data.timed_out = false
      // Add a timeout to end the element
      // automatically after the specified
      // duration.
      this.on('run', () => {
        this.timeoutTimer = window.setTimeout(
          () => {
            this.end('timeout')
          },
          this.timeout
        )
      })
    }

    // Setup data storage
    // (unless it has been explicitly disabled)
    if (this.datastore && this.datacommit !== false) {
      this.datacommit = true
      this.on('after:end', this.commit)
    }

    // Preload media
    // FIXME: This is asynchronous at present,
    // meaning that the experiment will not wait until
    // all media are fully loaded.
    Promise.all( this.media.images.map(preload_image) )
    Promise.all( this.media.audio.map(preload_audio) )

    // Trigger related methods
    this.triggerMethod('prepare')

    // Update status
    this.status = status.prepared
  }

  run() {
    this.triggerMethod('before:run')

    // Update status
    this.status = status.running

    // Note the time
    this.data.time_run = performance.now()

    // Run an element by showing it
    this.triggerMethod('run')

    // Return a promise that is resolved after
    // the element has been run
    return new Promise((resolve, reject) => {
      this.on('end', resolve)
    })
  }

  end(reason=null) {
    // Note the time of and reason for ending
    this.data.time_end = performance.now()
    this.data.ended_on = reason

    // Update status
    this.status = status.done

    // Cancel the timeout timer
    if (this.timeout !== null) {
      window.clearTimeout(this.timeoutTimer)
    }

    // Complete an element's run and cleanup
    this.triggerMethod('end')

    // A final goodbye once everything is done
    // TODO: This won't work when an element
    // in a sequence is cancelled.
    this.triggerMethod('after:end')
  }

  // Data collection --------------------------------------
  // (the commit method is called automatically if the
  // datacommit option is true, which it is by default)
  commit() {
    // If a data store is defined
    if (this.datastore) {
      // Commit the data collected by this element
      this.datastore.commit(
        // ... plus some additional metadata
        _.extend(this.data, {
          duration: this.data.time_end - this.data.time_run,
          sender: this.title,
          sender_type: this.element_type,
          sender_id: this.id,
          time_commit: performance.now(),
          timestamp: new Date().toISOString()
        })
      )
    }
  }

}

// Default options ----------------------------------------
// Attributes to pass on to nested items (as names)
export let hand_me_downs = [
  'debug',
  'datastore',
  'el'
]

// Simple elements ----------------------------------------
// A DummyElement does nothing and ends
// immediately as soon as it is called
export class DummyElement extends BaseElement {
  constructor(options={}) {
    options.timeout = options.timeout || 0;
    super(options)
  }
}
