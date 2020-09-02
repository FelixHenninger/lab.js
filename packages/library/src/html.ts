// HTML-based displays for lab.js
import { Component, status } from './core'
import { prepareNested } from './flow'

import { makePage } from './util/page'

// html.Screens display HTML when run
export class Screen extends Component {
  static metadata = {
    module: ['html'],
    nestedComponents: [],
    parsableOptions: {
      content: {},
    },
  }

  constructor(options: any) {
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
        return fetch(this.options.contentUrl)
          .then((response) => response.text())
          .then((text) => (this.options.content = text))
          .catch((e) => console.log('Error while loading content: ', e))
      }
      return null
    })
  }

  onRun() {
    // Insert specified content into element
    this.options.el.innerHTML = this.options.content
  }
}

// An html.Form can show, validate and serialize a form
// @ts-expect-error ts-migrate(2417) FIXME: Property 'parsableOptions' is missing in type '{ m... Remove this comment to see the full error message
export class Form extends Screen {
  static metadata = {
    module: ['html'],
    nestedComponents: [],
  }

  constructor(options = {}) {
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
    this.options.events['click button[type="submit"]'] = (e: any) => {
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
    this.options.events['submit form'] = (e: any) => this.submit(e)
  }

  onRun() {
    super.onRun()

    // Emulate form field autofocus
    const focus = this.options.el.querySelector('[autofocus]')
    if (focus) {
      focus.focus()
    }
  }

  submit(e = null) {
    // Suppress default form behavior
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (e && e.preventDefault) {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      e.preventDefault()
    }

    // Only continue if the
    // form contents passes validation
    if (this.validate()) {
      // Add serialized form data to
      // the element's dataset
      
      Object.assign(this.data, this.serialize())

      // Bye!
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '"form submission"' is not assign... Remove this comment to see the full error message
      this.end('form submission')
    } else {
      // Mark form(s) as validated, but leave
      // the display unchanged otherwise
      // (an array conversion is needed here for IE
      // and older browsers, who do not implement
      // forEach on NodeLists)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
      Array.from(this.options.el.querySelectorAll('form')).forEach((f: any) =>
        f.setAttribute('data-labjs-validated', ''),
      )
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
    Array.from(forms).forEach((form: any) => {
      // ... and elements within them
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
      Array.from(form.elements).forEach((element: any) => {
        // Handle the element differently depending
        // on the tag type
        switch (element.nodeName.toLowerCase()) {
          case 'input':
            switch (element.type) {
              case 'checkbox':
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                output[element.name] = element.checked
                break
              case 'radio':
                if (element.checked) {
                  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  output[element.name] = element.value
                }
                break
              // All other input types (e.g. text, hidden,
              // number, url, ... button, submit, reset)
              default:
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                output[element.name] = element.value
                break
            }
            break
          case 'textarea':
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            output[element.name] = element.value
            break
          case 'select':
            switch (element.type) {
              case 'select-one':
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                output[element.name] = element.value
                break
              case 'select-multiple':
                // Again, working around limitations of NodeLists
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                output[element.name] =
                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
                  Array.from(element.options)
                    .filter((option: any) => option.selected)
                    .map((option: any) => option.value)
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

    return (
      this.options.validator(this.serialize()) &&
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
      Array.from(forms).every((form: any) => form.checkValidity())
    )
  }
}

export class Frame extends Component {
  static metadata = {
    module: ['html'],
    nestedComponents: ['content'],
    parsableOptions: {
      context: {},
    },
  }

  constructor(options = {}) {
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
      this.options.context,
      'text/html',
    )

    // Setup nested component to operate within
    // the element addressed by the selector
    this.options.content.options.el = this.internals.parsedContext.querySelector(
      this.options.contextSelector,
    )

    // Couple the run cycle of the frame to its content
    this.internals.contentEndHandler = () => this.end()
    this.options.content.on('after:end', this.internals.contentEndHandler)

    // Prepare content
    await prepareNested([this.options.content], this)
  }

  async onRun(frameTimestamp: any, frameSynced: any) {
    // Clear element content, and insert context
    this.options.el.innerHTML = ''
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
    Array.from(this.internals.parsedContext.body.children).forEach((c: any) =>
      this.options.el.appendChild(c),
    )

    // Run nested content (synced to animation frame)
    await this.options.content.run(frameTimestamp, frameSynced)
    // TODO: It might be useful to make the framesync
    // optional for slow components (see canvas.Frame).
  }

  onEnd() {
    if (this.options.content.status < status.done) {
      // Avoid an infinite loop of
      // frame and content ending one another
      this.options.content.off('after:end', this.internals.contentEndHandler)

      // Again, the content is in focus
      return this.options.content.end('abort by frame')
    }
    // If the content has already ended,
    // there is nothing left to do

    return Promise.resolve()
  }
}

export class Page extends Form {
  static metadata = {
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
                content: { '*': 'string' },
              },
            },
          },
        },
      },
    },
  }

  onPrepare() {
    this.options.content = makePage(this.options.items, {
      submitButtonText: this.options.submitButtonText,
      submitButtonPosition: this.options.submitButtonPosition,
      width: this.options.width,
      rng: this.random,
    })
  }
}
