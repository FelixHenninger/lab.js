/* global define, describe, it, beforeEach, afterEach, assert, sinon */
/* eslint-disable import/no-amd */

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'define'.
define(['lab'], (lab: any) => {

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Core', () => {

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

  // Helper functions ----------------------------------------------------------

  // Simulate key presses
  // (cf. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
  const simulateKeyPress = (key: any, target: any) => {
    const event = new KeyboardEvent('keypress', {
      bubbles: true, // Event bubbles up document hierarchy
      key: key, // Define the key that was pressed
    })

    // Dispatch event
    target.dispatchEvent(event)
    return event
  }

  // ---------------------------------------------------------------------------

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Component', () => {
    let b: any

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      b = new lab.core.Component()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('loads', () => {
      b.prepare()
      b.run()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Preparation', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('skips automated preparation when tardy option is set', () => {
        // Set tardy option: No automated preparation
        b.options.tardy = true

        // Prepare callback to check whether preparation is run
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Prepare item (indicate non-direct call)
        return b.prepare(false).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(callback.called)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('responds to manual preparation when tardy option is set', () => {
        // Set tardy option: No automated preparation
        b.options.tardy = true

        // Prepare callback to check whether preparation is run
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Prepare item (via direct call)
        return b.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback.calledOnce)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('calls prepare method automatically when running unprepared', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback = sinon.spy()
        b.on('prepare', callback)

        return b.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback.calledOnce)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('calls prepare method automatically on run, even with tardy option', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback = sinon.spy()
        b.on('prepare', callback)

        // Set tardy option
        b.tardy = true
        return b.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback.calledOnce)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('does not call prepare on a previously prepared item when run', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback = sinon.spy()

        // Prepare item beforehand
        return b.prepare().then(() => {
          // Run item
          b.on('prepare', callback)
          return b.run()
        }).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(callback.called)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('initializes RNG on component', () => {
        return b.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(
            b.random instanceof lab.util.Random
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('passes randomization options to RNG', () => {
        const c = new lab.core.Component({
          random: {
            algorithm: 'alea',
            seed: 'abcd',
          },
        })

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            c.random.random(),
            new lab.util.Random(c.options.random).random()
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('caches images', () => {
        const url = 'static/example_image.png'
        b.options.media.images.push(url)

        return b.prepare().then(() => {
          const image = b.internals.controller.cache.images.readSync(url)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.instanceOf(image, Image)

          // Check that loading completed
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(image.complete)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('caches audio', () => {
        const url = 'static/example_audio.mp3'
        b.options.media.audio.push(url)

        return b.prepare().then(() => {
          const audio = b.internals.controller.cache.audio.readSync(url)

          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.instanceOf(audio, AudioBuffer)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(audio.length > 0)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('directs output to default section if no other element is specified', () =>
        b.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            b.options.el,
            document.querySelector('[data-labjs-section="main"]')
          )
        })
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Running', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('resolves promise when running', () =>
        b.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(true)
        })
      )

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('updates status when running', () => {
        // Before preparation
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.status, 0)

        return b.prepare().then(() => {
          // After preparation
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.status, 1)
          return b.run()
        }).then(() => {
          // After running
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.status, 2)
          return b.end()
        }).then(() => {
          // After ending
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.status, 3)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('updates the progress property', () => {
        // Before running
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.progress, 0)

        // Run
        return b.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.progress, 0)
          return b.end()
        }).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.progress, 1)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('skips run if requested', () => {
        b.options.skip = true

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy_run = sinon.spy()
        b.on('run', spy_run)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy_end = sinon.spy()
        b.on('end', spy_end)

        return b.run()
          .then(() => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.notOk(spy_run.called)

            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(spy_end.called)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.equal(
              b.data.ended_on,
              'skipped'
            )
          })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('reports progress even if nested content was skipped', () => {
        const a = new lab.core.Component()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy()
        a.on('run', spy)

        const s = new lab.flow.Sequence({
          content: [ a ],
          skip: true,
        })

        return s.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(spy.called)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(a.progress, 0)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(s.progress, 1)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('scrolls to top if so instructed', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const scrollStub = sinon.stub(window, 'scrollTo')

        const noScroll = new lab.core.Component()
        const scroll = new lab.core.Component({
          scrollTop: true,
        })

        return noScroll.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk( scrollStub.called )
        }).then(() =>
          scroll.run()
        ).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok( scrollStub.withArgs(0, 0).calledOnce )
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (opti... Remove this comment to see the full error message
          window.scrollTo.restore()
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Timers', () => {

      let clock: any
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        clock = sinon.useFakeTimers()
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
      afterEach(() => {
        clock.restore()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('timer property is undefined before running', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(b.timer, undefined)
        return b.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.timer, undefined)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('timer property holds a value while running', () =>
        b.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notEqual(b.timer, undefined)
        })
      )

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('provides and increments timer property while running', () => {
        return b.run().then(() => {
          // Show component
          clock.runToFrame()

          // Simulate progress of time and check timer
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.timer, 0)
          clock.tick(500)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.timer, 500)
          clock.tick(500)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.timer, 1000)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('timer property remains static after run is complete', () => {
        return b.run().then(() => {
          // Show component
          clock.runToFrame()

          // Component ends on next frame
          clock.tick(500 - 16)
          b.end()
        }).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.timer, 500) // timer remains constant
          clock.tick(500)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.timer, 500) // timer remains constant
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Timeouts', () => {
      let clock: any
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        clock = sinon.useFakeTimers()
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
      afterEach(() => {
        clock.restore()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('times out if requested', () => {
        // FIXME: This test requires that the fake clock advance itself.
        // This has a strong whiff to it, and we should probably
        // reconsider the API around this functionality.
        clock.restore()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        clock = sinon.useFakeTimers({ shouldAdvanceTime: true })

        // Set the timeout to 500ms
        b.options.timeout = 500

        // Setup a callback to be run
        // when the component ends
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback = sinon.spy()
        b.on('end', callback)

        return b.run()
          .then(() => b.waitFor('show'))
          .then(() => {
            // Render component
            clock.runToFrame()

            // Check that the callback is only
            // called after the specified interval
            // has passed
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.notOk(callback.called)
            clock.tick(500)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(callback.calledOnce)
          })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('notes timeout as status if timed out', () => {
        // FIXME, as above
        clock.restore()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        clock = sinon.useFakeTimers({ shouldAdvanceTime: true })

        // As above
        b.options.timeout = 500

        return b.run()
          .then(() => b.waitFor('show'))
          .then(() => {
            // Trigger timeout
            clock.tick(1000)

            // Check that the resulting status is ok
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.equal(b.data.ended_on, 'timeout')
          })
      })

      const simulateTimeout = function(duration: any) {
        const startTime = performance.now()
        let t
        const f = new lab.util.timing.FrameTimeout(
          (timeStamp: any) => t = timeStamp,
          duration
        )
        f.run()
        clock.runAll()

        // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
        return t - startTime
      }

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('triggers callback on closest frame', () => {
        const frameDuration = 16
        const timeouts = [
          20, 50, 100, 200, 300, 400, 500, 600, 700, 750, 800, 900,
          1000, 1200, 1250, 1500, 1750, 2000, 2500, 5000, 10000]

        timeouts.forEach(t => {
          clock.reset()
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            simulateTimeout(t),
            (Math.round(t / frameDuration - 0.01) - 1) * frameDuration
          )
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Event handlers', () => {

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('runs event handlers in response to DOM events', () => {
        // Bind a handler to clicks within the document
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler = sinon.spy()
        b.options.events = {
          'click': handler
        }

        return b.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(handler.calledOnce)

          // Simulate click
          b.options.el.click()

          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler.calledOnce)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('runs event handlers in response to specific events/emitters', () => {
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler_a = sinon.spy()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler_b = sinon.spy()

        b.options.events = {
          'click button#btn-a': handler_a,
          'click button#btn-b': handler_b,
        }

        return b.run().then(() => {
          // Simulate clicking both buttons in sequence,
          // and ensure that the associated handlers are triggered
          b.options.el.querySelector('button#btn-a').click()
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_a.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(handler_b.called)

          b.options.el.querySelector('button#btn-b').click()
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_a.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_b.calledOnce)

          // Clean up
          b.options.el.innerHTML = ''
          return b.end()
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('accepts multiple options for events', () => {
        // Use an actual element in the page for testing
        // (keyboard event listeners are typically
        // located at the document level, and the
        // event bubbles up the hierarchy)
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        // Create a spy as a substitute
        // for an event handler
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler = sinon.spy()

        // Bind spy to document events
        b.options.events = {
          'keypress(a,b)': handler,
        }

        // Check that the handler is called
        // when either key is pressed, and
        // that the event is passed as an argument
        return b.run().then(() => {
          const b_pressed = simulateKeyPress('b', b.options.el)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler.firstCall.calledWith(b_pressed))

          const a_pressed = simulateKeyPress('a', b.options.el)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler.calledTwice)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler.secondCall.calledWith(a_pressed))

          // Clean up
          return b.end()
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('triggers all applicable events', () => {
        // See above for a fully commented, very similar test
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler_specific = sinon.spy()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler_general = sinon.spy()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler_global = sinon.spy()
        b.options.events = {
          'keypress(a,b)': handler_general,
          'keypress(a)': handler_specific,
          'keypress': handler_global,
        }

        return b.run().then(() => {
          const c_pressed = simulateKeyPress('c', b.options.el)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_global.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_global.firstCall.calledWith(c_pressed))

          const b_pressed = simulateKeyPress('b', b.options.el)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_general.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_general.firstCall.calledWith(b_pressed))
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_global.calledTwice)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_global.secondCall.calledWith(b_pressed))

          const a_pressed = simulateKeyPress('a', b.options.el)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_specific.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_specific.firstCall.calledWith(a_pressed))
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_general.calledTwice)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_general.secondCall.calledWith(a_pressed))
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_global.calledThrice)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler_global.thirdCall.calledWith(a_pressed))

          return b.end()
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('does not trigger handler before startTime', () => {
        // Set a startTime in the future
        b.internals.domConnection.startTime = performance.now() + 1000

        // Setup handler and target element
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler = sinon.spy()
        b.options.el = document.querySelector('[data-labjs-section="main"]')
        b.options.events = {
          'keypress': handler,
        }

        return b.run().then(() => {
          simulateKeyPress('a', b.options.el)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler.notCalled)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('deals with spaces in event string options', () => {
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const handler = sinon.spy()
        b.options.events = {
          'keypress( a,b )': handler,
        }

        return b.run().then(() => {
          simulateKeyPress('b', b.options.el)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(handler.calledOnce)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('binds event handlers to component', () => {
        // Define a spy and use it as an event handler
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy()
        b.options.events = {
          'click': spy
        }

        return b.run().then(() => {
          // Simulate click, triggering handler
          b.options.el.click()

          // Check binding
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(spy.calledOn(b))

          // Cleanup
          return b.end()
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('calls internal event handlers', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback_prepare = sinon.spy()
        b.on('prepare', callback_prepare)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback_run = sinon.spy()
        b.on('run', callback_run)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const callback_end = sinon.spy()
        b.on('end', callback_end)

        // Check whether internal event handlers
        // are called at the appropriate times
        return b.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback_prepare.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(callback_run.called)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(callback_end.called)
          return b.run()
        }).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback_prepare.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback_run.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(callback_end.called)
          return b.end()
        }).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback_prepare.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback_run.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(callback_end.calledOnce)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('waits for async event handlers to resolve', () => {
        let done = false
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        const handler = () => new Promise((resolve: any) => {
          window.setTimeout(() => {
            done = true
            resolve()
          }, 20)
        })

        const c = new lab.core.Component()
        c.on('event', handler)

        return c.trigger('event').then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(done)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('runs internal event handlers only once if requested', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spyOnce = sinon.spy()

        const c = new lab.core.Component()
        c.on('event', spy)
        c.once('event', spyOnce)

        // First event: Should trigger both spies
        c.trigger('event')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spyOnce.calledOnce)

        // Second event: Single-call spy should not be called
        c.trigger('event')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(spy.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spyOnce.calledOnce)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('waits for one-shot async event handlers', () => {
        // ... as above, except for the call to once below
        let done = false
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        const handler = () => new Promise((resolve: any) => {
          window.setTimeout(() => {
            done = true
            resolve()
          }, 20)
        })

        const c = new lab.core.Component()
        c.once('event', handler)

        return c.trigger('event').then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(done)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('accepts internal event handlers via the messageHandlers option', () => {
        const handler = () => null
        b = new lab.core.Component({
          messageHandlers: {
            'someEvent': handler
          }
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.include(
          b.internals.callbacks['$someEvent'],
          handler
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('resolves promises via waitFor', () => {
        const p = b.waitFor('foo').then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(true)
        })

        b.triggerMethod('foo')

        return p
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Responses', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('maps responses onto event handlers', () => {
        b.options.responses = {
          'click': 'response_keypress'
        }

        // Attach a spy to the respond method
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy(b, 'respond')

        return b.run().then(() => {
          // Test whether the click triggers
          // a respond method call
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notOk(spy.called)
          b.options.el.click()
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(spy.withArgs('response_keypress').calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(spy.calledOnce)

          // Cleanup
          return b.end()
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('classifies correct responses as such', () => {
        // Define a correct response
        b.options.correctResponse = 'foo'

        // Run the component
        return b.run().then(() => {
          // Trigger a response
          b.respond('foo')

          // Check the classification
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.data.correct, true)

          // Check that the resulting status is ok
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.data.ended_on, 'response')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('classifies incorrect responses as such', () => {
        // Same as above
        b.options.correctResponse = 'foo'

        return b.run().then(() => {
          b.respond('bar')

          // Check classification
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.data.correct, false)

          // Check that the resulting status is ok
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.data.ended_on, 'response')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('accepts timestamp for response', () => {
        return b.run().then(() => {
          b.respond('bar', 123)

          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(b.internals.timestamps.end, 123)
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('saves event timestamp if available', () => {
        // See above for a fully commented, very similar test
        b.options.el = document.querySelector('[data-labjs-section="main"]')

        b.options.responses = {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
          'keypress(a)': sinon.spy(),
        }

        // Fake timers
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const clock = sinon.useFakeTimers(123)
        if (!performance.timing) {
          // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'timing' because it is a read-onl... Remove this comment to see the full error message
          performance.timing = { navigationStart: 999 }
        }

        return b.run().then(() => {
          const b_pressed = simulateKeyPress('a', b.options.el)

          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(
            b.internals.timestamps.end === b_pressed.timeStamp ||
            // If the event does not provide a high-res timeStamp,
            // we measure the time in the library as a fall-back.
            b.internals.timestamps.end === performance.now()
          )

          clock.restore()
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Parameters', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          c.aggregateParameters,
          {
            foo: 'bar',
            baz: 'queer',
            bar: 'bloop'
          }
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('proxies writes to parameter property', () => {
        const c = new lab.core.Component()
        c.parameters.foo = 'bar'

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.parameters.foo,
          'bar'
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('proxies reads from parameter property', () => {
        const c = new lab.core.Component()
        const s = new lab.flow.Sequence({
          content: [c],
          parameters: {
            foo: 'bar'
          }
        })

        return s.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            c.parameters.foo,
            'bar'
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('commits parameters alongside data', () => {
        const c = new lab.core.Dummy()

        // (parameter inheritance is tested elsewhere)
        c.options.datastore = new lab.data.Store()
        c.options.parameters['foo'] = 'bar'

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.stub(c, 'commit')

        c.run().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(spy.calledOnce)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            spy.firstCall.args[0]['foo'],
            'bar'
          )
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Options', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('mirrors options to internals.rawOptions', () => {
        const c = new lab.core.Component({
          demoOption: 'demo value',
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(c.internals.rawOptions.demoOption, 'demo value')

        c.options.demoOption = 'changed value'
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(c.internals.rawOptions.demoOption, 'changed value')
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('retrieves options via internals.parsedOptions', () => {
        const c = new lab.core.Component({
          demoOption: 'demo value',
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(c.options.demoOption, 'demo value')

        c.internals.parsedOptions.demoOption = 'substituted value'
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(c.options.demoOption, 'substituted value')
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('parses options that are included in parsableOptions during prepare', () => {
        // As below, this would be more cleanly
        // tested using a custom component class.
        const c = new lab.core.Component({
          correctResponse: '${ parameters.correctResponse }',
          parameters: {
            correctResponse: 'inserted value',
          },
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notEqual(
          c.options.correctResponse, 'inserted value'
        )

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            c.options.correctResponse, 'inserted value'
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('doesn\'t parse options that are not included in parsableOptions', () => {
        const c = new lab.core.Component({
          foo: '${ parameters.foo }',
          parameters: {
            foo: 'bar',
          }
        })

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.options.foo, '${ parameters.foo }')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('coerces types where requested', () => {
        const c = new lab.core.Component({
          timeout: '${ parameters.timeout }',
          parameters: {
            timeout: '123',
          },
        })

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.options.timeout, 123)
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(typeof c.options.timeout, 'number')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('recursively parses options when outputtype is \'object\'', () => {
        const c = new lab.canvas.Screen({
          content: [
            { text: '${ parameters.foo }' }
          ],
          parameters: {
            foo: 'bar',
          },
        })

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.options.content[0].text, 'bar')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(
          Object.keys(s.constructor.metadata.parsableOptions)
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'includes' does not exist on type 'string... Remove this comment to see the full error message
            .includes('correctResponse')
        )

        return s.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(s.options.correctResponse, 'Hello world!')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('makes available component parameters through this', () => {
        const c = new lab.core.Component({
          correctResponse: '${ this.parameters.foo }',
        })
        c.parameters.foo = 'Hooray!'

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.options.correctResponse, 'Hooray!')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('does not allow code execution in template', () => {
        const c = new lab.core.Component({
          correctResponse: '<% print("I am evil"); %>!',
        })

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.notEqual(c.options.correctResponse, 'I am evil!')
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('automatically parses options set after preparing', () => {
        const c = new lab.core.Component({
          parameters: {
            foo: 'bar',
          },
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(c.options.correctResponse, null)

        return c.prepare().then(() => {
          c.options.correctResponse = '${ parameters.foo }'
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.internals.rawOptions.correctResponse, '${ parameters.foo }')
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.internals.parsedOptions.correctResponse, 'bar')
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.options.correctResponse, 'bar')
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Files', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('makes available files through placeholders', () => {
        const c = new lab.html.Screen({
          files: {
            'local/fancy.png': 'remote/long-uninteresting-hashed-url.png',
          },
          content: '<img src="${ files[\'local/fancy.png\'] }">'
        })

        return c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            c.options.content,
            '<img src="remote/long-uninteresting-hashed-url.png">'
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('inherits files from parent components', () => {
        const c = new lab.core.Component()
        const s = new lab.flow.Sequence({
          files: {
            'local/fromParent.png': 'remote/fromParent.png',
          },
          content: [c]
        })

        return s.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            c.files['local/fromParent.png'],
            'remote/fromParent.png'
          )
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Data', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('data store is automatically initialized during preparation', () => {
        return b.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.instanceOf(
            b.options.datastore,
            lab.data.Store
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('data store is passed to nested components', () => {
        const s = new lab.flow.Sequence({
          content: [b]
        })

        return s.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.strictEqual( // Must be the same instance
            s.options.datastore,
            b.options.datastore
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('state property reads from data store', () => {
        b.options.datastore = new lab.data.Store()
        b.options.datastore.set('foo', 'bar')

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          b.state.foo,
          'bar'
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('state property writes to data store', () => {
        b.options.datastore = new lab.data.Store()
        b.state.foo = 'bar'

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          b.options.datastore.state.foo,
          'bar'
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('commit method passes data to data store', () => {
        b.options.datastore = new lab.data.Store()

        // Spy on the datastore's commit method
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy(b.options.datastore, 'commit')

        b.commit({ 'foo': 'bar' })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          spy.firstCall.args[0].foo,
          'bar'
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('commits data automatically when ending', () => {
        // Spy on the commit method
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy(b, 'commit')

        // Supply the Component with a data store
        // (it won't commit otherwise)
        b.options.datastore = new lab.data.Store()

        // Make sure the commit method was run
        return b.run().then(
          () => b.end()
        ).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(spy.calledOnce)
        })
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Hierarchy traversal', () => {
      let a: any, b: any, c: any

      // Note that this is somewhat hackish --
      // a hierarchy of simple core.Components
      // will not prepare nested components
      // properly. However, it seemed smarter
      // not to rely on, e.g. flow.Sequences
      // at this point to simplify testing.
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
      beforeEach(() => {
        a = new lab.core.Component()
        b = new lab.core.Component()
        c = new lab.core.Component()

        c.parent = b
        b.parent = a
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('provides parents attribute', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          c.parents,
          [a, b]
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('saves root component internally', () =>
        c.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(c.internals.root, a)
        })
      )

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('root component is undefined for topmost component', () =>
        a.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(a.internals.root, undefined)
        })
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Utilities', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('provides a type property', () => {
        const c = new lab.core.Component()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.type,
          'core.Component'
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('creates a clone of itself', () => {
        const a = new lab.core.Component()
        a.options.foo = 'bar'
        const b = a.clone()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          a.options,
          b.options
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('incorporates additional options into clones', () => {
        const a = new lab.core.Component()
        a.options.constantProperty = 'original'
        a.options.overwrittenProperty = 'original'

        const b = a.clone({ overwrittenProperty: 'modified' })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          b.options.constantProperty,
          'original'
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          b.options.overwrittenProperty,
          'modified'
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('instantiates directly nested components during cloning', () => {
        const c = new lab.core.Component()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy(c, 'clone')

        const f = new lab.html.Frame({
          content: c
        })
        const f1 = f.clone()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('instantiates nested components in list during cloning', () => {
        const c = new lab.core.Component()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy(c, 'clone')

        const s = new lab.flow.Sequence({
          content: [c]
        })
        const s1 = s.clone()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.calledOnce)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('provides additional output to console if debug option is set', () => {
        // Yes, I am a slave to test coverage -FH
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(console, 'log')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(console, 'info')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(console, 'group')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(console, 'time')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(console, 'timeEnd')

        const c = new lab.core.Dummy({
          debug: true
        })

        const p = c.waitFor('epilogue')

        return c.run()
          .then(() => p)
          .then(() => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(console.log.called)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(console.info.called)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(console.group.called)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(console.time.called)
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (...d... Remove this comment to see the full error message
            console.log.restore()
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (...d... Remove this comment to see the full error message
            console.info.restore()
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (...d... Remove this comment to see the full error message
            console.group.restore()
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (labe... Remove this comment to see the full error message
            console.time.restore()
            // Wait a moment to avoid errors
            // (the epilogue event is not yet over)
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (labe... Remove this comment to see the full error message
            window.setTimeout(() => console.timeEnd.restore(), 0)
          })
      })
    })

  }) // Component

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Plugin API', () => {
    let c: any, plugin: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      c = new lab.core.Component()
      plugin = {
        handle: (context: any, event: any, args: any) => null
      }
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds and initializes new plugins', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(c.plugins.plugins, [])

      // Add plugin
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(plugin, 'handle')
      c.plugins.add(plugin)

      // Check result
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(c.plugins.plugins, [plugin])
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        spy.calledWith(c, 'plugin:init')
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('removes plugins if requested', () => {
      c.plugins.add(plugin)

      // Remove plugin
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(plugin, 'handle')
      c.plugins.remove(plugin)

      // Check result
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(c.plugins.plugins, [])
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        spy.calledWith(c, 'plugin:removal')
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('passes events to plugins', () => {
      c.plugins.add(plugin)

      // Setup spy
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(plugin, 'handle')
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.notOk(spy.called)

      // Trigger event and record results
      c.plugins.trigger('foo', 1, 2, 3)
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        spy.calledWith(c, 'foo', 1, 2, 3)
      )
    })
  })
})

})
