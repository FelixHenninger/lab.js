// HTML-based displays for lab.js
import { extend, template } from 'lodash'
import { Component, status } from './core'
import { domSelect } from './util/domSelect'

// html.Screens display HTML when run
export class Screen extends Component {
  onPrepare() {
    return Promise.resolve().then(() => {
      // Fetch content from URL, if one is given
      if (this.options.contentUrl) {
        return fetch(this.options.contentUrl).then(
          response => response.text(),
        ).then(
          text => (this.options.content = text),
        ).catch(
          e => console.log('Error while loading content: ', e),
        )
      } else {
        return null
      }
    }).then(() => {
      // Post-process template by adding
      // placeholders through lodash.template
      this.options.content = template(this.options.content)(this.aggregateParameters)
    })
  }

  onRun() {
    // Insert specified content into element
    this.options.el.innerHTML = this.options.content
  }
}

Screen.metadata = {
  module: ['html'],
  nestedComponents: [],
}

// An html.Form can show, validate and serialize a form
export class Form extends Screen {
  constructor(options={}) {
    super(options)

    this.options = {
      validator: () => true,
      ...this.options,
    }

    // Capture form submissions
    this.options.events['submit form'] = (e) => {
      this.submit(e)
    }
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
      this.data = extend(
        this.data,
        this.serialize(),
      )

      // Bye!
      this.end('form submission')
    }

    // Prevent default form behavior
    return false
  }

  serialize() {
    // Search for forms within the element
    const forms = domSelect('form', this.options.el)

    // Prepare an empty output object
    const output = {}

    // Iterate over forms ...
    // (not that this slightly cumbersome detour
    // is necessary because NodeLists, unlike arrays,
    // do not support the forDach method)
    Array.prototype.forEach.call(forms, (form) => {
      // ... and elements within them
      Array.prototype.forEach.call(form.elements, (element) => {
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
                  Array.from(element.options)
                    .filter(option => option.selected)
                    .map(option => option.value)
                break
              // no default
            }
            break
          case 'button':
            switch (element.type) {
              case 'button':
              case 'submit':
              case 'reset':
                output[element.name] = element.value
                break
              default:
            }
            break
          default:
        } // outer switch
      }) // iterate across elements
    }) // iterate across forms

    return output
  }

  validate() {
    // Validate the form by applying the
    // form's validator to the serialized data,
    // and also checking that the browser
    // validation succeeds.
    const forms = domSelect('form', this.options.el)

    return this.options.validator(this.serialize()) &&
      Array.from(forms).every(form => form.checkValidity())
  }
}

Form.metadata = {
  module: ['html'],
  nestedComponents: [],
}

export class Frame extends Component {
  constructor(options={}) {
    super(options)
    this.options = {
      content: null,
      context: '',
      contextId: '',
      ...this.options,
    }
  }

  onPrepare() {
    // Parse context HTML
    const parser = new DOMParser()
    this.internals.parsedContext = parser.parseFromString(
      this.options.context, 'text/html',
    )

    // Setup nested component to use the context
    this.options.content.options.el = this.internals
      .parsedContext.getElementById(this.options.contextId)

    // Couple the run cycle of the frame to its content
    this.options.content.once('after:end', () => this.end())

    // Prepare content
    return this.options.content.prepare(false) // indicate automated call
  }

  onRun() {
    // Clear element content, and insert context
    this.options.el.innerHTML = ''
    Array.from(this.internals.parsedContext.body.children)
      .forEach(c => this.options.el.appendChild(c))

    // Run nested content
    return this.options.content.run()
  }

  onEnd() {
    if (this.options.content.status <= status.done) {
      // Avoid an infinite loop of
      // frame and content ending one another
      this.options.content.off('after:end')

      // Again, the content is in focus
      return this.options.content.end('abort by frame')
    } else {
      // If the content has already ended,
      // there is nothing left to do
      return Promise.resolve()
    }
  }
}

Frame.metadata = {
  module: ['html'],
  nestedComponents: ['content'],
}
