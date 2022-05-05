/* global define, describe, it, beforeEach, afterEach, assert, sinon */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('Core', () => {

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

  // Helper functions ----------------------------------------------------------

  // Simulate key presses
  // (cf. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
  const simulateKeyPress = (key, target) => {
    const event = new KeyboardEvent('keypress', {
      bubbles: true, // Event bubbles up document hierarchy
      key: key, // Define the key that was pressed
    })

    // Dispatch event
    target.dispatchEvent(event)
    return event
  }

  // ---------------------------------------------------------------------------

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
      it('skips automated preparation when tardy option is set', async () => {
        // Set tardy option: No automated preparation
        b.options.tardy = true

        // Prepare callback to check whether preparation is run
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Prepare item (indicate non-direct call)
        await b.prepare(false)
        assert.notOk(callback.called)
      })

      it('responds to manual preparation when tardy option is set', async () => {
        // Set tardy option: No automated preparation
        b.options.tardy = true

        // Prepare callback to check whether preparation is run
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Prepare item (via direct call)
        await b.prepare()
        assert.ok(callback.calledOnce)
      })

      it('calls prepare method automatically when running unprepared', async () => {
        const callback = sinon.spy()
        b.on('prepare', callback)

        await b.run()
        assert.ok(callback.calledOnce)
      })

      it('calls prepare method automatically on run, even with tardy option', async () => {
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Set tardy option
        b.tardy = true
        await b.run()
        assert.ok(callback.calledOnce)
      })

      it('does not call prepare on a previously prepared item when run', async () => {
        const callback = sinon.spy()

        // Prepare item beforehand
        await b.prepare()

        // Run item
        b.on('prepare', callback)
        await b.run()
        assert.notOk(callback.called)
      })

      it('initializes RNG on component', async () => {
        await b.prepare()
        assert.ok(
          b.random instanceof lab.util.Random
        )
      })

      it('passes randomization options to RNG', async () => {
        const c = new lab.core.Component({
          random: {
            algorithm: 'alea',
            seed: 'abcd',
          },
        })

        await c.prepare()
        assert.equal(
          c.random.random(),
          new lab.util.Random(c.options.random).random()
        )
      })

      it('caches images', async () => {
        const url = 'static/example_image.png'
        b.options.media.images.push(url)

        await b.prepare()

        const [image, bitmap] =
          b.internals.controller.global.cache.images.readSync(url)
        assert.instanceOf(image, Image)

        // Check that loading completed
        assert.ok(image.complete)
      })

      it('caches audio', async () => {
        const url = 'static/example_audio.mp3'
        b.options.media.audio.push(url)

        await b.prepare()
        const audio = b.internals.controller.global.cache.audio.readSync(url)

        assert.instanceOf(audio, AudioBuffer)
        assert.ok(audio.length > 0)
      })

      it('directs output to default section if no other element is specified', async () => {
        await b.run()
        assert.equal(
          b.internals.context.el,
          document.querySelector('[data-labjs-section="main"]')
        )
      })
    })

    describe('Running', () => {
      it('resolves promise when running', async () => {
        await b.run()
        assert.ok(true)
      })

      it('updates status when running', async () => {
        // Before preparation
        assert.equal(b.status, 0)

        await b.prepare()
        assert.equal(b.status, 1)

        await b.run()
        assert.equal(b.status, 2)

        await b.end()
        assert.equal(b.status, 3)
      })

      it('updates the progress property', async () => {
        // Before running
        assert.equal(b.progress, 0)

        // Run
        await b.run()
        assert.equal(b.progress, 0)

        await b.end()
        assert.equal(b.progress, 1)
      })

      it('skips run if requested', async () => {
        b.options.skip = true

        const spy_run = sinon.spy()
        b.on('run', spy_run)

        const spy_end = sinon.spy()
        b.on('end', spy_end)

        await b.run()
        assert.notOk(spy_run.called)

        assert.ok(spy_end.called)
        assert.equal(
          b.data.ended_on,
          'skipped'
        )
      })

      it('reports progress even if nested content was skipped', async () => {
        const a = new lab.core.Component()

        const spy = sinon.spy()
        a.on('run', spy)

        const s = new lab.flow.Sequence({
          content: [ a ],
          skip: true,
        })

        await s.run()
        assert.notOk(spy.called)
        assert.equal(a.progress, 0)
        assert.equal(s.progress, 1)
      })

      it('scrolls to top if so instructed', async () => {
        const scrollStub = sinon.stub(window, 'scrollTo')

        const noScroll = new lab.core.Component()
        const scroll = new lab.core.Component({
          scrollTop: true,
        })

        await noScroll.run()
        assert.notOk( scrollStub.called )

        await scroll.run()
        assert.ok( scrollStub.withArgs(0, 0).calledOnce )
        window.scrollTo.restore()
      })
    })

    describe('Timers', () => {

      let clock
      beforeEach(() => {
        clock = sinon.useFakeTimers()
      })

      afterEach(() => {
        clock.restore()
      })

      it('timer property is undefined before running', async () => {
        assert.equal(b.timer, undefined)
        await b.prepare()
        assert.equal(b.timer, undefined)
      })

      it('timer property holds a value while running', async () => {
        await b.run()
        assert.notEqual(b.timer, undefined)
      })

      it('provides and increments timer property while running', async () => {
        await b.run()
        // Show component
        clock.runToFrame()

        // Simulate progress of time and check timer
        assert.equal(b.timer, 0)
        clock.tick(500)
        assert.equal(b.timer, 500)
        clock.tick(500)
        assert.equal(b.timer, 1000)
      })

      it('timer property remains static after run is complete', async () => {
        await b.run()
        // Show component
        clock.runToFrame()

        // Component ends on next frame
        clock.tick(500)

        await b.end()
        assert.equal(b.timer, 500) // timer remains constant
        clock.tick(500)
        assert.equal(b.timer, 500) // timer remains constant
      })
    })

    describe('Timeouts', () => {
      let clock
      beforeEach(() => {
        clock = sinon.useFakeTimers()
      })

      afterEach(() => {
        clock.restore()
      })

      it('times out if requested', async () => {
        // Set the timeout to 500ms
        b.options.timeout = 500

        // Setup a callback to be run
        // when the component ends
        const callback = sinon.spy()
        b.on('end', callback)

        await b.run()
        // Check that the callback is only called
        // after the specified interval has passed
        assert.notOk(callback.called)
        clock.tick(500)
        assert.notOk(callback.called)

        await clock.nextAsync()
        assert.ok(callback.calledOnce)
      })

      it('notes timeout as status if timed out', async () => {
        // As above
        b.options.timeout = 100

        await b.run()
        // Trigger timeout
        clock.tick(100)
        await clock.nextAsync()
        // Check that the resulting status is ok
        assert.equal(b.data.ended_on, 'timeout')
      })

      const simulateTimeout = function(duration) {
        const startTime = performance.now()
        let t
        const f = new lab.util.timing.FrameTimeout(
          timeStamp => (t = timeStamp),
          duration
        )
        f.run()
        clock.runAll()

        return t - startTime
      }

      it('triggers callback on closest frame', () => {
        const frameDuration = 16
        const timeouts = [
          20, 50, 100, 200, 300, 400, 500, 600, 700, 750, 800, 900,
          1000, 1200, 1250, 1500, 1750, 2000, 2500, 5000, 10000]

        timeouts.forEach(t => {
          clock.reset()
          assert.equal(
            simulateTimeout(t),
            (Math.round(t / frameDuration - 0.01) - 1) * frameDuration
          )
        })
      })
    })

    describe('Event handlers', () => {

      it('runs event handlers in response to DOM events', async () => {
        // Bind a handler to clicks within the document
        const handler = sinon.spy()
        b.options.events = {
          'click': handler
        }

        await b.run()
        assert.notOk(handler.calledOnce)

        // Simulate click
        b.internals.context.el.click()

        assert.ok(handler.calledOnce)
      })

      it('runs event handlers in response to specific events/emitters', async () => {
        // We need to set the output element
        // manually at this point so that we
        // can inject content before running
        // .prepare()
        b.options.el = document.querySelector('[data-labjs-section="main"]')

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

        await b.run()
        // Simulate clicking both buttons in sequence,
        // and ensure that the associated handlers are triggered
        b.internals.context.el.querySelector('button#btn-a').click()
        assert.ok(handler_a.calledOnce)
        assert.notOk(handler_b.called)

        b.internals.context.el.querySelector('button#btn-b').click()
        assert.ok(handler_a.calledOnce)
        assert.ok(handler_b.calledOnce)

        // Clean up
        b.internals.context.el.innerHTML = ''
        await b.end()
      })

      it('accepts multiple options for events', async () => {
        // Use an actual element in the page for testing
        // (keyboard event listeners are typically
        // located at the document level, and the
        // event bubbles up the hierarchy)
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        // Create a spy as a substitute
        // for an event handler
        const handler = sinon.spy()

        // Bind spy to document events
        b.options.events = {
          'keypress(a,b)': handler,
        }

        // Check that the handler is called
        // when either key is pressed, and
        // that the event is passed as an argument
        await b.run()
        const b_pressed = simulateKeyPress('b', b.options.el)
        assert.ok(handler.calledOnce)
        assert.ok(handler.firstCall.calledWith(b_pressed))

        const a_pressed = simulateKeyPress('a', b.options.el)
        assert.ok(handler.calledTwice)
        assert.ok(handler.secondCall.calledWith(a_pressed))

        // Clean up
        await b.end()
      })

      it('triggers all applicable events', async () => {
        // See above for a fully commented, very similar test
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        const handler_specific = sinon.spy()
        const handler_general = sinon.spy()
        const handler_global = sinon.spy()
        b.options.events = {
          'keypress(a,b)': handler_general,
          'keypress(a)': handler_specific,
          'keypress': handler_global,
        }

        await b.run()
        const c_pressed = simulateKeyPress('c', b.options.el)
        assert.ok(handler_global.calledOnce)
        assert.ok(handler_global.firstCall.calledWith(c_pressed))

        const b_pressed = simulateKeyPress('b', b.options.el)
        assert.ok(handler_general.calledOnce)
        assert.ok(handler_general.firstCall.calledWith(b_pressed))
        assert.ok(handler_global.calledTwice)
        assert.ok(handler_global.secondCall.calledWith(b_pressed))

        const a_pressed = simulateKeyPress('a', b.options.el)
        assert.ok(handler_specific.calledOnce)
        assert.ok(handler_specific.firstCall.calledWith(a_pressed))
        assert.ok(handler_general.calledTwice)
        assert.ok(handler_general.secondCall.calledWith(a_pressed))
        assert.ok(handler_global.calledThrice)
        assert.ok(handler_global.thirdCall.calledWith(a_pressed))

        await b.end()
      })

      it('does not trigger handler before startTime', async () => {
        // Set a startTime in the future
        b.internals.domConnection.startTime = performance.now() + 1000

        // Setup handler and target element
        const handler = sinon.spy()
        b.options.el = document.querySelector('[data-labjs-section="main"]')
        b.options.events = {
          'keypress': handler,
        }

        await b.run()
        simulateKeyPress('a', b.options.el)
        assert.ok(handler.notCalled)
      })

      it('deals with spaces in event string options', async () => {
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        const handler = sinon.spy()
        b.options.events = {
          'keypress( a,b )': handler,
        }

        await b.run()
        simulateKeyPress('b', b.options.el)
        assert.ok(handler.calledOnce)
      })

      it('binds event handlers to component', async () => {
        // Define a spy and use it as an event handler
        const spy = sinon.spy()
        b.options.events = {
          'click': spy
        }

        await b.run()
        // Simulate click, triggering handler
        b.internals.context.el.click()

        // Check binding
        assert.ok(spy.calledOn(b))

        // Cleanup
        await b.end()
      })

      it('calls internal event handlers', async () => {
        const callback_prepare = sinon.spy()
        b.on('prepare', callback_prepare)

        const callback_run = sinon.spy()
        b.on('run', callback_run)

        const callback_end = sinon.spy()
        b.on('end', callback_end)

        // Check whether internal event handlers
        // are called at the appropriate times
        await b.prepare()
        assert.ok(callback_prepare.calledOnce)
        assert.notOk(callback_run.called)
        assert.notOk(callback_end.called)

        await b.run()
        assert.ok(callback_prepare.calledOnce)
        assert.ok(callback_run.calledOnce)
        assert.notOk(callback_end.called)

        await b.end()
        assert.ok(callback_prepare.calledOnce)
        assert.ok(callback_run.calledOnce)
        assert.ok(callback_end.calledOnce)
      })

      it('passes controller global to event handlers', async () => {
        let prepareContext
        b.on('prepare', (_, context) => {
          prepareContext = context
        })

        let runContext
        b.on('run', (_, context) => {
          runContext = context
        })

        await b.run()

        assert.equal(
          prepareContext,
          b.internals.controller.global,
        )
        assert.equal(
          runContext,
          b.internals.controller.global,
        )
      })

      it('accepts internal event handlers via the hooks option', async () => {
        const handler = sinon.stub()
        b = new lab.core.Component({
          hooks: {
            'someEvent': handler
          }
        })

        // Note that this requires preparation
        await b.prepare()
        b.internals.emitter.emit('someEvent')

        assert.ok(
          handler.calledOnce
        )
      })
    })

    describe('Responses', () => {
      it('maps responses onto event handlers', async () => {
        b.options.responses = {
          'click': 'response_keypress'
        }

        // Attach a spy to the respond method
        const spy = sinon.spy(b, 'respond')

        await b.run()

        // Test whether the click triggers
        // a respond method call
        assert.notOk(spy.called)
        b.internals.context.el.click()
        assert.ok(spy.withArgs('response_keypress').calledOnce)
        assert.ok(spy.calledOnce)
      })

      it('classifies correct responses as such', async () => {
        // Define a correct response
        b.options.correctResponse = 'foo'

        // Run the component
        await b.run()

        // Trigger a response
        b.respond('foo', { timestamp: 123, action: 'test' })

        // Check the classification
        assert.equal(b.data.correct, true)

        // Check that the resulting status is ok
        assert.equal(b.data.ended_on, 'response')
      })

      it('classifies incorrect responses as such', async () => {
        // Same as above
        b.options.correctResponse = 'foo'

        await b.run()

        b.respond('bar', { timestamp: 123, action: 'test' })

        // Check classification
        assert.equal(b.data.correct, false)

        // Check that the resulting status is ok
        assert.equal(b.data.ended_on, 'response')
      })

      it('accepts timestamp for response', async () => {
        await b.run()
        b.respond('bar', { timestamp: 123 })

        assert.equal(b.internals.timestamps.end, 123)
      })

      it('saves event timestamp if available', async () => {
        // See above for a fully commented, very similar test
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        b.options.responses = {
          'keypress(a)': sinon.spy(),
        }

        // Fake timers
        const clock = sinon.useFakeTimers(123)
        if (!performance.timing) {
          performance.timing = { navigationStart: 999 }
        }

        await b.run()

        const b_pressed = simulateKeyPress('a', b.options.el)

        assert.ok(
          b.internals.timestamps.end === b_pressed.timeStamp ||
          // If the event does not provide a high-res timeStamp,
          // we measure the time in the library as a fall-back.
          b.internals.timestamps.end === performance.now()
        )

        clock.restore()
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

      it('proxies writes to parameter property', () => {
        const c = new lab.core.Component()
        c.parameters.foo = 'bar'

        assert.equal(
          c.options.parameters.foo,
          'bar'
        )
      })

      it('proxies reads from parameter property', async () => {
        const c = new lab.core.Component()
        c.options.parameters.foo = 'bar'

        await c.prepare()

        assert.equal(
          c.parameters.foo,
          'bar'
        )
      })

      it('commits parameters alongside data', async () => {
        const c = new lab.core.Dummy()

        // (parameter inheritance is tested elsewhere)
        c.options.parameters['foo'] = 'bar'

        let spy
        await c.prepare()
        spy = sinon.stub(c.internals.controller.global.datastore, 'set')

        await c.run()

        assert.ok(spy.calledOnce)
        assert.equal(
          spy.firstCall.args[0]['foo'],
          'bar'
        )
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

      it('parses options that are included in parsableOptions during prepare', async () => {
        // As below, this would be more cleanly
        // tested using a custom component class.
        const c = new lab.core.Component({
          correctResponse: '${ parameters.correctResponse }',
          parameters: {
            correctResponse: 'inserted value',
          },
        })

        assert.notEqual(
          c.options.correctResponse, 'inserted value'
        )

        await c.prepare()

        assert.equal(
          c.options.correctResponse, 'inserted value'
        )
      })

      it('doesn\'t parse options that are not included in parsableOptions', async () => {
        const c = new lab.core.Component({
          foo: '${ parameters.foo }',
          parameters: {
            foo: 'bar',
          }
        })

        await c.prepare()
        assert.equal(c.options.foo, '${ parameters.foo }')
      })

      it('coerces types where requested', async () => {
        const c = new lab.core.Component({
          timeout: '${ parameters.timeout }',
          parameters: {
            timeout: '123',
          },
        })

        await c.prepare()
        assert.equal(c.options.timeout, 123)
        assert.equal(typeof c.options.timeout, 'number')
      })

      it('recursively parses options when outputtype is \'object\'', async () => {
        const c = new lab.canvas.Screen({
          content: [
            { text: '${ parameters.foo }' }
          ],
          parameters: {
            foo: 'bar',
          },
        })

        await c.prepare()
        assert.equal(c.options.content[0].text, 'bar')
      })

      it('collects parsableOptions via prototype chain', async () => {
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

        await s.prepare()
        assert.equal(s.options.correctResponse, 'Hello world!')
      })

      it('makes available component parameters through this', async () => {
        const c = new lab.core.Component({
          correctResponse: '${ this.parameters.foo }',
        })
        c.parameters.foo = 'Hooray!'

        await c.prepare()
        assert.equal(c.options.correctResponse, 'Hooray!')
      })

      it('does not allow code execution in template', async () => {
        const c = new lab.core.Component({
          correctResponse: '<% print("I am evil"); %>!',
        })

        await c.prepare()
        assert.notEqual(c.options.correctResponse, 'I am evil!')
      })

      it('automatically parses options set after preparing', async () => {
        const c = new lab.core.Component({
          parameters: {
            foo: 'bar',
          },
        })

        assert.equal(c.options.correctResponse, null)

        await c.prepare()
        c.options.correctResponse = '${ parameters.foo }'
        assert.equal(c.internals.rawOptions.correctResponse, '${ parameters.foo }')
        assert.equal(c.options.correctResponse, 'bar')
      })
    })

    describe('Files', () => {
      it('makes available files through placeholders', async () => {
        const c = new lab.html.Screen({
          files: {
            'local/fancy.png': 'remote/long-uninteresting-hashed-url.png',
          },
          content: '<img src="${ files[\'local/fancy.png\'] }">'
        })

        await c.prepare()
        assert.equal(
          c.options.content,
          '<img src="remote/long-uninteresting-hashed-url.png">'
        )
      })

      it('inherits files from parent components', async () => {
        const c = new lab.core.Component()
        const s = new lab.flow.Sequence({
          files: {
            'local/fromParent.png': 'remote/fromParent.png',
          },
          content: [c]
        })

        await s.prepare()
        assert.equal(
          c.files['local/fromParent.png'],
          'remote/fromParent.png'
        )
      })
    })

    describe('Data', () => {
      it('data store is automatically initialized during preparation', async () => {
        await b.prepare()
        assert.instanceOf(
          b.global.datastore,
          lab.data.Store
        )
      })

      it('data store is passed to nested components', async () => {
        const s = new lab.flow.Sequence({
          content: [b]
        })

        await s.prepare()
        assert.strictEqual( // Must be the same instance
          s.global.datastore,
          b.global.datastore
        )
      })

      it('state property reads from data store', async () => {
        await b.prepare()
        b.global.datastore.set('foo', 'bar')

        assert.equal(
          b.state.foo,
          'bar'
        )
      })

      it('state property writes to data store', async () => {
        await b.prepare()
        b.state.foo = 'bar'

        assert.equal(
          b.internals.controller.global.datastore.state.foo,
          'bar'
        )
      })

      it('commits data automatically when ending', async () => {
        let spy

        await b.prepare()
        // Spy on the commit method
        spy = sinon.spy(b.internals.controller.global.datastore, 'commit')

        await b.run()

        // Make sure the commit method was run
        await b.end()
        assert.ok(spy.calledOnce)
      })
    })

    describe('Hierarchy traversal', () => {
      let a, b, c

      // Note that this is somewhat hackish, because it relies on
      // sequences working -- it might be more useful to implement a
      // general nested-component-preparation mechanism, and then revert
      // all of these to core.Components.
      beforeEach(() => {
        c = new lab.core.Component()
        b = new lab.flow.Sequence({ content: [c] })
        a = new lab.flow.Sequence({ content: [b] })
      })

      it('provides parents attribute', async () => {
        await a.prepare()
        assert.deepEqual(
          c.parents,
          [a, b]
        )
      })

      it('saves root component internally', async () => {
        await a.prepare()
        assert.equal(c.internals.controller.root, a)
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

      it('provides additional output to console if debug option is set', async () => {
        sinon.stub(console, 'info')

        const c = new lab.core.Dummy({
          debug: true
        })

        const p = c.internals.emitter.waitFor('lock')

        await c.run()
        await p

        assert.ok(console.info.called)
        console.info.restore()
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

    it('adds and initializes new plugins', () => {
      assert.deepEqual(c.internals.plugins.plugins, [])

      // Add plugin
      const spy = sinon.spy(plugin, 'handle')
      c.internals.plugins.add(plugin)

      // Check result
      assert.deepEqual(c.internals.plugins.plugins, [plugin])
      assert.ok(
        spy.calledWith(c, 'plugin:add')
      )
    })

    it('removes plugins if requested', () => {
      c.internals.plugins.add(plugin)

      // Remove plugin
      const spy = sinon.spy(plugin, 'handle')
      c.internals.plugins.remove(plugin)

      // Check result
      assert.deepEqual(c.internals.plugins.plugins, [])
      assert.ok(
        spy.calledWith(c, 'plugin:remove')
      )
    })

    it('passes events to plugins', () => {
      c.internals.plugins.add(plugin)

      // Setup spy
      const spy = sinon.spy(plugin, 'handle')
      assert.notOk(spy.called)

      // Trigger event and record results
      c.internals.emitter.trigger('foo', [1, 2, 3])
      assert.ok(
        spy.calledWith(c, 'foo', [1, 2, 3])
      )
    })
  })

  describe('Deserialization', () => {

    // The deserialization function (currently) assumes that the library
    // is available as a global variable. This is not the case with karma-based
    // testing, so the following code injects the local variable into the
    // global namespace if necessary.
    let libraryInjected = false

    beforeEach(() => {
      if (!window.lab) {
        libraryInjected = true
        window.lab = lab
      }

      // Construct a minimal plugin in the global scope
      window.MyPlugin = function MyPlugin() {
        this.handle = function() {}
      }
    })

    afterEach(() => {
      if (libraryInjected) {
        delete window.lab
      }

      // Remove plugin
      delete window.MyPlugin
    })

    it('creates a lab.js component from a base object', () => {
      const c = lab.core.deserialize({
        type: 'lab.core.Component'
      })

      assert.instanceOf(c, lab.core.Component)
    })

    it('transfers options to new object', () => {
      const c = lab.core.deserialize({
        type: 'lab.core.Dummy',
        option: 'value',
      })

      assert.instanceOf(c, lab.core.Dummy)
      assert.equal(c.options.option, 'value')
    })

    it('parses nested components as array', () => {
      const s = lab.core.deserialize({
        type: 'lab.flow.Sequence',
        content: [
          {
            type: 'lab.core.Dummy',
            option: 'value'
          }
        ]
      })

      assert.instanceOf(s.options.content[0], lab.core.Dummy)
      assert.equal(s.options.content[0].options.option, 'value')
    })

    it('parses individual nested components', () => {
      const f = lab.core.deserialize({
        type: 'lab.html.Frame',
        content: {
          type: 'lab.core.Dummy',
          option: 'value'
        }
      })

      assert.instanceOf(f.options.content, lab.core.Dummy)
      assert.equal(f.options.content.options.option, 'value')
    })

    it('parses plugins', () => {
      const pluginArgs = {
        type: 'lab.plugins.Debug',
      }

      const c = lab.core.deserialize({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      assert.ok(
        c.internals.plugins.plugins[0] instanceof lab.plugins.Debug
      )
    })

    it('parses plugins from global scope', () => {
      const pluginArgs = {
        type: 'global.MyPlugin',
      }

      const c = lab.core.deserialize({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      assert.ok(
        c.internals.plugins.plugins[0] instanceof window.MyPlugin
      )
    })

    it('loads plugins via the path option', () => {
      const pluginArgs = {
        type: 'global.UnavailablePlugin',
        path: 'global.MyPlugin',
      }

      const c = lab.core.deserialize({
        type: 'lab.core.Component',
        plugins: [ pluginArgs ],
      })

      assert.ok(
        c.internals.plugins.plugins[0] instanceof window.MyPlugin
      )
    })

    it('throws error if plugin is not available', () => {
      assert.throws(
        () => lab.core.deserialize({
          type: 'lab.core.Component',
          plugins: [{ path: 'global.UnavailablePlugin' }]
        })
      )
    })
  })
})

})
