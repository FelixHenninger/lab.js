describe('HTML-based elements', () => {

  describe('HTMLScreen', () => {
    let h, el

    beforeEach(() => {
      el = document.createElement('div')
      h = new lab.HTMLScreen('', {
        'el': el
      })
    })

    it('inserts HTML into the document', () => {
      h.content = '<strong>Hello World!</strong>'
      
      const p = h.wait_for('run').then(() => {
        assert.equal(h.el.innerHTML, '<strong>Hello World!</strong>')
      })

      h.run()
      return p
    })
  })

  describe('FormScreen', () => {
    let f, el

    beforeEach(() => {
      el = document.createElement('div')
      f = new lab.FormScreen('', {
        'el': el
      })
    })

    it('serializes input[type="text"] fields', () => {
      f.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="contents" value="text input">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'contents': 'text input'
      })
    })

    it('serializes input[type="number"] fields', () => {
      f.el.innerHTML = '' +
        '<form>' +
        '  <input type="number" name="contents" value="123">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'contents': '123'
      })
    })

    it('serializes input[type="hidden"] fields', () => {
      f.el.innerHTML = '' +
        '<form>' +
        '  <input type="hidden" name="contents" value="hidden input">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'contents': 'hidden input'
      })
    })

    it('serializes input[type="checkbox"] fields', () => {
      f.el.innerHTML = '' +
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
      f.el.innerHTML = '' +
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
      f.el.innerHTML = '' +
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
      f.el.innerHTML = '' +
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
      f.el.innerHTML = '' +
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

    it('serializes buttons', () => {
      f.el.innerHTML = '' +
        '<form>' +
        '  <button name="button" value="value">' +
        '</form>'

      assert.deepEqual(f.serialize(), {
        'button': 'value'
      })
    })

    it('reacts to form submission', () => {
      // In this test, we are using an actual
      // document node because the virtual
      // elements used above do not deal correctly
      // with the click event used below.
      f.el = null
      f.content = '' +
        '<form>' +
        '  <input type="text" name="text_input" value="text_input_contents">' +
        '  <button name="button" type="submit" value="value">Submit</button>' +
        '</form>'

      const callback = sinon.spy()
      f.on('end', callback)

      // Submit the form
      // (note that direct submission via form.submit()
      // overrides the event handlers and reloads
      // the page)
      f.wait_for('run').then(() => {
        f.el.querySelector('button').click()
      })

      const p = f.wait_for('end').then(() => {
        // Tests
        assert.ok(callback.calledOnce)
        assert.equal(f.data.text_input, 'text_input_contents')
        assert.equal(f.data.button, 'value')

        // Remove HTML content from the page
        // when we're done.
        f.el.innerHTML = ''
      })

      f.run()
      return p
    })

    it('validates form input correctly', () => {
      f.el.innerHTML = '' +
        '<form>' +
        '  <input type="text" name="text_input" value="valid">' +
        '</form>'

      f.validator = data => data.text_input == 'valid'
      assert.ok(f.validate())

      f.validator = data => data.text_input == 'not_valid'
      assert.notOk(f.validate())
    })
  })
})
