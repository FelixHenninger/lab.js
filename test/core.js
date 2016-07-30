describe('Core', () => {
  describe('Component', () => {
    let b

    beforeEach(() => {
      b = new lab.core.Component()
    })

    it('loads', () => {
      b.prepare()
      b.run()
    })

    describe('Preparation', () => {
      it('skips automated preparation when tardy option is set', () => {
        // Set tardy option: No automated preparation
        b.tardy = true

        // Prepare callback to check whether preparation is run
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Prepare item (indicate non-direct call)
        return b.prepare(false).then(() => {
          assert.notOk(callback.called)
        })
      })

      it('responds to manual preparation when tardy option is set', () => {
        // Set tardy option: No automated preparation
        b.tardy = true

        // Prepare callback to check whether preparation is run
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Prepare item (via direct call)
        return b.prepare().then(() => {
          assert.ok(callback.calledOnce)
        })
      })

      it('calls prepare method automatically when running unprepared', () => {
        const callback = sinon.spy()
        b.on('prepare', callback)

        b.run().then(() => {
          assert.ok(callback.calledOnce)
        })
      })

      it('calls prepare method automatically on run, even with tardy option', () => {
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Set tardy option
        b.tardy = true
        b.run().then(() => {
          assert.ok(callback.calledOnce)
        })
      })

      it('does not call prepare on a previously prepared item when run', () => {
        const callback = sinon.spy()

        // Prepare item beforehand
        return b.prepare().then(() => {
          // Run item
          b.on('prepare', callback)
          const p = b.run()
          b.end()
          return p
        }).then(() => {
          assert.notOk(callback.called)
        })
      })

      it('directs output to #labjs-content if no other element is specified', () => {
        b.prepare()

        assert.equal(
          b.el,
          document.querySelector('#labjs-content')
        )
      })
    })

    describe('Running', () => {
      it('resolves promise when running', () => {
        const p = b.run().then(() => {
          assert.ok(true)
        })
        b.end()
        return p
      })
    })

    describe('Timers', () => {
      it('timer property is undefined before running', () => {
        assert.equal(b.timer, undefined)
        return b.prepare().then(() => {
          assert.equal(b.timer, undefined)
        })
      })

      it('timer property holds a value while running', () => {
        const p = b.waitFor('run').then(() => {
          assert.notEqual(b.timer, undefined)
        })

        b.run()
        return p
      })

      it('provides and increments timer property while running', () => {
        const clock = sinon.useFakeTimers()

        // Stub performance.now for the time being,
        // as described in https://github.com/sinonjs/sinon/issues/803
        sinon.stub(performance, 'now', Date.now)

        const p = b.waitFor('run').then(() => {
          // Simulate progress of time and check timer
          assert.equal(b.timer, 0)
          clock.tick(500)
          assert.equal(b.timer, 500)
          clock.tick(500)
          assert.equal(b.timer, 1000)

          // Restore clocks
          clock.restore()
          performance.now.restore()
        })

        b.run()
        return p
      })

      it('timer property remains static after run is complete', () => {
        // As above
        const clock = sinon.useFakeTimers()
        sinon.stub(performance, 'now', Date.now)

        b.waitFor('run').then(() => {
          clock.tick(500)
          b.end()
        })

        const p = b.waitFor('end').then(() => {
          assert.equal(b.timer, 500) // timer remains constant
          clock.tick(500)
          assert.equal(b.timer, 500) // timer remains constant

          // Restore clocks
          clock.restore()
          performance.now.restore()
        })

        b.run()

        return p
      })

      it('times out if requested', () => {
        // Setup fake timers
        const clock = sinon.useFakeTimers()

        // Set the timeout to 500ms
        b.timeout = 500

        // Setup a callback to be run
        // when the element ends
        const callback = sinon.spy()
        b.on('end', callback)

        const p = b.waitFor('run').then(() => {
          // Check that the callback is only
          // called after the specified interval
          // has passed
          assert.notOk(callback.called)
          clock.tick(500)
          assert.ok(callback.calledOnce)

          // Restore timers
          clock.restore()
        })

        // Run the element
        b.run()

        return p
      })

      it('notes timeout as status if timed out', () => {
        // As above
        const clock = sinon.useFakeTimers()
        b.timeout = 500

        b.waitFor('run').then(() => {
          // Trigger timeout
          clock.tick(500)
        })

        return b.run().then(() => {
          // Check that the resulting status is ok
          assert.equal(b.data.ended_on, 'timeout')

          clock.restore()
        })
      })
    })

    describe('Event handlers', () => {
      it('runs event handlers in response to DOM events', () => {
        // Bind a handler to clicks within the document
        const handler = sinon.spy()
        b.events = {
          'click': handler
        }

        const p = b.waitFor('run').then(() => {
          assert.notOk(handler.calledOnce)

          // Simulate click
          b.el.click()

          assert.ok(handler.calledOnce)
        })

        b.run()

        return p
      })

      it('runs event handlers in response to specific events/emitters', () => {
        // We need to set the output element
        // manually at this point so that we
        // can inject content before running
        // .prepare()
        b.el = document.getElementById('labjs-content')

        // Simulate two buttons
        b.el.innerHTML = ' \
          <button id="btn-a">Button A</button> \
          <button id="btn-b">Button B</button>'

        // Create two handlers that are triggered
        // when the buttons are pressed
        const handler_a = sinon.spy()
        const handler_b = sinon.spy()

        b.events = {
          'click button#btn-a': handler_a,
          'click button#btn-b': handler_b,
        }

        const p = b.waitFor('run').then(() => {
          // Simulate clicking both buttons in sequence,
          // and ensure that the associated handlers are triggered
          b.el.querySelector('button#btn-a').click()
          assert.ok(handler_a.calledOnce)
          assert.notOk(handler_b.called)

          b.el.querySelector('button#btn-b').click()
          assert.ok(handler_a.calledOnce)
          assert.ok(handler_b.calledOnce)

          // Clean up
          b.end()
          b.el.innerHTML = ''
        })

        b.run()

        return p
      })

      it('binds event handlers to element', () => {
        // Define a spy and use it as an event handler
        const spy = sinon.spy()
        b.events = {
          'click': spy
        }

        const p = b.waitFor('run').then(() => {
          // Simulate click, triggering handler
          b.el.click()

          // Check binding
          assert.ok(spy.calledOn(b))

          // Cleanup
          b.end()
        })

        b.run()

        return p
      })

      it('calls internal event handlers', () => {
        const callback_prepare = sinon.spy()
        b.on('prepare', callback_prepare)

        const callback_run = sinon.spy()
        b.on('run', callback_run)

        const callback_end = sinon.spy()
        b.on('end', callback_end)

        // Check whether internal event handlers
        // are called at the appropriate times
        return Promise.all([
          b.prepare().then(() => {
            assert.ok(callback_prepare.calledOnce)
            assert.notOk(callback_run.called)
            assert.notOk(callback_end.called)
            b.run()
          }),
          b.waitFor('run').then(() => {
            assert.ok(callback_prepare.calledOnce)
            assert.ok(callback_run.calledOnce)
            assert.notOk(callback_end.called)
            b.end()
          }),
          b.waitFor('end').then(() => {
            assert.ok(callback_prepare.calledOnce)
            assert.ok(callback_run.calledOnce)
            assert.ok(callback_end.calledOnce)
          })
        ])
      })

      it('resolves promises via waitFor', () => {
        const p = b.waitFor('foo').then(() => {
          assert.ok(true)
        })

        b.triggerMethod('foo')

        return p
      })
    })

    describe('Responses', () => {
      it('maps responses onto event handlers', () => {
        b.responses = {
          'click': 'response_keypress'
        }

        // Attach a spy to the respond method
        const spy = sinon.spy(b, 'respond')

        const p = b.waitFor('run').then(() => {
          // Test whether the click triggers
          // a respond method call
          assert.notOk(spy.called)
          b.el.click()
          assert.ok(spy.withArgs('response_keypress').calledOnce)
          assert.ok(spy.calledOnce)

          // Cleanup
          b.end()
        })

        b.run()
        return p
      })

      it('classifies correct responses as such', () => {
        // Define a correct response
        b.correctResponse = 'foo'

        // Run the element
        b.run()

        // Trigger a response
        b.respond('foo')

        // Check the classification
        assert.equal(b.data.correct, true)

        // Check that the resulting status is ok
        assert.equal(b.data.ended_on, 'response')
      })

      it('classifies incorrect responses as such', () => {
        // Same as above
        b.correctResponse = 'foo'
        b.run()
        b.respond('bar')

        // Check classification
        assert.equal(b.data.correct, false)

        // Check that the resulting status is ok
        assert.equal(b.data.ended_on, 'response')
      })
    })


    describe('Parameters', () => {
      it('can aggregate parameters from parents across multiple levels', () => {
        // Create elements
        const a = new lab.core.Component()
        const b = new lab.core.Component()
        const c = new lab.core.Component()

        // Establish hierarchy (a > b > c)
        b.parent = a
        c.parent = b

        // Distribute parameters
        a.parameters['foo'] = 'bar'
        a.parameters['baz'] = 'quux'
        b.parameters['baz'] = 'queer'
        c.parameters['bar'] = 'bloop'

        // Check whether inheritance works properly
        assert.deepEqual(
          c.aggregateParameters,
          {
            foo: 'bar',
            baz: 'queer',
            bar: 'bloop'
          }
        )
      })

      it('commits parameters alongside data', () => {
        // Parameter inheritance is tested elsewhere
        b.datastore = new lab.data.Store()
        b.parameters['foo'] = 'bar'
        b.commit()

        assert.equal(b.datastore.state.foo, 'bar')
      })
    })

    describe('Data', () => {
      it('commits data if datastore is provided', () => {
        b.datastore = new lab.data.Store()
        b.data['foo'] = 'bar'
        b.commit()

        assert.equal(b.datastore.state.foo, 'bar')
      })

      it('commits data automatically when ending', () => {
        // Spy on the commit method
        const spy = sinon.spy(b, 'commit')

        // Supply the Component with a data store, then run
        b.datastore = new lab.data.Store()
        const p = b.run()
        b.end()

        // Make sure the commit method was run
        return p.then(() => {
          assert.ok(spy.calledOnce)
        })
      })
    })

    describe('Hierarchy traversal', () => {
      it('provides parents attribute', () => {
        const a = new lab.core.Component()
        const b = new lab.core.Component()
        const c = new lab.core.Component()

        c.parent = b
        b.parent = a

        assert.deepEqual(
          c.parents,
          [a, b]
        )
      })
    })

  })
})
