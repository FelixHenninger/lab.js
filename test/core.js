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

    it('maps responses to event object')
    it('distributes response event handlers in document')

    it('calls internal event handlers', () => {
      callback_prepare = sinon.spy()
      b.on('prepare', callback_prepare)

      callback_run = sinon.spy()
      b.on('run', callback_run)

      callback_end = sinon.spy()
      b.on('end', callback_end)

      b.prepare()
      assert.ok(callback_prepare.calledOnce)

      b.run()
      assert.ok(callback_run.calledOnce)

      b.end()
      assert.ok(callback_end.calledOnce)
    })

    it('classifies correct responses as such', () => {
      // FIXME: There is a certain smell surrounding this,
      // and the author has the definite impression that
      // this cannot be the cleanest possible way of
      // handling responses. In particular, the automatic
      // binding of event handlers should be revisited,
      // as should the exact location of the response
      // recording and classification (i.e. should it
      // be placed in the commit method rather than the
      // event handlers?)
      // It might, at some point, also be worthwhile to
      // investigate multiple correct responses.

      // Define a response, and a correct response
      b.responses = {
        'keypress(b)': 'foo'
      }
      b.response_correct = 'foo'

      // Response wrappers are built only
      // during the prepare phase
      b.prepare()

      // Manually trigger a response event
      b.events['keypress(b)'].bind(b)()

      // Check the classification
      assert.equal(b.data.correct, true)

      // Check that the resulting status is ok
      assert.equal(b.data.ended_on, 'response')
    })

    it('classifies incorrect responses as such', () => {
      // Same as above
      b.responses = {
        'keypress(b)': 'foo'
      }
      b.response_correct = 'bar'
      b.prepare()
      b.events['keypress(b)'].bind(b)()

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
