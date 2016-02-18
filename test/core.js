describe('Core', () => {
  describe('BaseElement', () => {
    var b

    beforeEach(() => {
      b = new lab.BaseElement({})
    })

    it('loads', () => {
      b.prepare()
      b.run()
    })

    it('times out if requested', () => {
      // Setup fake timers
      this.clock = sinon.useFakeTimers()

      // Set the timeout to 500ms
      b.timeout = 500
      b.prepare()

      // Setup a callback to be run
      // when the element ends
      var callback = sinon.spy()
      b.on('end', callback)

      // Run the element
      b.run()

      // Check that the callback is only
      // called after the specified interval
      // has passed
      assert.notOk(callback.called)
      this.clock.tick(500)
      assert.ok(callback.calledOnce)

      // Check that the resulting status is ok
      assert.equal(b.data.ended_on, 'timeout')

      // Restore timers
      this.clock.restore()
    })

    it('resolves promise when running', () => {
      b.prepare()
      var p = b.run().then(() => {
        assert.ok(true)
      })
      b.end()
      return p
    })

    it('runs event handlers in response to DOM events', () => {
      b.el = document.querySelector('div#experiment')

      // Bind a handler to clicks within the document
      var handler = sinon.spy()
      b.events = {
        'click': handler
      }

      // Run the element
      b.prepare()
      var p = b.run()
      assert.notOk(handler.calledOnce)

      // Simulate click
      b.el.click()

      // End the element so that the result
      // can be checked
      b.end()

      // Make sure the handler is called
      return p.then(() => {
        assert.ok(handler.calledOnce)
      })
    })

    it('runs event handlers in response to specific events/emitters', () => {
      b.el = document.querySelector('div#experiment')

      // Simulate two buttons
      b.el.innerHTML = ' \
        <button id="btn-a">Button A</button> \
        <button id="btn-b">Button B</button>'

      // Create two handlers that are triggered
      // when the buttons are pressed
      handler_a = sinon.spy()
      handler_b = sinon.spy()

      b.events = {
        'click button#btn-a': handler_a,
        'click button#btn-b': handler_b,
      }

      // Simulate clicking both buttons in sequence,
      // and ensure that the associated handlers are triggered
      b.prepare()
      b.run()

      b.el.querySelector('button#btn-a').click()
      assert.ok(handler_a.calledOnce)
      assert.notOk(handler_b.called)

      b.el.querySelector('button#btn-b').click()
      assert.ok(handler_a.calledOnce)
      assert.ok(handler_b.calledOnce)

      b.end()

      // Clean up
      b.el.innerHTML = ''
    })

    it('binds event handlers to element', () => {
      b.el = document.querySelector('div#experiment')

      var handler_context

      // Define a click handler
      // (note that this is a 'regular' function,
      // not an arrow function, which would not be
      // bound to the element)
      b.events = {
        'click': function() {
          handler_context = this
        }
      }

      // Prepare and run element
      b.prepare()
      var p = b.run()

      // Simulate click, triggering handler
      b.el.click()

      // End element and check result
      b.end()
      return p.then(() => {
        assert.equal(handler_context, b)
      })
    })

    it('calls internal event handlers', () => {
      callback_prepare = sinon.spy()
      b.on('prepare', callback_prepare)

      callback_run = sinon.spy()
      b.on('run', callback_run)

      callback_end = sinon.spy()
      b.on('end', callback_end)

      // Check whether internal event handlers
      // are called at the appropriate times
      b.prepare()
      assert.ok(callback_prepare.calledOnce)
      assert.notOk(callback_run.called)
      assert.notOk(callback_end.called)

      b.run()
      assert.ok(callback_prepare.calledOnce)
      assert.ok(callback_run.calledOnce)
      assert.notOk(callback_end.called)

      b.end()
      assert.ok(callback_prepare.calledOnce)
      assert.ok(callback_run.calledOnce)
      assert.ok(callback_end.calledOnce)
    })

    it('maps responses onto event handlers', () => {
      b.el = document.querySelector('div#experiment')
      b.responses = {
        'click': 'response_keypress'
      }

      // Attach a spy to the respond method
      let spy = sinon.spy(b, 'respond')

      // Run the element
      b.prepare()
      b.run()

      // Test whether the click triggers
      // a respond method call
      assert.notOk(spy.called)
      b.el.click()
      assert.ok(spy.withArgs('response_keypress').calledOnce)
      assert.ok(spy.calledOnce)

      // Cleanup
      b.end()
    })

    it('classifies correct responses as such', () => {
      // Define a correct response
      b.response_correct = 'foo'

      // Prepare the element
      b.prepare()

      // Trigger a response
      b.respond('foo')

      // Check the classification
      assert.equal(b.data.correct, true)

      // Check that the resulting status is ok
      assert.equal(b.data.ended_on, 'response')
    })

    it('classifies incorrect responses as such', () => {
      // Same as above
      b.response_correct = 'foo'
      b.prepare()
      b.respond('bar')

      // Check classification
      assert.equal(b.data.correct, false)

      // Check that the resulting status is ok
      assert.equal(b.data.ended_on, 'response')
    })

    it('commits data if datastore is provided', () => {
      b.datastore = new lab.DataStore()
      b.data['foo'] = 'bar'
      b.commit()

      assert.equal(b.datastore.state.foo, 'bar')
    })
  })
})
