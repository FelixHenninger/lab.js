/* global define, describe, it, beforeEach, assert, sinon */
/* eslint-disable import/no-amd */

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'define'.
define(['lab'], (lab: any) => {

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Canvas-based components', () => {

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

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Helper functions', () => {
    let c: any

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      // Reset screen
      c = new lab.canvas.Screen({
        renderFunction: () => null, // dummy drawing function
        el: document.createElement('div'),
        devicePixelScaling: false,
      })

      // Perform tests within the document,
      // so that sizing applies and can be checked
      document.body.appendChild(c.options.el)
    })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      document.body.removeChild(c.options.el)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('inserts a canvas into the page if necessary', () =>
      c.run().then(() => {
        // Check whether a canvas has been
        // inserted into the page
        const canvas = c.options.el.getElementsByTagName('canvas')[0]
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(canvas)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(canvas, c.options.canvas)
      })
    )

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not insert a canvas if provided with one', () => {
      // Specify a canvas for the Screen
      c.options.canvas = document.createElement('canvas')

      return c.run().then(() => {
        // The element should be empty
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.el.getElementsByTagName('canvas').length,
          0
        )
      })
    })

    // TODO: The screen will, by default, scale according to the
    // devicePixelRatio constant. This is disabled here. Ideally,
    // the tests would be revised to reflect that the scaling is
    // activated by default.
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets canvas width and height correctly', () => {
      // Set dimensions on the surrounding element
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      return c.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.canvas.height,
          200
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.canvas.width,
          300
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.canvas.height,
          c.options.el.clientHeight,
          'canvas height set correctly'
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.canvas.width,
          c.options.el.clientWidth,
          'canvas width set correctly'
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('accounts for device pixel ratios', () => {
      c.options.devicePixelScaling = true

      // Set dimensions on the surrounding element
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      // Set devicePixelRatio to arbitrary value
      const oldDevicePixelRatio = window.devicePixelRatio
      const fakeDevicePixelRatio = 2.5
      // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'devicePixelRatio' because it is ... Remove this comment to see the full error message
      window.devicePixelRatio = fakeDevicePixelRatio

      return c.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.canvas.height,
          c.options.el.clientHeight * fakeDevicePixelRatio,
          'canvas height set correctly',
        )

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          c.options.canvas.width,
          c.options.el.clientWidth * fakeDevicePixelRatio,
          'canvas width set correctly',
        )

        // Reset devicePixelRatio
        // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'devicePixelRatio' because it is ... Remove this comment to see the full error message
        window.devicePixelRatio = oldDevicePixelRatio
      })

    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Screen', () => {
    let c: any

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      // Reset screen
      c = new lab.canvas.Screen({
        el: document.createElement('div'),
        devicePixelScaling: false,
      })
      document.body.appendChild(c.options.el)
    })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      document.body.removeChild(c.options.el)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('executes render function when run', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      c.options.renderFunction = sinon.spy()

      // Check that the function is called
      return c.run().then(
        () => clock.next()
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          c.options.renderFunction.calledOnce
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('runs render function in component context', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      c.options.renderFunction = sinon.spy()

      // Check function binding
      return c.run().then(
        () => clock.next()
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(c.options.renderFunction.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(c.options.renderFunction.alwaysCalledOn(c))
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('selects 2d canvas context by default',
      () => c.run().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          c.options.ctx instanceof CanvasRenderingContext2D
        )
      })
    )

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('calls window.cancelAnimationFrame when it ends', () => {
      // Stub window.cancelAnimationFrame
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const fake_cAF = sinon.stub(window, 'cancelAnimationFrame')

      // Run and end the Screen
      return c.run()
        .then(() => c.end())
        .then(() => {
          // Check that cancelAnimationFrame was called
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(
            fake_cAF.calledOnce
          )

          // Restore window.cancelAnimationFrame
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '((handl... Remove this comment to see the full error message
          window.cancelAnimationFrame.restore()
        })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('translates coordinate system', () => {
      // TODO: The APIs required for directly accessing
      // the transformation matrices are not currently
      // implemented across browsers. At some later point,
      // these tests might be drastically simplified
      // because they no longer need to do actual drawing,
      // but can check the transformation matrix that
      // is set on the 2d canvas context.
      // See https://html.spec.whatwg.org/multipage/canvas.html
      // #dom-context-2d-gettransform and https://developer.mozilla.org/en-US/
      // docs/Web/API/CanvasRenderingContext2D/currentTransform
      // for further information.

      // Set canvas size
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      return c.run().then(() => {
        c.options.ctx.fillRect(
          -5, -5, 10, 10,
        )

        // Reset transform, so that tests
        // are performed using standard coordinates
        c.options.ctx.setTransform(1, 0, 0, 1, 0, 0)
        // TODO: Some beautiful day, Safari will
        // support the simpler standard (then, this
        // can also be used in several places below)
        // Please see https://developer.mozilla.org/en-US/docs/Web/API/
        //   CanvasRenderingContext2D/resetTransform#Browser_compatibility
        //c.options.ctx.resetTransform()

        // Compute center coordinates
        const [cx, cy] = [
          c.options.canvas.width / 2,
          c.options.canvas.height / 2,
        ]

        // TODO: Some beautiful day, we'll refactor
        // this color checking command into an easy-to-use helper
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            c.options.ctx
              .getImageData(cx, cy, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Canvas center should be filled',
        )

      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can use a standard coordinate system if requested', () => {
      c.options.translateOrigin = false

      // ... as above
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      return c.run().then(() => {
        c.options.ctx.fillRect(
          -5, -5, 10, 10,
        )

        c.options.ctx.setTransform(1, 0, 0, 1, 0, 0)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            c.options.ctx
              .getImageData(0, 0, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Canvas top left corner should be filled',
        )
      })

    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('scales content to fit available space', () => {
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      // Scale contents 2x
      c.options.viewport = [150, 100]

      return c.run().then(() => {
        c.options.ctx.fillRect(
          -5, -5, 10, 10,
        )

        c.options.ctx.setTransform(1, 0, 0, 1, 0, 0)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            c.options.ctx
              .getImageData(150, 90, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Center rectangle should be 20px high',
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('chooses scale to fill one dimension', () => {
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'
      c.options.viewport = [100, 100]

      const d = c.clone()

      // The basic logic here is to fill a 100x100
      // viewport entirely, and check that the scaled
      // result extends to the appropriate borders.
      // We repeat this twice, first with a landscape-
      // then with a portrait-oriented canvas

      return c.run().then(() => {
        c.options.ctx.fillRect(
          -50, -50, 100, 100,
        )

        c.options.ctx.setTransform(1, 0, 0, 1, 0, 0)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            c.options.ctx
              .getImageData(10, 100, 1, 1)
              .data
          ),
          [0, 0, 0, 0],
          'Canvas left edge should be empty',
        )

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            c.options.ctx
              .getImageData(150, 100, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Canvas center should be filled',
        )
      }).then(() => {
        // Switch dimensions
        d.options.el.style.height = '300px'
        d.options.el.style.width = '200px'

        return d.run()
      }).then(() => {
        d.options.ctx.fillRect(
          -50, -50, 100, 100,
        )

        d.options.ctx.setTransform(1, 0, 0, 1, 0, 0)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            d.options.ctx
              .getImageData(10, 150, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Canvas center left should be filled',
        )

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            d.options.ctx
              .getImageData(100, 10, 1, 1)
              .data
          ),
          [0, 0, 0, 0],
          'Canvas top should be empty',
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can scale the canvas by an arbitrary factor', () => {
      c.options.canvas = document.createElement('canvas')
      c.options.ctx = c.options.canvas.getContext('2d')
      c.options.viewportScale = 3.14

      // Spy on the context's scale method
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(c.options.ctx, 'setTransform')

      return c.run()
        .then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            spy.firstCall.args[0], 3.14
          )

          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            spy.firstCall.args[3], 3.14
          )
        })

      // This can be made nicer in the future when the
      // transformation matrix can be accessed directly,
      // wee comments below.
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('can draw viewport border if requested', () => {
      c.options.el.style.height = '200px'
      c.options.el.style.width = '200px'
      c.options.viewport = [100, 100]
      c.options.viewportEdge = true

      return c.run().then(() => {
        clock.runToFrame()
        c.options.ctx.setTransform(1, 0, 0, 1, 0, 0)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
          Array.from(
            c.options.ctx
              .getImageData(199, 199, 1, 1)
              .data
          ),
          [ 229, 229, 229, 255 ],
          'Border should be drawn in bottom left corner',
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('scales coordinates to account for device pixel ratios', () => {
      // Create artificial canvas
      c.options.canvas = document.createElement('canvas')
      c.options.ctx = c.options.canvas.getContext('2d')
      c.options.viewportScale = 1
      c.options.devicePixelScaling = true

      const oldDevicePixelRatio = window.devicePixelRatio
      // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'devicePixelRatio' because it is ... Remove this comment to see the full error message
      window.devicePixelRatio = 2.5

      // Spy on the context's scale method
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      const spy = sinon.spy(c.options.ctx, 'setTransform')

      return c.run()
        .then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            spy.firstCall.args[0], window.devicePixelRatio,
          )

          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            spy.firstCall.args[3], window.devicePixelRatio,
          )

          // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'devicePixelRatio' because it is ... Remove this comment to see the full error message
          window.devicePixelRatio = oldDevicePixelRatio
        })

      // Like the test below, this should be changed at a
      // later point to check the canvas transformation
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('saves and resets canvas transformations to original values', () => {
      // Create artificial canvas
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 400
      c.options.canvas = canvas

      // Render square in the center of the canvas
      c.options.renderFunction = (ts: any, canvas: any, ctx: any) =>
        ctx.fillRect(
          -50, -50, 100, 100,
        )

      return c.run()
        // Wait for rendering to complete
        .then(
          () => clock.next()
        ).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.deepEqual(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
            Array.from(
              c.options.ctx
                .getImageData(200, 200, 1, 1)
                .data
            ),
            [ 0, 0, 0, 255 ],
            'Coordinate system origin should be translated into the center',
          )

          return c.end()
        }).then(() => {
          // Draw second rectangle with the same coordinates
          c.options.ctx
            .fillRect(-50, -50, 100, 100)

          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.deepEqual(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
            Array.from(
              c.options.ctx
                .getImageData(0, 0, 1, 1)
                .data
            ),
            [ 0, 0, 0, 255 ],
            'Coordinate system origin should be moved back into corner',
          )

          // TODO: At some later point, the code might
          // test the transformation matrix directly
          // via ctx.getTransform(). Browser support is,
          // however, spotty at the time for writing, see:
          // https://html.spec.whatwg.org/multipage/canvas.html
          //   #dom-context-2d-gettransform
        })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Frame', () => {

    let f: any, s: any, a: any, b: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      a = new lab.canvas.Screen()
      b = new lab.canvas.Screen()
      s = new lab.flow.Sequence({
        content: [a, b],
      })
      f = new lab.canvas.Frame({
        content: s,
        el: document.createElement('div'),
      })
      document.body.appendChild(f.options.el)
    })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      document.body.removeChild(f.options.el)
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('provides canvas to nested components', () =>
      f.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          f.options.canvas,
          a.options.canvas,
        )
      })
    )

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('throws error if nested components are incompatible', () => {
      s.options.content.push(new lab.html.Screen())

      return f.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(false, 'Component should throw error during preparation')
        }).catch((err: any) => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            err.message,
            'CanvasFrame may only contain flow or canvas-based components',
          )
        });
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('throws error if the context does not contain a canvas element', () => {
      f.options.context = '<div>Nope</div>'

      return f.prepare().then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(false, 'Component should throw error during preparation')
        }).catch((err: any) => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            err.message,
            'No canvas found in context',
          )
        });
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('hands down the canvas parent element', () => {
      f.options.context = '<div id="canvas-parent"><canvas></div>'

      return f.run().then(() =>
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          f.options.el.querySelector('div#canvas-parent'),
          a.options.el,
        )
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('hands down working el if canvas is at top level in context', () => {
      // ... as above, but without the wrapper
      f.options.context = '<canvas>'

      return f.run().then(() =>
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          f.options.el,
          a.options.el,
        )
      )
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('ends with content', () =>
      // This is tested in more depth
      // in the HTML.Frame test suite
      f.run().then(
        () => s.end()
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          f.status,
          3 // done
        )
      })
    )

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('coordinates nested sequence', () => {
      a.options.renderFunction = (ts: any, canvas: any, ctx: any, screen: any) => {
        ctx.rect(0, 0, 10, 10)
        ctx.fill()
      }
      b.options.renderFunction = (ts: any, canvas: any, ctx: any, screen: any) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()
        ctx.rect(10, 0, 10, 10)
        ctx.fill()
      }

      // Don't translate the origin coordinates or scale the viewport,
      // so that canvas data can be read more easily
      f.options.devicePixelScaling = false
      a.options.translateOrigin = false
      b.options.translateOrigin = false
      a.options.viewportScale = 1
      b.options.viewportScale = 1

      return f.run()
        .then(() => {
          // This used to run clock.next(), but the epilogue event
          // uses a timer as shim for requestIdleCallback, which
          // so that resolving a single queued timer was not enough.
          clock.runToLast()

          // After drawing the first screen ...
          // ... left area should be black
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.deepEqual(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
            Array.from(
              f.options.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 255]
          )
          // ... right area should be empty/blank
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.deepEqual(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
            Array.from(
              f.options.canvas
                .getContext('2d')
                .getImageData(15, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 0]
          )
          return a.end()
        })
        .then(() => b.run())
        .then(() => {
          clock.runToLast()
          // After drawing the second screen ...
          // ... left area should be empty
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.deepEqual(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
            Array.from(
              f.options.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 0]
          )
          // ... right area should be filled
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.deepEqual(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'from' does not exist on type 'ArrayConst... Remove this comment to see the full error message
            Array.from(
              f.options.canvas
                .getContext('2d')
                .getImageData(15, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 255]
          )
        })
    })
  })
})
})
