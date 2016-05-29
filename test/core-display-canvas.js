describe('Canvas-based elements', () => {

  describe('Helper functions', () => {
    let c

    beforeEach(() => {
      // Reset screen
      c = new lab.CanvasScreen(
        () => null, // dummy drawing function
        {
          el: document.createElement('div')
        }
      )
    })

    it('Inserts a canvas into the page if necessary', () => {
      // Run the CanvasScreen
      const p = c.run()
      c.end()

      // Tests
      return p.then(() => {
        // Check whether a canvas has been
        // inserted into the page
        const canvas = c.el.getElementsByTagName('canvas')[0]
        assert.ok(canvas)
        assert.equal(canvas, c.canvas)
      })
    })

    it('Does not insert a canvas if provided with one', () => {
      // Specify a canvas for the CanvasScreen
      c.canvas = document.createElement('canvas')

      const p = c.run()
      c.end()

      // Tests
      return p.then(() => {
        // The element should be empty
        assert.equal(
          c.el.getElementsByTagName('canvas').length,
          0
        )
      })
    })

    it('Sets canvas width and height correctly', () => {
      // Set dimensions on the surrounding element
      c.el.style.height = '200px'
      c.el.style.width = '300px'

      const p = c.run()
      c.end()

      // Tests
      return p.then(() => {
        assert.equal(
          c.canvas.height,
          c.el.clientHeight,
          'canvas height set correctly'
        )
        assert.equal(
          c.canvas.width,
          c.el.clientWidth,
          'canvas width set correctly'
        )
      })
    })
  })

  describe('CanvasScreen', () => {
    let c

    beforeEach(() => {
      // Reset screen
      c = new lab.CanvasScreen(
        () => null, // dummy drawing function
        {
          el: document.createElement('div')
        }
      )
    })

    it('Binds render function to element', () => {
      // Define a render function and
      // insert it into the CanvasScreen
      render_func = function() {
        return this
      }
      c.render_function = render_func

      // Preparing the element binds the
      // function to it
      c.prepare()

      // Check function binding
      assert.equal(
        c.render_function(),
        c
      )
    })

    it('Selects 2d canvas context by default', () => {
      const p = c.run()
      c.end()

      return p.then(() => {
        assert.ok(
          c.ctx instanceof CanvasRenderingContext2D
        )
      })
    })

    it('Executes render function to draw on element when run', () => {
      c.render_function = sinon.spy()

      const p = c.run().then(() => {
        assert.ok(
          c.render_function.calledOnce
        )
      })
    })

    it('Calls window.cancelAnimationFrame when it ends', () => {
      // Stub window.cancelAnimationFrame
      let fake_cAF = sinon.stub(window, 'cancelAnimationFrame');

      // Run and end the CanvasScreen
      const p = c.run()
      c.end()

      // Check that cancelAnimationFrame was called
      assert.ok(
        fake_cAF.calledOnce
      )

      // Restore window.cancelAnimationFrame
      window.cancelAnimationFrame.restore()
    })
  })

  describe('CanvasSequence', () => {
    let s, a, b

    beforeEach(() => {
      a = new lab.CanvasScreen(
        () => null // dummy drawing function
      )
      b = new lab.CanvasScreen(
        () => null
      )
      s = new lab.CanvasSequence()
    })

    it('Adds canvas property to hand-me-downs', () => {
      assert.include(
        s.hand_me_downs,
        'canvas'
      )
    })

    it('Passes its canvas to nested elements', () => {
      s.content = [a, b]
      s.prepare()

      // The canvas should be shared
      assert.equal(
        s.canvas,
        a.canvas
      )

      // Make sure that the canvas is actually a canvas,
      // and not some undefined value.
      assert.ok(
        b.canvas instanceof HTMLCanvasElement
      )
    })

    it('Complains if any nested elements are not canvas-based', () => {
      s.content = [
        a, new lab.HTMLScreen('')
      ]

      // This should cause an error
      assert.throws(
        () => s.prepare(), // Binding seems to fail without a wrapper function
        'Content element not a CanvasScreen or CanvasSequence'
      )
    })

    it('Runs canvas drawing operations in sequence', () => {
      a.render_function = (ts, canvas, ctx, screen) => {
        ctx.rect(0, 0, 10, 10)
        ctx.fill()
      }
      b.render_function = (ts, canvas, ctx, screen) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath()
        ctx.rect(10, 0, 10, 10)
        ctx.fill()
      }

      s.content = [a, b]
      s.canvas = document.createElement('canvas')
      s.canvas.width = 200
      s.canvas.height = 200

      s.run()

      return new Promise((resolve, reject) => {
          // This test includes delays because
          // drawing takes a tiny amount of time.
          // Testing shows that the timeouts could
          // be shorter, but they are left at 5ms
          // so as not to fail in slower environments.
          window.setTimeout(resolve, 5)
        })
        .then(() => {
          // After drawing the first screen ...
          // ... left area should be black
          assert.deepEqual(
            Array.from(
              s.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 255]
          )
          // ... right area should be empty/blank
          assert.deepEqual(
            Array.from(
              s.canvas
                .getContext('2d')
                .getImageData(15, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 0]
          )
          a.end()
          return new Promise((resolve, reject) => {
            window.setTimeout(resolve, 5) // Again, leave a moment to redraw
          })
        })
        .then(() => {
          // After drawing the second screen ...
          // ... left area should be empty
          assert.deepEqual(
            Array.from(
              s.canvas
                .getContext('2d')
                .getImageData(5, 5, 1, 1)
                .data
            ),
            [0, 0, 0, 0]
          )
          // ... right area should be filled
          assert.deepEqual(
            Array.from(
              s.canvas
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
