/* global define, describe, it, beforeEach, assert, sinon */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('Canvas-based components', () => {

  let clock
  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('Helper functions', () => {
    let c

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

    afterEach(() => {
      document.body.removeChild(c.options.el)
    })

    it('inserts a canvas into the page if necessary', () =>
      c.run().then(() => {
        // Check whether a canvas has been
        // inserted into the page
        const canvas = c.internals.context.el.querySelector('canvas')
        assert.ok(canvas)
        assert.equal(canvas, c.internals.canvas)
      })
    )

    // TODO: The screen will, by default, scale according to the
    // devicePixelRatio constant. This is disabled here. Ideally,
    // the tests would be revised to reflect that the scaling is
    // activated by default.
    it('sets canvas width and height correctly', () => {
      // Set dimensions on the surrounding element
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      return c.run().then(() => {
        assert.equal(
          c.internals.canvas.height,
          200
        )
        assert.equal(
          c.internals.canvas.width,
          300
        )
        assert.equal(
          c.internals.canvas.height,
          c.internals.context.el.clientHeight,
          'canvas height set correctly'
        )
        assert.equal(
          c.internals.canvas.width,
          c.internals.context.el.clientWidth,
          'canvas width set correctly'
        )
      })
    })

    it('accounts for device pixel ratios', () => {
      c.options.devicePixelScaling = true

      // Set dimensions on the surrounding element
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      // Set devicePixelRatio to arbitrary value
      const oldDevicePixelRatio = window.devicePixelRatio
      const fakeDevicePixelRatio = 2.5
      window.devicePixelRatio = fakeDevicePixelRatio

      return c.run().then(() => {
        assert.equal(
          c.internals.canvas.height,
          c.internals.context.el.clientHeight * fakeDevicePixelRatio,
          'canvas height set correctly',
        )

        assert.equal(
          c.internals.canvas.width,
          c.internals.context.el.clientWidth * fakeDevicePixelRatio,
          'canvas width set correctly',
        )

        // Reset devicePixelRatio
        window.devicePixelRatio = oldDevicePixelRatio
      })

    })
  })

  describe('Screen', () => {
    let c

    beforeEach(() => {
      // Reset screen
      c = new lab.canvas.Screen({
        el: document.createElement('div'),
        devicePixelScaling: false,
      })
      document.body.appendChild(c.options.el)
    })

    afterEach(() => {
      document.body.removeChild(c.options.el)
    })

    it('executes render function when run', () => {
      c.options.renderFunction = sinon.spy()

      // Check that the function is called
      return c.run().then(
        () => clock.next()
      ).then(() => {
        assert.ok(
          c.options.renderFunction.calledOnce
        )
      })
    })

    it('runs render function in component context', () => {
      c.options.renderFunction = sinon.spy()

      // Check function binding
      return c.run().then(
        () => clock.next()
      ).then(() => {
        assert.ok(c.options.renderFunction.calledOnce)
        assert.ok(c.options.renderFunction.alwaysCalledOn(c))
      })
    })

    it('selects 2d canvas context by default',
      () => c.run().then(() => {
        assert.ok(
          c.internals.ctx instanceof CanvasRenderingContext2D
        )
      })
    )

    it('calls window.cancelAnimationFrame when it ends', () => {
      // Stub window.cancelAnimationFrame
      const fake_cAF = sinon.stub(window, 'cancelAnimationFrame')

      // Run and end the Screen
      return c.run()
        .then(() => c.end())
        .then(() => {
          // Check that cancelAnimationFrame was called
          assert.ok(
            fake_cAF.calledOnce
          )

          // Restore window.cancelAnimationFrame
          window.cancelAnimationFrame.restore()
        })
    })

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
        c.internals.ctx.fillRect(
          -5, -5, 10, 10,
        )

        // Reset transform, so that tests
        // are performed using standard coordinates
        c.internals.ctx.setTransform(1, 0, 0, 1, 0, 0)
        // TODO: Some beautiful day, Safari will
        // support the simpler standard (then, this
        // can also be used in several places below)
        // Please see https://developer.mozilla.org/en-US/docs/Web/API/
        //   CanvasRenderingContext2D/resetTransform#Browser_compatibility
        //c.options.ctx.resetTransform()

        // Compute center coordinates
        const [cx, cy] = [
          c.internals.canvas.width / 2,
          c.internals.canvas.height / 2,
        ]

        // TODO: Some beautiful day, we'll refactor
        // this color checking command into an easy-to-use helper
        assert.deepEqual(
          Array.from(
            c.internals.ctx
              .getImageData(cx, cy, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Canvas center should be filled',
        )

      })
    })

    it('can use a standard coordinate system if requested', () => {
      c.options.translateOrigin = false

      // ... as above
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      return c.run().then(() => {
        c.internals.ctx.fillRect(
          -5, -5, 10, 10,
        )

        c.internals.ctx.setTransform(1, 0, 0, 1, 0, 0)

        assert.deepEqual(
          Array.from(
            c.internals.ctx
              .getImageData(0, 0, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Canvas top left corner should be filled',
        )
      })

    })

    it('scales content to fit available space', () => {
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      // Scale contents 2x
      c.options.viewport = [150, 100]

      return c.run().then(() => {
        c.internals.ctx.fillRect(
          -5, -5, 10, 10,
        )

        c.internals.ctx.setTransform(1, 0, 0, 1, 0, 0)

        assert.deepEqual(
          Array.from(
            c.internals.ctx
              .getImageData(150, 90, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Center rectangle should be 20px high',
        )
      })
    })

    it('chooses scale to fill one dimension', () => {
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'
      c.options.viewport = [100, 100]

      const d = new lab.canvas.Screen()
      d.options = { ...c.options }

      // The basic logic here is to fill a 100x100
      // viewport entirely, and check that the scaled
      // result extends to the appropriate borders.
      // We repeat this twice, first with a landscape-
      // then with a portrait-oriented canvas

      return c.run().then(() => {
        c.internals.ctx.fillRect(
          -50, -50, 100, 100,
        )

        c.internals.ctx.setTransform(1, 0, 0, 1, 0, 0)

        assert.deepEqual(
          Array.from(
            c.internals.ctx
              .getImageData(10, 100, 1, 1)
              .data
          ),
          [0, 0, 0, 0],
          'Canvas left edge should be empty',
        )

        assert.deepEqual(
          Array.from(
            c.internals.ctx
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
        d.internals.ctx.fillRect(
          -50, -50, 100, 100,
        )

        d.internals.ctx.setTransform(1, 0, 0, 1, 0, 0)

        assert.deepEqual(
          Array.from(
            d.internals.ctx
              .getImageData(10, 150, 1, 1)
              .data
          ),
          [0, 0, 0, 255],
          'Canvas center left should be filled',
        )

        assert.deepEqual(
          Array.from(
            d.internals.ctx
              .getImageData(100, 10, 1, 1)
              .data
          ),
          [0, 0, 0, 0],
          'Canvas top should be empty',
        )
      })
    })

    it('can scale the canvas by an arbitrary factor', () => {
      c.options.viewportScale = 3.14

      return c.run()
        .then(() => {
          const transform = c.internals.ctx.getTransform()

          // Approximate comparisons to account for floating point error
          assert.isBelow(
            Math.abs(transform['a'] - 3.14),
            0.001
          )
          assert.isBelow(
            Math.abs(transform['d'] - 3.14),
            0.001
          )
        })
    })

    it('can draw viewport border if requested', () => {
      c.options.el.style.height = '200px'
      c.options.el.style.width = '200px'
      c.options.viewport = [100, 100]
      c.options.viewportEdge = true

      return c.run().then(() => {
        clock.runToFrame()
        c.internals.ctx.setTransform(1, 0, 0, 1, 0, 0)

        assert.deepEqual(
          Array.from(
            c.internals.ctx
              .getImageData(199, 199, 1, 1)
              .data
          ),
          [ 229, 229, 229, 255 ],
          'Border should be drawn in bottom left corner',
        )
      })
    })

    it('scales coordinates to account for device pixel ratios', () => {
      // Create artificial canvas
      c.options.viewportScale = 1
      c.options.devicePixelScaling = true

      const oldDevicePixelRatio = window.devicePixelRatio
      window.devicePixelRatio = 2.5

      return c.run()
        .then(() => {
          const transform = c.internals.ctx.getTransform()

          assert.equal(
            transform['a'], window.devicePixelRatio,
          )
          assert.equal(
            transform['d'], window.devicePixelRatio,
          )

          window.devicePixelRatio = oldDevicePixelRatio
        })
    })

    it('saves and resets canvas transformations to original values', () => {
      // Create artificial canvas
      c.options.el.style.height = '400px'
      c.options.el.style.width = '400px'

      // Render square in the center of the canvas
      c.options.renderFunction = (ts, canvas, ctx) =>
        ctx.fillRect(
          -50, -50, 100, 100,
        )

      return c.run()
        // Wait for rendering to complete
        .then(
          () => clock.next()
        ).then(() => {
          assert.deepEqual(
            Array.from(
              c.internals.ctx
                .getImageData(200, 200, 1, 1)
                .data
            ),
            [ 0, 0, 0, 255 ],
            'Coordinate system origin should be translated into the center',
          )

          return c.end()
        }).then(() => {
          // Draw second rectangle with the same coordinates
          c.internals.ctx
            .fillRect(-50, -50, 100, 100)

          assert.deepEqual(
            Array.from(
              c.internals.ctx
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

  describe('Frame', () => {

    let f, s, a, b
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

    afterEach(() => {
      document.body.removeChild(f.options.el)
    })

    it('provides canvas to nested components', () =>
      f.prepare().then(() => {
        assert.deepEqual(
          f.options.canvas,
          a.options.canvas,
        )
      })
    )

    it('throws error if nested components are incompatible', () => {
      s.options.content.push(new lab.html.Screen())

      return f.run().then(() => {
          assert.ok(false, 'Component should throw error during setup')
        }).catch(err => {
          assert.equal(
            err.message,
            'canvas.Frame may only contain flow or canvas-based components',
          )
        })
    })

    it('throws error if the context does not contain a canvas element', () => {
      f.options.context = '<div>Nope</div>'
      // Suppress error message
      const stub = sinon.stub(console, 'error')

      return f.run().then(() => {
          assert.ok(false, 'Component should throw error during setup')
        }).catch(err => {
          assert.equal(
            err.message,
            'No canvas found in canvas.Frame context',
          )
          stub.restore()
        })
    })

    it('hands down the canvas parent element', () => {
      f.options.context = '<div id="canvas-parent"><canvas></div>'

      return f.run().then(() =>
        assert.equal(
          f.options.el.querySelector('div#canvas-parent'),
          a.internals.context.el,
        )
      )
    })

    it('hands down working el if canvas is at top level in context', () => {
      // ... as above, but without the wrapper
      f.options.context = '<canvas>'

      return f.run().then(() =>
        assert.equal(
          f.internals.context.el,
          a.internals.context.el,
        )
      )
    })

    it('ends with content', () =>
      // This is tested in more depth in the HTML.Frame test suite
      f.run().then(
        () => s.end()
      ).then(() => {
        assert.equal(
          f.status,
          3 // done
        )
      })
    )

    it('coordinates nested sequence', () => {
      a.options.renderFunction = (ts, canvas, ctx, screen) => {
        ctx.rect(0, 0, 10, 10)
        ctx.fill()
      }
      b.options.renderFunction = (ts, canvas, ctx, screen) => {
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
          // After drawing the first screen ...
          // ... left area should be black
          assert.deepEqual(
            Array.from(
              f.internals.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 255]
          )
          // ... right area should be empty/blank
          assert.deepEqual(
            Array.from(
              f.internals.canvas
                .getContext('2d')
                .getImageData(15, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 0]
          )
          return a.end()
        }).then(() => {
          // After drawing the second screen ...
          // ... left area should be empty
          assert.deepEqual(
            Array.from(
              f.internals.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 0]
          )
          // ... right area should be filled
          assert.deepEqual(
            Array.from(
              f.internals.canvas
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
