/* global define, describe, it, beforeEach, afterEach, assert, sinon */
/* eslint-disable import/no-amd */

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'define'.
define(['lab'], (lab: any) => {

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('HTML-based components', () => {

  // Inject a div in which DOM behavior is tested
  let demoElement: any
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    demoElement = document.createElement('div')
    demoElement.dataset.labjsSection = 'main'
    document.body.appendChild(demoElement)
  })

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    document.body.removeChild(demoElement)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Screen', () => {
    let h: any, el

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      el = document.createElement('div')
      h = new lab.html.Screen({
        content: '',
        el: el
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('inserts HTML into the document', () => {
      h.options.content = '<strong>Hello World!</strong>'

      return h.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(h.options.el.innerHTML, '<strong>Hello World!</strong>')
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('retrieves content from URL if requested', () => {
      // Stub window.fetch to return a predefined response
      const content_response = new window.Response(
        'Inserted content', {
        status: 200,
        headers: {
          'Content-type': 'text/html',
        },
      })
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      sinon.stub(window, 'fetch')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'returns' does not exist on type '((input... Remove this comment to see the full error message
      window.fetch.returns(Promise.resolve(content_response))

      // Instruct screen to fetch content from url
      h.options.contentUrl = 'https://contrived.example/'

      return h.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          h.options.content,
          'Inserted content'
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'withArgs' does not exist on type '((inpu... Remove this comment to see the full error message
          window.fetch.withArgs(h.options.contentUrl).calledOnce
        )
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '((input... Remove this comment to see the full error message
        window.fetch.restore()
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('fills template tags in the content using parameters', () => {
      h.options.content = 'Hello ${ parameters.place }!'
      h.options.parameters['place'] = 'World'

      return h.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(h.options.content, 'Hello World!')
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('accepts changes to parameters before preparation', () => {
      h.options.content = 'Hello ${ parameters.place }!'
      h.options.parameters['place'] = 'World'
      h.on('before:prepare', function() {
        // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        this.options.parameters.place = 'Mars'
      })

      return h.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(h.options.content, 'Hello Mars!')
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('inserts parameters if content comes from external url', () => {
      // Stub window.fetch to return a predefined response
      const content_response = new window.Response(
        'Hello ${ parameters.place }!', {
        status: 200,
        headers: {
          'Content-type': 'text/html',
        },
      })
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      sinon.stub(window, 'fetch').resolves(content_response)
      h.options.contentUrl = 'https://contrived.example/'

      h.options.parameters['place'] = 'Pluto'

      return h.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          h.options.content,
          'Hello Pluto!'
        )
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '((input... Remove this comment to see the full error message
        window.fetch.restore()
      })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Form', () => {
    let f: any, el

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      el = document.createElement('div')
      f = new lab.html.Form({
        el: el
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes input[type="text"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="contents" value="text input">' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(f.serialize(), {
        'contents': 'text input'
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes input[type="number"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="number" name="contents" value="123">' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(f.serialize(), {
        'contents': '123'
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes input[type="hidden"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="hidden" name="contents" value="hidden input">' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(f.serialize(), {
        'contents': 'hidden input'
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes input[type="checkbox"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="checkbox" name="checked" value="" checked>' +
        '  <input type="checkbox" name="not_checked" value="">' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(f.serialize(), {
        'checked': true,
        'not_checked': false
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes input[type="radio"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="radio" name="radio_1" value="a">' +
        '  <input type="radio" name="radio_1" value="b" checked>' +
        '  <input type="radio" name="radio_1" value="c">' +
        '  <input type="radio" name="radio_2" value="a" checked>' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(f.serialize(), {
        'radio_1': 'b',
        'radio_2': 'a'
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes textareas', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <textarea name="contents">' +
        '   text in textarea' +
        '  </textarea>' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.equal(
        f.serialize().contents.trim(),
        'text in textarea'
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes select fields (exclusive ones)', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <select name="selection">' +
        '   <option value="option_1">Option 1</option>' +
        '   <option value="option_2" selected>Option 2</option>' +
        '   <option value="option_3">Option 3</option>' +
        '  </textarea>' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(f.serialize(), {
        'selection': 'option_2'
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('serializes select fields (multiple selected)', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <select name="multiple_selection" multiple>' +
        '   <option value="option_1">Option 1</option>' +
        '   <option value="option_2" selected>Option 2</option>' +
        '   <option value="option_3">Option 3</option>' +
        '   <option value="option_4" selected>Option 4</option>' +
        '  </textarea>' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(f.serialize(), {
        'multiple_selection': ['option_2', 'option_4']
      })
    })

    const exampleForm = '' +
      '<form>' +
      '  <input type="text" name="text_input" value="text_input_contents">' +
      '  <button name="button" type="submit" value="value">Submit</button>' +
      '</form>'

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('catches form submission', () => {
      // In this test, we are using an actual
      // document node because the virtual
      // elements used above do not deal correctly
      // with the click event used below.
      f.options.el = null
      f.options.content = exampleForm

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(f, 'submit')

      // Submit the form
      // (note that direct submission via form.submit()
      // overrides the event handlers and reloads
      // the page)
      return f.run().then(() => {
        f.options.el.querySelector('button').click()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)

        // Clean up content
        f.options.el.innerHTML = ''
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('polyfills form attribute on submit buttons', () => {
      // Test on the actual page, as above
      f.options.el = null
      f.options.content = '' +
        '<form id="test">' +
        '</form>' +
        '<button type="submit" form="test">Click me</button>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(f, 'submit')

      return f.run().then(() => {
        f.options.el.querySelector('button').click()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
        f.options.el.innerHTML = ''
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can handle a form attribute within a form element', () => {
      // Test on the actual page, as above
      f.options.el = null
      f.options.content = '' +
        '<form id="test">' +
        '  <button type="submit" form="test">Click me</button>' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(f, 'submit')

      return f.run().then(() => {
        f.options.el.querySelector('button').click()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
        f.options.el.innerHTML = ''
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('ends after successful submission', () => {
      f.options.content = exampleForm

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(f, 'end')

      return f.run().then(() => {
        f.submit()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(f.status, 3)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('saves form data to store', () => {
      f.options.content = exampleForm

      return f.run().then(() => {
        f.submit()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(f.data.text_input, 'text_input_contents')
      })
    })

    // Validation --------------------------------------------------------------
    const minimalInvalidForm = '' +
      '<form>' +
      '  <input type="text" name="text_input" required>' +
      '</form>'

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('validates form input using a validation function', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="text_input" value="valid">' +
        '</form>'

      f.options.validator = (data: any) => data.text_input === 'valid'
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(f.validate())

      f.options.validator = (data: any) => data.text_input === 'not_valid'
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.notOk(f.validate())
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('is also sensitive to native form validation', () => {
      f.options.el.innerHTML = minimalInvalidForm

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.notOk(f.validate())

      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="text_input" value="some_value" required>' +
        '</form>'

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(f.validate())
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('doesn\'t end on submission if the form data is invalid', () => {
      f.options.content = minimalInvalidForm

      return f.run().then(() => {
        f.submit()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(f.status, 2) // Still running
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds data-labjs-validated attribute after failed validation', () => {
      f.options.content = minimalInvalidForm

      return f.run().then(() => {
        f.submit()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          f.options.el.querySelector('form')
            .getAttribute('data-labjs-validated'),
          '',
        )
      })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Frame', () => {
    let el, c: any, f: any

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      el = document.createElement('div')
      c = new lab.core.Component()
      f = new lab.html.Frame({
        el: el,
        content: c,
        context: '<div id="labjs-context"></div>',
        contextSelector: '#labjs-context'
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('prepares its content', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(c, 'prepare')

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.notOk(spy.called)
      return f.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
        // Call indicated automated preparation
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledWith(false))
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets content element correctly', () =>
      f.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.el,
          f.internals.parsedContext
            .documentElement.querySelector(f.options.contextSelector)
        )
      })
    )

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('runs content when run', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(c, 'run')

      return f.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('frames content output', () => {
      c = new lab.html.Screen({
        content: 'Hello world!'
      })
      f.options.content = c
      f.options.context = '<strong id="mycontext"></strong>'
      f.options.contextSelector = '#mycontext'

      return f.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          f.options.el.innerHTML,
          '<strong id="mycontext">Hello world!</strong>'
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('ends with content', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(f, 'end')

      return f.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(spy.called)
        return c.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('aborts running content when it ends', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(c, 'end')

      return f.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(spy.calledOnce)
        return f.end()
      }).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledWith('abort by frame'))
      })
    })
  })
})

})
