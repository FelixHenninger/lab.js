/* global describe, it, beforeEach, assert, lab, sinon */

describe('Canvas-based components', () => {

  describe('Helper functions', () => {
    let c

    beforeEach(() => {
      // Reset screen
      c = new lab.canvas.Screen({
        renderFunction: () => null, // dummy drawing function
        el: document.createElement('div')
      })
    })

    it('Inserts a canvas into the page if necessary', () =>
      c.run().then(() => {
        // Check whether a canvas has been
        // inserted into the page
        const canvas = c.options.el.getElementsByTagName('canvas')[0]
        assert.ok(canvas)
        assert.equal(canvas, c.options.canvas)
      })
    )

    it('Does not insert a canvas if provided with one', () => {
      // Specify a canvas for the Screen
      c.options.canvas = document.createElement('canvas')

      return c.run().then(() => {
        // The element should be empty
        assert.equal(
          c.options.el.getElementsByTagName('canvas').length,
          0
        )
      })
    })

    it('Sets canvas width and height correctly', () => {
      // Set dimensions on the surrounding element
      c.options.el.style.height = '200px'
      c.options.el.style.width = '300px'

      return c.run().then(() => {
        assert.equal(
          c.options.canvas.height,
          c.options.el.clientHeight,
          'canvas height set correctly'
        )
        assert.equal(
          c.options.canvas.width,
          c.options.el.clientWidth,
          'canvas width set correctly'
        )
      })
    })
  })

  describe('Screen', () => {
    let c

    beforeEach(() => {
      // Reset screen
      c = new lab.canvas.Screen({
        renderFunction: () => null, // dummy drawing function
        el: document.createElement('div')
      })
    })

    it('Executes render function when run', () => {
      c.options.renderFunction = sinon.spy()

      // The test here is constructed so that
      // requestAnimationFrame is called at least once.
      // Otherwise, the render function won't be triggered
      c.options.timeout = 20

      // Check that the function is called
      return c.run().then(
        () => c.waitFor('end')
      ).then(() => {
        assert.ok(
          c.options.renderFunction.calledOnce
        )
      })
    })

    it('Runs render function in component context', () => {
      c.options.renderFunction = sinon.spy()
      c.options.timeout = 20

      // Check function binding
      return c.run().then(
        () => c.waitFor('end')
      ).then(() => {
        assert.ok(c.options.renderFunction.calledOnce)
        assert.ok(c.options.renderFunction.alwaysCalledOn(c))
      })
    })

    it('Selects 2d canvas context by default',
      () => c.run().then(() => {
        assert.ok(
          c.options.ctx instanceof CanvasRenderingContext2D
        )
      })
    )

    it('Calls window.cancelAnimationFrame when it ends', () => {
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
  })

  describe('Sequence', () => {
    let s, a, b

    beforeEach(() => {
      a = new lab.canvas.Screen({
        renderFunction: () => null // dummy drawing function
      })
      b = new lab.canvas.Screen({
        renderFunction: () => null
      })
      s = new lab.canvas.Sequence()
    })

    it('Adds canvas property to hand-me-downs', () => {
      assert.include(
        s.options.handMeDowns,
        'canvas'
      )
    })

    it('Passes its canvas to nested components', () => {
      s.options.content = [a, b]
      return s.prepare().then(() => {
        // The canvas should be shared
        assert.equal(
          s.options.canvas,
          a.options.canvas
        )

        // Make sure that the canvas is actually a canvas,
        // and not some undefined value.
        assert.ok(
          b.options.canvas instanceof HTMLCanvasElement
        )
      })
    })

    it('Complains if any nested components are not canvas-based', () => {
      s.options.content = [
        a,
        new lab.html.Screen({
          content: ''
        })
      ]

      // This should cause an error
      return s.prepare()
        .catch(
          error => assert.equal(
            error.message,
            'Content component not a canvas.Screen or canvas.Sequence'
          )
        )
    })

    it('Runs canvas drawing operations in sequence', () => {
      // Stub out window.requestAnimationFrame
      // to speed up the test, and to avoid
      // probabilistic failures due to frame
      // timing during testing.
      sinon.stub(window, 'requestAnimationFrame').callsFake(fn => fn())

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

      s.options.content = [a, b]
      s.options.canvas = document.createElement('canvas')
      s.options.canvas.width = 200
      s.options.canvas.height = 200

      return s.run()
        .then(() => {
          // After drawing the first screen ...
          // ... left area should be black
          assert.deepEqual(
            Array.from(
              s.options.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 255]
          )
          // ... right area should be empty/blank
          assert.deepEqual(
            Array.from(
              s.options.canvas
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
          // After drawing the second screen ...
          // ... left area should be empty
          assert.deepEqual(
            Array.from(
              s.options.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 0]
          )
          // ... right area should be filled
          assert.deepEqual(
            Array.from(
              s.options.canvas
                .getContext('2d')
                .getImageData(15, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 255]
          )

          window.requestAnimationFrame.reset()
        })
    })
  })
})
