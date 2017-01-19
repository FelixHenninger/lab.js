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
        b.options.tardy = true

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
        b.options.tardy = true

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

        return b.run().then(() => {
          assert.ok(callback.calledOnce)
        })
      })

      it('calls prepare method automatically on run, even with tardy option', () => {
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Set tardy option
        b.tardy = true
        return b.run().then(() => {
          assert.ok(callback.calledOnce)
        })
      })

      it('does not call prepare on a previously prepared item when run', () => {
        const callback = sinon.spy()

        // Prepare item beforehand
        return b.prepare().then(() => {
          // Run item
          b.on('prepare', callback)
          return b.run()
        }).then(() => {
          assert.notOk(callback.called)
        })
      })

      it('directs output to #labjs-content if no other element is specified', () => {
        return b.prepare().then(() => {
          assert.equal(
            b.options.el,
            document.querySelector('#labjs-content')
          )
        })
      })
    })

    describe('Running', () => {
      it('resolves promise when running', () => {
        return b.run().then(() => {
          assert.ok(true)
        })
      })

      it('updates status when running', () => {
        // Before preparation
        assert.equal(b.status, 0)

        return b.prepare().then(() => {
          // After preparation
          assert.equal(b.status, 1)
          return b.run()
        }).then(() => {
          // After running
          assert.equal(b.status, 2)
          return b.end()
        }).then(() => {
          // After ending
          assert.equal(b.status, 3)
        })
      })

      it('updates the progress property', () => {
        // Before running
        assert.equal(b.progress, 0)

        // Run
        return b.run().then(() => {
          assert.equal(b.progress, 0)
          return b.end()
        }).then(() => {
          assert.equal(b.progress, 1)
        })
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
        return b.run().then(() => {
          assert.notEqual(b.timer, undefined)
        })
      })

      it('provides and increments timer property while running', () => {
        const clock = sinon.useFakeTimers()

        // Stub performance.now for the time being,
        // as described in https://github.com/sinonjs/sinon/issues/803
        sinon.stub(performance, 'now', Date.now)

        return b.run().then(() => {
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
      })

      it('timer property remains static after run is complete', () => {
        // As above
        const clock = sinon.useFakeTimers()
        sinon.stub(performance, 'now', Date.now)

        return b.run().then(() => {
          clock.tick(500)
          b.end()
        }).then(() => {
          assert.equal(b.timer, 500) // timer remains constant
          clock.tick(500)
          assert.equal(b.timer, 500) // timer remains constant

          // Restore clocks
          clock.restore()
          performance.now.restore()
        })
      })

      it('times out if requested', () => {
        // Setup fake timers
        const clock = sinon.useFakeTimers()

        // Set the timeout to 500ms
        b.options.timeout = 500

        // Setup a callback to be run
        // when the component ends
        const callback = sinon.spy()
        b.on('end', callback)

        return b.run().then(() => {
          // Check that the callback is only
          // called after the specified interval
          // has passed
          assert.notOk(callback.called)
          clock.tick(500)
          assert.ok(callback.calledOnce)

          // Restore timers
          clock.restore()
        })
      })

      it('notes timeout as status if timed out', () => {
        // As above
        const clock = sinon.useFakeTimers()
        b.options.timeout = 500

        return b.run().then(() => {
          // Trigger timeout
          clock.tick(500)

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
        b.options.events = {
          'click': handler
        }

        return b.run().then(() => {
          assert.notOk(handler.calledOnce)

          // Simulate click
          b.options.el.click()

          assert.ok(handler.calledOnce)
        })
      })

      it('runs event handlers in response to specific events/emitters', () => {
        // We need to set the output element
        // manually at this point so that we
        // can inject content before running
        // .prepare()
        b.options.el = document.getElementById('labjs-content')

        // Simulate two buttons
        b.options.el.innerHTML = ' \
          <button id="btn-a">Button A</button> \
          <button id="btn-b">Button B</button>'

        // Create two handlers that are triggered
        // when the buttons are pressed
        const handler_a = sinon.spy()
        const handler_b = sinon.spy()

        b.options.events = {
          'click button#btn-a': handler_a,
          'click button#btn-b': handler_b,
        }

        return b.run().then(() => {
          // Simulate clicking both buttons in sequence,
          // and ensure that the associated handlers are triggered
          b.options.el.querySelector('button#btn-a').click()
          assert.ok(handler_a.calledOnce)
          assert.notOk(handler_b.called)

          b.options.el.querySelector('button#btn-b').click()
          assert.ok(handler_a.calledOnce)
          assert.ok(handler_b.calledOnce)

          // Clean up
          b.options.el.innerHTML = ''
          return b.end()
        })
      })

      it('binds event handlers to component', () => {
        // Define a spy and use it as an event handler
        const spy = sinon.spy()
        b.options.events = {
          'click': spy
        }

        return b.run().then(() => {
          // Simulate click, triggering handler
          b.options.el.click()

          // Check binding
          assert.ok(spy.calledOn(b))

          // Cleanup
          return b.end()
        })
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
        return b.prepare().then(() => {
          assert.ok(callback_prepare.calledOnce)
          assert.notOk(callback_run.called)
          assert.notOk(callback_end.called)
          return b.run()
        }).then(() => {
          assert.ok(callback_prepare.calledOnce)
          assert.ok(callback_run.calledOnce)
          assert.notOk(callback_end.called)
          return b.end()
        }).then(() => {
          assert.ok(callback_prepare.calledOnce)
          assert.ok(callback_run.calledOnce)
          assert.ok(callback_end.calledOnce)
        })
      })

      it('runs internal event handlers only once if requested', () => {
        const spy = sinon.spy()
        const spyOnce = sinon.spy()

        const c = new lab.core.Component()
        c.on('event', spy)
        c.once('event', spyOnce)

        // First event: Should trigger both spies
        c.trigger('event')
        assert.ok(spy.calledOnce)
        assert.ok(spyOnce.calledOnce)

        // Second event: Single-call spy should not be called
        c.trigger('event')
        assert.notOk(spy.calledOnce)
        assert.ok(spyOnce.calledOnce)
      })

      it('accepts internal event handlers via the messageHandlers option', () => {
        const handler = () => null
        b = new lab.core.Component({
          messageHandlers: {
            'someEvent': handler
          }
        })

        assert.include(
          b.internals.callbacks['$someEvent'],
          handler
        )
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
        b.options.responses = {
          'click': 'response_keypress'
        }

        // Attach a spy to the respond method
        const spy = sinon.spy(b, 'respond')

        return b.run().then(() => {
          // Test whether the click triggers
          // a respond method call
          assert.notOk(spy.called)
          b.options.el.click()
          assert.ok(spy.withArgs('response_keypress').calledOnce)
          assert.ok(spy.calledOnce)

          // Cleanup
          return b.end()
        })
      })

      it('classifies correct responses as such', () => {
        // Define a correct response
        b.options.correctResponse = 'foo'

        // Run the component
        return b.run().then(() => {
          // Trigger a response
          b.respond('foo')

          // Check the classification
          assert.equal(b.data.correct, true)

          // Check that the resulting status is ok
          assert.equal(b.data.ended_on, 'response')
        })
      })

      it('classifies incorrect responses as such', () => {
        // Same as above
        b.options.correctResponse = 'foo'

        return b.run().then(() => {
          b.respond('bar')

          // Check classification
          assert.equal(b.data.correct, false)

          // Check that the resulting status is ok
          assert.equal(b.data.ended_on, 'response')
        })
      })
    })


    describe('Parameters', () => {
      it('can aggregate parameters from parents across multiple levels', () => {
        // Create components
        const a = new lab.core.Component()
        const b = new lab.core.Component()
        const c = new lab.core.Component()

        // Establish hierarchy (a > b > c)
        b.parent = a
        c.parent = b

        // Distribute parameters
        a.options.parameters['foo'] = 'bar'
        a.options.parameters['baz'] = 'quux'
        b.options.parameters['baz'] = 'queer'
        c.options.parameters['bar'] = 'bloop'

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
        b.options.datastore = new lab.data.Store()
        b.options.parameters['foo'] = 'bar'
        b.commit()

        assert.equal(b.options.datastore.state.foo, 'bar')
      })
    })

    describe('Options', () => {
      it('mirrors options to internals.rawOptions', () => {
        const c = new lab.core.Component({
          demoOption: 'demo value',
        })
        assert.equal(c.internals.rawOptions.demoOption, 'demo value')

        c.options.demoOption = 'changed value'
        assert.equal(c.internals.rawOptions.demoOption, 'changed value')
      })

      it('retrieves options via internals.parsedOptions', () => {
        const c = new lab.core.Component({
          demoOption: 'demo value',
        })
        assert.equal(c.options.demoOption, 'demo value')

        c.internals.parsedOptions.demoOption = 'substituted value'
        assert.equal(c.options.demoOption, 'substituted value')
      })

      it('parses options that are included in parsableOptions during prepare', () => {
        // As below, this would be more cleanly
        // tested using a custom component class.
        c = new lab.core.Component({
          correctResponse: '${ parameters.correctResponse }',
          parameters: {
            correctResponse: 'inserted value',
          },
        })

        assert.notEqual(
          c.options.correctResponse, 'inserted value'
        )

        return c.prepare().then(() => {
          assert.equal(
            c.options.correctResponse, 'inserted value'
          )
        })
      })

      it('doesn\'t parse options that are not included in parsableOptions', () => {
        c = new lab.core.Component({
          foo: '${ parameters.foo }',
          parameters: {
            foo: 'bar',
          }
        })

        return c.prepare().then(() => {
          assert.equal(c.options.foo, '${ parameters.foo }')
        })
      })

      it('coerces types where requested', () => {
        c = new lab.core.Component({
          timeout: '${ parameters.timeout }',
          parameters: {
            timeout: '123',
          },
        })

        return c.prepare().then(() => {
          assert.equal(c.options.timeout, 123)
          assert.equal(typeof c.options.timeout, 'number')
        })
      })

      it('collects parsableOptions via prototype chain', () => {
        // This is awkward to test, since the parsableOptions
        // are not exposed on components. An alternative would
        // be to construct an artificial component prototype
        // chain, but this is not easy without resorting to es6
        // classes (which won't run in all browsers without
        // transpiling).
        const s = new lab.html.Screen({
          correctResponse: 'Hello ${ parameters.place }!',
          parameters: {
            place: 'world',
          },
        })

        // Test that correctResponse is parsed even though it
        // is not included in the screen's parsableOptions
        assert.notOk(
          Object.keys(s.constructor.metadata.parsableOptions)
            .includes('correctResponse')
        )

        return s.prepare().then(() => {
          assert.equal(s.options.correctResponse, 'Hello world!')
        })
      })

      it('makes available component while parsing (through this)', () => {
        const c = new lab.core.Component({
          correctResponse: '${ this.foo }',
        })
        c.foo = 'Hooray!'

        return c.prepare().then(() => {
          assert.equal(c.options.correctResponse, 'Hooray!')
        })
      })

      it('does not allow code execution in template', () => {
        const c = new lab.core.Component({
          correctResponse: '<% print("I am evil"); %>!',
        })

        return c.prepare().then(() => {
          assert.notEqual(c.options.correctResponse, 'I am evil!')
        })
      })

      it('automatically parses options set after preparing', () => {
        c = new lab.core.Component({
          parameters: {
            foo: 'bar',
          },
        })

        assert.equal(c.options.correctResponse, null)

        return c.prepare().then(() => {
          c.options.correctResponse = '${ parameters.foo }'
          assert.equal(c.internals.rawOptions.correctResponse, '${ parameters.foo }')
          assert.equal(c.internals.parsedOptions.correctResponse, 'bar')
          assert.equal(c.options.correctResponse, 'bar')
        })
      })
    })

    describe('Data', () => {
      it('commits data if datastore is provided', () => {
        b.options.datastore = new lab.data.Store()
        b.data['foo'] = 'bar'
        b.commit()

        assert.equal(b.options.datastore.state.foo, 'bar')
      })

      it('commits data automatically when ending', () => {
        // Spy on the commit method
        const spy = sinon.spy(b, 'commit')

        // Supply the Component with a data store
        // (it won't commit otherwise)
        b.options.datastore = new lab.data.Store()

        // Make sure the commit method was run
        return b.run().then(() => {
          return b.end()
        }).then(() => {
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

    describe('Utilities', () => {
      it('provides a type property', () => {
        const c = new lab.core.Component()
        assert.equal(
          c.type,
          'core.Component'
        )
      })

      it('creates a clone of itself', () => {
        const a = new lab.core.Component()
        a.options.foo = 'bar'
        const b = a.clone()

        assert.deepEqual(
          a.options,
          b.options
        )
      })

      it('incorporates additional options into clones', () => {
        const a = new lab.core.Component()
        a.options.constantProperty = 'original'
        a.options.overwrittenProperty = 'original'

        const b = a.clone({ overwrittenProperty: 'modified' })

        assert.equal(
          b.options.constantProperty,
          'original'
        )
        assert.equal(
          b.options.overwrittenProperty,
          'modified'
        )
      })

      it('instantiates directly nested components during cloning', () => {
        const c = new lab.core.Component()
        const spy = sinon.spy(c, 'clone')

        const f = new lab.html.Frame({
          content: c
        })
        const f1 = f.clone()

        assert.ok(spy.calledOnce)
      })

      it('instantiates nested components in list during cloning', () => {
        const c = new lab.core.Component()
        const spy = sinon.spy(c, 'clone')

        const s = new lab.flow.Sequence({
          content: [c]
        })
        const s1 = s.clone()

        assert.ok(spy.calledOnce)
      })
    })

  }) // Component

  describe('Plugin API', () => {
    let c, plugin
    beforeEach(() => {
      c = new lab.core.Component()
      plugin = {
        handle: (context, event, args) => null
      }
    })

    it('Adds and initializes new plugins', () => {
      assert.deepEqual(c.plugins.plugins, [])

      // Add plugin
      const spy = sinon.spy(plugin, 'handle')
      c.plugins.add(plugin)

      // Check result
      assert.deepEqual(c.plugins.plugins, [plugin])
      assert.ok(
        spy.calledWith(c, 'plugin:init')
      )
    })

    it('Removes plugins if requested', () => {
      c.plugins.add(plugin)

      // Remove plugin
      const spy = sinon.spy(plugin, 'handle')
      c.plugins.remove(plugin)

      // Check result
      assert.deepEqual(c.plugins.plugins, [])
      assert.ok(
        spy.calledWith(c, 'plugin:removal')
      )
    })

    it('Passes events to plugins', () => {
      c.plugins.add(plugin)

      // Setup spy
      const spy = sinon.spy(plugin, 'handle')
      assert.notOk(spy.called)

      // Trigger event and record results
      c.plugins.trigger('foo', 1, 2, 3)
      assert.ok(
        spy.calledWith(c, 'foo', 1, 2, 3)
      )
    })
  })
})
