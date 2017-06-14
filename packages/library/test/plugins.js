/* global describe, it, assert, lab */

describe('Plugins', () => {
  describe('Metadata', () => {
    it('saves metadata to component during preparation', () => {
      const c = new lab.core.Component({
        plugins: [
          new lab.plugins.Metadata(),
        ],
      })

      return c.prepare().then(() => {
        assert.include(
          c.data.meta,
          { userAgent: window.navigator.userAgent },
        )
      })
    })
  })
})
