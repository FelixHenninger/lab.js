/* global define, describe, it, beforeEach, afterEach, assert, sinon */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('HTML-based components', () => {

  // Inject a div in which DOM behavior is tested
  let demoElement
  beforeEach(() => {
    demoElement = document.createElement('div')
    demoElement.dataset.labjsSection = 'main'
    document.body.appendChild(demoElement)
  })

  afterEach(() => {
    document.body.removeChild(demoElement)
  })

  describe('Screen', () => {
    let h, el

    beforeEach(() => {
      el = document.createElement('div')
      h = new lab.html.Screen({
        content: '',
        el: el
      })
    })

    it('inserts HTML into the document', () => {
      h.options.content = '<strong>Hello World!</strong>'

      return h.run().then(() => {
        assert.equal(h.options.el.innerHTML, '<strong>Hello World!</strong>')
      })
    })

    it('retrieves content from URL if requested', () => {
      // Stub window.fetch to return a predefined response
      const content_response = new window.Response(
        'Inserted content', {
        status: 200,
        headers: {
          'Content-type': 'text/html',
        },
      })
      sinon.stub(window, 'fetch')
      window.fetch.returns(Promise.resolve(content_response))

      // Instruct screen to fetch content from url
      h.options.contentUrl = 'https://contrived.example/'

      return h.prepare().then(() => {
        assert.equal(
          h.options.content,
          'Inserted content'
        )
        assert.ok(
          window.fetch.withArgs(h.options.contentUrl).calledOnce
        )
        window.fetch.restore()
      })
    })

    it('fills template tags in the content using parameters', () => {
      h.options.content = 'Hello ${ parameters.place }!'
      h.options.parameters['place'] = 'World'

      return h.prepare().then(() => {
        assert.equal(h.options.content, 'Hello World!')
      })
    })

    it('accepts changes to parameters before preparation', () => {
      h.options.content = 'Hello ${ parameters.place }!'
      h.options.parameters['place'] = 'World'
      h.on('before:prepare', function() {
        this.options.parameters.place = 'Mars'
      })

      return h.run().then(() => {
        assert.equal(h.options.content, 'Hello Mars!')
      })
    })

    it('inserts parameters if content comes from external url', () => {
      // Stub window.fetch to return a predefined response
      const content_response = new window.Response(
        'Hello ${ parameters.place }!', {
        status: 200,
        headers: {
          'Content-type': 'text/html',
        },
      })
      sinon.stub(window, 'fetch').resolves(content_response)
      h.options.contentUrl = 'https://contrived.example/'

      h.options.parameters['place'] = 'Pluto'

      return h.prepare().then(() => {
        assert.equal(
          h.options.content,
          'Hello Pluto!'
        )
        window.fetch.restore()
      })
    })
  })

  describe('Form', () => {
    let f, el

    beforeEach(() => {
      el = document.createElement('div')
      f = new lab.html.Form({
        el: el
      })
    })

    it('serializes input[type="text"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="contents" value="text input">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'contents': 'text input'
      })
    })

    it('serializes input[type="number"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="number" name="contents" value="123">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'contents': '123'
      })
    })

    it('serializes input[type="hidden"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="hidden" name="contents" value="hidden input">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'contents': 'hidden input'
      })
    })

    it('serializes input[type="checkbox"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="checkbox" name="checked" value="" checked>' +
        '  <input type="checkbox" name="not_checked" value="">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'checked': true,
        'not_checked': false
      })
    })

    it('serializes input[type="radio"] fields', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="radio" name="radio_1" value="a">' +
        '  <input type="radio" name="radio_1" value="b" checked>' +
        '  <input type="radio" name="radio_1" value="c">' +
        '  <input type="radio" name="radio_2" value="a" checked>' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'radio_1': 'b',
        'radio_2': 'a'
      })
    })

    it('serializes textareas', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <textarea name="contents">' +
        '   text in textarea' +
        '  </textarea>' +
        '</form>'

      assert.equal(
        f.serialize().contents.trim(),
        'text in textarea'
      )
    })

    it('serializes select fields (exclusive ones)', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <select name="selection">' +
        '   <option value="option_1">Option 1</option>' +
        '   <option value="option_2" selected>Option 2</option>' +
        '   <option value="option_3">Option 3</option>' +
        '  </textarea>' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'selection': 'option_2'
      })
    })

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

      assert.deepEqual(f.serialize(), {
        'multiple_selection': ['option_2', 'option_4']
      })
    })

    const exampleForm = '' +
      '<form>' +
      '  <input type="text" name="text_input" value="text_input_contents">' +
      '  <button name="button" type="submit" value="value">Submit</button>' +
      '</form>'

    it('catches form submission', () => {
      // In this test, we are using an actual
      // document node because the virtual
      // elements used above do not deal correctly
      // with the click event used below.
      f.options.el = null
      f.options.content = exampleForm

      const spy = sinon.spy(f, 'submit')

      // Submit the form
      // (note that direct submission via form.submit()
      // overrides the event handlers and reloads
      // the page)
      return f.run().then(() => {
        f.options.el.querySelector('button').click()
        assert.ok(spy.calledOnce)

        // Clean up content
        f.options.el.innerHTML = ''
      })
    })

    it('polyfills form attribute on submit buttons', () => {
      // Test on the actual page, as above
      f.options.el = null
      f.options.content = '' +
        '<form id="test">' +
        '</form>' +
        '<button type="submit" form="test">Click me</button>'

      const spy = sinon.spy(f, 'submit')

      return f.run().then(() => {
        f.options.el.querySelector('button').click()
        assert.ok(spy.calledOnce)
        f.options.el.innerHTML = ''
      })
    })

    it('ends after successful submission', () => {
      f.options.content = exampleForm

      const spy = sinon.spy(f, 'end')

      return f.run().then(() => {
        f.submit()
        assert.equal(f.status, 3)
        assert.ok(spy.calledOnce)
      })
    })

    it('saves form data to store', () => {
      f.options.content = exampleForm

      return f.run().then(() => {
        f.submit()
        assert.equal(f.data.text_input, 'text_input_contents')
      })
    })

    // Validation --------------------------------------------------------------
    const minimalInvalidForm = '' +
      '<form>' +
      '  <input type="text" name="text_input" required>' +
      '</form>'

    it('validates form input using a validation function', () => {
      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="text_input" value="valid">' +
        '</form>'

      f.options.validator = data => data.text_input === 'valid'
      assert.ok(f.validate())

      f.options.validator = data => data.text_input === 'not_valid'
      assert.notOk(f.validate())
    })

    it('is also sensitive to native form validation', () => {
      f.options.el.innerHTML = minimalInvalidForm

      assert.notOk(f.validate())

      f.options.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="text_input" value="some_value" required>' +
        '</form>'

      assert.ok(f.validate())
    })

    it('doesn\'t end on submission if the form data is invalid', () => {
      f.options.content = minimalInvalidForm

      return f.run().then(() => {
        f.submit()
        assert.equal(f.status, 2) // Still running
      })
    })

    it('adds data-labjs-validated attribute after failed validation', () => {
      f.options.content = minimalInvalidForm

      return f.run().then(() => {
        f.submit()
        assert.equal(
          f.options.el.querySelector('form')
            .getAttribute('data-labjs-validated'),
          '',
        )
      })
    })
  })

  describe('Frame', () => {
    let el, c, f

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

    it('prepares its content', () => {
      const spy = sinon.spy(c, 'prepare')

      assert.notOk(spy.called)
      return f.prepare().then(() => {
        assert.ok(spy.calledOnce)
        // Call indicated automated preparation
        assert.ok(spy.calledWith(false))
      })
    })

    it('sets content element correctly', () =>
      f.prepare().then(() => {
        assert.equal(
          c.options.el,
          f.internals.parsedContext
            .documentElement.querySelector(f.options.contextSelector)
        )
      })
    )

    it('runs content when run', () => {
      const spy = sinon.spy(c, 'run')

      return f.run().then(() => {
        assert.ok(spy.calledOnce)
      })
    })

    it('frames content output', () => {
      c = new lab.html.Screen({
        content: 'Hello world!'
      })
      f.options.content = c
      f.options.context = '<strong id="mycontext"></strong>'
      f.options.contextSelector = '#mycontext'

      return f.run().then(() => {
        assert.equal(
          f.options.el.innerHTML,
          '<strong id="mycontext">Hello world!</strong>'
        )
      })
    })

    it('ends with content', () => {
      const spy = sinon.spy(f, 'end')

      return f.run().then(() => {
        assert.notOk(spy.called)
        return c.end()
      }).then(() => {
        assert.ok(spy.calledOnce)
      })
    })

    it('aborts running content when it ends', () => {
      const spy = sinon.spy(c, 'end')

      return f.run().then(() => {
        assert.notOk(spy.calledOnce)
        return f.end()
      }).then(() => {
        assert.ok(spy.calledOnce)
        assert.ok(spy.calledWith('abort by frame'))
      })
    })
  })
})

})
