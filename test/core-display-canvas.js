describe('Canvas-based elements', () => {

  describe('Helper functions', () => {
    it('Inserts a canvas into the page if necessary')
    it('Does not insert a canvas if provided with one')
    it('Sets canvas width and height correctly')
  })

  describe('CanvasScreen', () => {
    it('Binds render function to element')
    it('Selects 2d canvas context by default')
    it('Executes render function to draw on element when run')
  })

  describe('CanvasSequence', () => {
    it('Adds canvas to hand-me-downs')
    it('Complains if any nested elements are not CanvasScreens')
    it('Runs canvas drawing operations in sequence')
  })
})
