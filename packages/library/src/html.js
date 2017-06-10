// HTML-based displays for lab.js
import { extend } from 'lodash'
import 'whatwg-fetch'

import { Component, status, handMeDowns } from './core'
import { prepareNested } from './flow'

// html.Screens display HTML when run
export class Screen extends Component {
  constructor(options) {
    super({
      content: null,
      contentUrl: null,
      ...options,
    })
  }

  onBeforePrepare() {
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
  parsableOptions: {
    content: ['string'],
  },
}

// An html.Form can show, validate and serialize a form
export class Form extends Screen {
  constructor(options={}) {
    super({
      validator: () => true,
      ...options,
    })

    // Capture form submissions
    this.options.events['submit form'] = e => this.submit(e)
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
    } else {
      // Mark form(s) as validated, but leave
      // the display unchanged otherwise
      // (an array conversion is needed here for IE
      // and older browsers, who do not implement
      // forEach on NodeLists)
      Array.from(this.options.el.querySelectorAll('form'))
        .forEach(f => f.setAttribute('data-labjs-validated', ''))
    }

    // Prevent default form behavior
    return false
  }

  serialize() {
    // Search for forms within the element
    const forms = this.options.el.querySelectorAll('form')

    // Prepare an empty output object
    const output = {}

    // Iterate over forms ...
    Array.from(forms).forEach((form) => {
      // ... and elements within them
      Array.from(form.elements).forEach((element) => {
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
    const forms = this.options.el.querySelectorAll('form')

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
    super({
      content: null,
      context: '',
      contextSelector: '',
      handMeDowns: [...handMeDowns],
      ...options,
    })
  }

  async onPrepare() {
    // Parse context HTML
    const parser = new DOMParser()
    this.internals.parsedContext = parser.parseFromString(
      this.options.context, 'text/html',
    )

    // Setup nested component to use the context
    this.options.content.options.el = this.internals
      .parsedContext.querySelector(this.options.contextSelector)

    // Couple the run cycle of the frame to its content
    this.internals.contentEndHandler = () => this.end()
    this.options.content.on(
      'after:end',
      this.internals.contentEndHandler,
    )

    // Prepare content
    await prepareNested([this.options.content], this)
  }

  async onRun() {
    // Clear element content, and insert context
    this.options.el.innerHTML = ''
    Array.from(this.internals.parsedContext.body.children)
      .forEach(c => this.options.el.appendChild(c))

    // Run nested content
    await this.options.content.run()
  }

  onEnd() {
    if (this.options.content.status < status.done) {
      // Avoid an infinite loop of
      // frame and content ending one another
      this.options.content.off(
        'after:end',
        this.internals.contentEndHandler,
      )

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
  parsableOptions: {
    context: ['string'],
  },
}
