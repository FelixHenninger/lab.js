// HTML-based displays for lab.js
import { Component } from './core'
import { domSelect } from './util/dom'
import { extend, template } from 'lodash-es'
import deprecation from './util/deprecation'

// HTMLScreens display HTML when run
export class Screen extends Component {
  constructor(options={}) {
    // Deprecate multiple arguments in constructor
    options = deprecation.multiArgumentConstructor(
      options, arguments, ['content'], 'HTMLScreen'
    )

    super(options)
    this.content = options.content
    this.contentUrl = options.contentUrl
  }

  prepare(directCall) {
    return Promise.resolve().then(() => {
      // Fetch content from URL, if one is given
      if (this.contentUrl) {
        return fetch(this.contentUrl).then(
          response => response.text()
        ).then(
          text => (this.content = text)
        ).catch(
          e => console.log('Error while loading content: ', e)
        )
      } else {
        return null
      }
    }).then(() => {
      // Post-process template by adding
      // placeholders through lodash.template
      this.content = template(this.content)(this.aggregateParameters)
      return
    }).then(
      // Continue preparation
      () => super.prepare(directCall)
    )
  }

  onRun() {
    // Insert specified content into element
    this.el.innerHTML = this.content
  }
}

Screen.module = ['html']

// A FormScreen can show, validate and serialize a form
export class Form extends Screen {
  constructor(options={}) {
    // Deprecate multiple arguments in constructor
    options = deprecation.multiArgumentConstructor(
      options, arguments, ['content'], 'FormScreen'
    )

    super(options)

    // Add a validator
    // (inactive by default)
    this.validator = options.validator || (() => true)

    // Capture form submissions
    this.events['submit form'] = (e) => {
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
    const forms = domSelect('form', this.el)

    return this.validator(this.serialize()) &&
      Array.from(forms).every(form => form.checkValidity())
  }
}

Form.module = ['html']
