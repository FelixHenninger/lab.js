import { cloneDeep } from 'lodash'

import { Screen, ScreenOptions } from './screen'
import { serialize } from './util/form'

// An html.Form can show, validate and serialize a form

const formDefaults = {
  validator: <(data: object) => boolean>(() => true),
}

export type FormOptions = ScreenOptions & typeof formDefaults

export class Form extends Screen {
  declare options: FormOptions

  constructor(options: Partial<FormOptions> = {}) {
    super({
      ...cloneDeep(formDefaults),
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
    this.options.events['click button[type="submit"]'] = e => {
      // If the button references another form...
      if ((<HTMLButtonElement>e.target).getAttribute('form')) {
        // ... find it and ...
        const targetForm = this.internals.context.el.querySelector(
          `form#${(<HTMLButtonElement>e.target).getAttribute('form')}`,
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
    const focus = this.internals.context.el.querySelector('[autofocus]')
    if (focus) {
      focus.focus()
    }
  }

  submit(e?: Event) {
    // Suppress default form behavior
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    // Only continue if the
    // form contents passes validation
    if (this.validate()) {
      // Add serialized form data to
      // the element's dataset
      Object.assign(this.data, this.serialize())

      // Bye!
      this.end('form submission')
    } else {
      // Mark form(s) as validated, but leave
      // the display unchanged otherwise
      // (an array conversion is needed here for IE
      // and older browsers, who do not implement
      // forEach on NodeLists)
      (
        Array.from(
          this.internals.context.el.querySelectorAll('form'),
        ) 
      ).forEach(f => f.setAttribute('data-labjs-validated', ''))
    }

    // Prevent default form behavior
    return false
  }

  serialize() {
    // Search for forms within the element
    return serialize(this.internals.context.el.querySelectorAll('form'))
  }

  validate() {
    // Validate the form by applying the
    // form's validator to the serialized data,
    // and also checking that the browser
    // validation succeeds.
    const forms = <HTMLFormElement[]>(
      this.internals.context.el.querySelectorAll('form')
    )

    return (
      this.options.validator(this.serialize()) &&
      Array.from(forms).every(form => form.checkValidity())
    )
  }
}

Form.metadata = {
  module: ['html'],
  nestedComponents: [],
}
