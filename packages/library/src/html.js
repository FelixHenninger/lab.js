// HTML-based displays for lab.js
import { Component, status } from './core'
import { prepareNested } from './flow'

import { makePage } from './util/page'

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
    content: {},
  },
}

// An html.Form can show, validate and serialize a form
export class Form extends Screen {
  constructor(options={}) {
    super({
      validator: () => true,
      scrollTop: true,
      ...options,
    })

    // Polyfill the form attribute for IE11 and Edge
    // (the click is sufficient here, because of the
    // specification of implicit submissions in HTML5,
    // see https://www.w3.org/TR/html5/single-page.html#implicit-submission)
    // Note that this is not perfect -- in modern browsers,
    // the type attribute is not required for submission;
    // but it will help push users toward standard-conformant
    // behavior so that the polyfill can be removed safely
    // at some point in the future.
    this.options.events['click button[type="submit"]'] = (e) => {
      // If the button references another form...
      if (e.target.getAttribute('form')) {
        // ... find it and ...
        const targetForm = this.options.el.querySelector(
          `form#${ e.target.getAttribute('form') }`,
        )

        // ... submit that form instead
        // (this overrides the page structure, as per standard)
        if (targetForm) {
          // This submission method simulates a button click
          // because a direct submission would not trigger handlers
          e.preventDefault()
          e.stopPropagation()
          const submit = document.createElement('input')
          submit.type = 'submit'
          submit.style.display = 'none'
          targetForm.appendChild(submit)
          submit.click()
          targetForm.removeChild(submit)
          return false
        }
      }

      // Otherwise stick to default behavior
      return true
    }

    // Capture form submissions
    this.options.events['submit form'] = e => this.submit(e)
  }

  onRun() {
    super.onRun()

    // Emulate form field autofocus
    const focus = this.options.el.querySelector('[autofocus]')
    if (focus) {
      focus.focus()
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
      Object.assign(
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
      ...options,
    })
  }

  async onPrepare() {
    // Parse context HTML
    const parser = new DOMParser()
    this.internals.parsedContext = parser.parseFromString(
      this.options.context, 'text/html',
    )

    // Setup nested component to operate within
    // the element addressed by the selector
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

  async onRun(frameTimestamp, frameSynced) {
    // Clear element content, and insert context
    this.options.el.innerHTML = ''
    Array.from(this.internals.parsedContext.body.children)
      .forEach(c => this.options.el.appendChild(c))

    // Run nested content (synced to animation frame)
    await this.options.content.run(frameTimestamp, frameSynced)
    // TODO: It might be useful to make the framesync
    // optional for slow components (see canvas.Frame).
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
    context: {},
  },
}

export class Page extends Form {
  onPrepare() {
    this.options.content = makePage(this.options.items, {
      submitButtonText: this.options.submitButtonText,
      submitButtonPosition: this.options.submitButtonPosition,
      width: this.options.width,
    })
  }
}

Page.metadata = {
  module: ['html'],
  nestedComponents: [],
  parsableOptions: {
    items: {
      type: 'array',
      content: {
        type: 'object',
        content: {
          '*': 'string',
          attributes: {
            type: 'object',
            content: { '*': 'string' },
          },
          options: {
            type: 'array',
            content: {
              type: 'object',
              content: { '*': 'string' }
            },
          },
        },
      },
    },
  },
}
