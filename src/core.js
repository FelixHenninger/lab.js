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

// Sequences and loops ------------------------------------

// Helper function to handle nested elements
let prepare_nested = function(nested, parent) {
  // Setup parent links on nested items
  nested.forEach(c => c.parent = parent)

  // Set ids on nested items
  nested.forEach((c, i) => {
    // For each child, use this element's id
    // and append a counter
    if (parent.id == null) {
      c.id = String(i)
    } else {
      c.id = [parent.id, i].join('_')
    }
  })

  // Pass on specified attributes
  nested.forEach(c => {
    parent.hand_me_downs.forEach(k => {
      c[k] = c[k] || parent[k]
    })
  })

  // Trigger prepare on all nested elements
  nested.forEach(c => c.prepare())
}

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

    // Shuffle content, if requested
    if (this.shuffle) {
      this.content = _.shuffle(this.content)
    }

    prepare_nested(this.content, this)
  }

  run() {
    // Run the sequence by stepping through the
    // content elements
    const promise = super.run()
    this.step()
    return promise
  }

  end(reason) {
    // End prematurely, if necessary
    if (this.currentPosition !== this.content.length) {
      const currentElement = this.content[this.currentPosition]

      // Don't continue stepping through content
      // FIXME: This should only remove
      // the stepper function, but no others
      currentElement.off('after:end')
      currentElement.end('abort by sequence')
    }
    super.end(reason)
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
      this.end('complete')
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

// A parallel element executes multiple
// other elements simultaneously
export class Parallel extends BaseElement {
  constructor(content, options={}) {
    super(options)

    // The content, in this case,
    // consists of an array of elements
    // that are run in parallel.
    this.content = content

    // Save options
    this.mode = options.mode || 'race'
    this.hand_me_downs = options.hand_me_downs || hand_me_downs
  }

  prepare() {
    super.prepare()
    prepare_nested(this.content, this)
  }

  run() {
    let promise = super.run()

    // Run all nested elements simultaneously
    this.promises = this.content.map(c => c.run())

    // End this element when all nested elements,
    // or a single element, have ended
    Promise[this.mode](this.promises)
      .then(() => this.end())

    return promise
  }

  end(reason) {
    // Cancel remaining running nested elements
    this.content.forEach(c => {
      if (c.status < status.done)
        c.end('abort by parallel')
    })

    super.end(reason)
  }
}

// Full-featured elements ---------------------------------
// HTMLScreens display HTML when run
export class HTMLScreen extends BaseElement {
  constructor(content, options={}) {
    super(options)
    this.content = content
  }

  run() {
    // Insert specified content into element
    this.el.innerHTML = this.content

    // Return promise from ancestor
    return super.run()
  }
}

// A FormScreen can show, validate and serialize a form
export class FormScreen extends HTMLScreen {
  constructor(content, options={}) {
    super(content, options)

    // Add a validator
    // (inactive by default)
    this.validator = options.validator || (() => true)

    // Capture form submissions
    this.events['submit form'] = this.submit
  }

  submit(e=null) {
    // Suppress default form behavior
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    // Only continue if the
    // form contents passes validation
    if (this.validate()) {
      // Add serialized form data to
      // the element's dataset
      this.data = _.extend(
        this.data,
        this.serialize()
      )

      // Bye!
      this.end('form submission')
    }

    // Prevent default form behavior
    return false
  }

  serialize() {
    // Search for forms within the element
    const forms = domSelect('form', this.el)

    // Prepare an empty output object
    const output = {}

    // Iterate over forms ...
    // (not that this slightly cumbersome detour
    // is necessary because NodeLists, unlike arrays,
    // do not support the forDach method)
    Array.prototype.forEach.call(forms, form => {
      // ... and elements within them
      Array.prototype.forEach.call(form.elements, element => {
        // Handle the element differently depending
        // on the tag type
        switch (element.nodeName.toLowerCase()) {
          case 'input':
            switch (element.type) {
              case 'checkbox':
                output[element.name] = element.checked
                break
              case 'radio':
                if (element.checked) {
                  output[element.name] = element.value
                }
                break
              // All other input types (e.g. text, hidden,
              // number, url, ... button, submit, reset)
              default:
                output[element.name] = element.value
                break
            }
            break
          case 'textarea':
            output[element.name] = element.value
            break
          case 'select':
            switch (element.type) {
              case 'select-one':
                output[element.name] = element.value
                break
              case 'select-multiple':
                // Again, working around limitations of NodeLists
                output[element.name] =
                  Array.prototype.slice.call(element.options)
                  .filter(option => option.selected)
                  .map(option => option.value)
                break
            }
            break
          case 'button':
            switch (element.type) {
              case 'button':
              case 'submit':
              case 'reset':
                output[element.name] = element.value
            }
            break
        } // outer switch
      }) // iterate across elements
    }) // iterate across forms

    return output
  }

  validate() {
    // Validate the form by applying the
    // form's validator to the serialized data
    return this.validator(
      this.serialize()
    )
  }
}
