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
    it('Adds canvas to hand-me-downs')
    it('Complains if any nested elements are not CanvasScreens')
    it('Runs canvas drawing operations in sequence')
  })
})
