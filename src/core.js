// Version
export const version = '2015'

// Generic building block for experiment
export class BaseElement extends EventHandler {
  constructor(options={}) {
    super(options)

    // Setup a document node within which
    // the element operates
    this.el = options.el || null

    // Save the type of element as well as
    // its position in the hierarchy
    this.title = options.title || null
    this.element_type = this.constructor.name
    this.id = options.id || null

    // Setup responses
    this.responses = options.responses || {}

    // Setup data handling
    this.data = options.data || {}
    this.datastore = options.datastore || null
    this.datacommit = options.datacommit || null

    // Set a timeout, if a useful value is provided
    // (this somewhat convoluted query is necessary
    // because a zero value evaluates to false in JS)
    this.timeout = options.timeout || options.timeout === 0 ?
      options.timeout : null

    if (this.timeout !== null) {
      // By default, the timeout is not met
      this.data.timed_out = false
      // Add a timeout to end the element
      // automatically after the specified
      // duration.
      this.on('run', () => {
        this.timeoutTimer = window.setTimeout(
          () => {
            this.data.timed_out = true
            this.end()
          },
          this.timeout
        )
      })
    }

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
      (eventString) => {
        this.events[eventString] = function(e) {
          this.data.response = this.responses[eventString]
          this.end()
        }
      }
    )

    // Setup data storage
    // (unless it has been explicitly disabled)
    if (this.datastore && this.datacommit !== false) {
      this.datacommit = true
      this.on('after:end', this.commit)
    }

    // Trigger related methods
    this.triggerMethod('prepare')
  }

  run() {
    this.triggerMethod('before:run')

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

  end() {
    // Note the time
    this.data.time_end = performance.now()

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

// Sequences and loops ------------------------------------
// A sequence combines an array of other
// elements and runs them sequentially
export class Sequence extends BaseElement {
  constructor(content, options={}) {
    super(options)

    // Define an array of nested elements to
    // iterate over
    this.content = content;

    // Define a position in the array to begin
    // (note that this is incremented before
    // running the first nested element)
    this.currentPosition = -1;

    // Shuffle items, if so desired
    this.shuffle = options.shuffle || false

    // Use default hand-me-downs
    // unless directed otherwise
    this.hand_me_downs = options.hand_me_downs || hand_me_downs
  }

  prepare() {
    super.prepare()

    // Setup parent links on nested items
    this.content.forEach(c => c.parent = this)

    // Shuffle content, if requested
    if (this.shuffle) {
      this.content = _.shuffle(this.content)
    }

    // Set ids on nested items
    this.content.forEach((c, i) => {
      // For each child, use this element's id
      // and append a counter
      if (this.id == null) {
        c.id = i
      } else {
        c.id = [this.id, i].join('_')
      }
    })

    // Pass on specified attributes
    this.content.forEach(c => {
      this.hand_me_downs.forEach(k => {
        c[k] = c[k] || this[k]
      })
    })

    // A sequence is prepared by preparing all
    // the nested elements
    this.content.forEach(c => c.prepare())
  }

  run() {
    // Run the sequence by stepping through the
    // content elements
    super.run()
    this.step()
  }

  end() {
    // End prematurely, if necessary
    if (this.currentPosition !== this.content.length) {
      let currentElement = this.content[this.currentPosition]

      // Don't continue stepping through content
      // FIXME: This should only remove
      // the stepper function, but no others
      currentElement.off('after:end')
      currentElement.end()
    }
    super.end()
  }

  step(increment=+1, keep_going=true) {
    // The step method is unique to sequences,
    // and defines how the next content element
    // is chosen and shown.
    this.triggerMethod('step')

    // Increment the current position
    this.currentPosition += increment

    // If there ist still content yet to be shown,
    // show it while waiting for it to complete,
    // otherwise we are done here.
    if (this.currentPosition !== this.content.length) {
      this.currentElement = this.content[this.currentPosition]

      if (keep_going) {
        // FIXME: Awful function name!
        this.currentElementStepper = () => this.step()
        this.currentElement.once('after:end', this.currentElementStepper)
      }

      this.currentElement.run()
    } else {
      this.currentElement = null
      this.end()
    }
  }
}

// A loop functions exactly like a sequence,
// except that the elements in the loop are
// generated upon initialization from a
// factory function and a data collection.
// Technically, the content is generated by
// mapping the data onto the factory function.
export class Loop extends Sequence {
  constructor(element_factory, data=[], options={}) {
    // Generate the content by applying
    // the element_factory function to each
    // entry in the data array
    content = data.map(element_factory)

    // Otherwise, behave exactly
    // as a sequence would
    super(content, options)
  }
}

// Full-featured elements ---------------------------------
// View elements display HTML when run
export class HTMLScreen extends BaseElement {
  constructor(content, options={}) {
    super(options)
    this.content = content
  }
  run() {
    super.run()
    // Insert specified content into element
    this.el.innerHTML = this.content
  }
}
