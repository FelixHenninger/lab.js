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

    it('saves metadata directly to datastore, if there is one', () => {
      const c = new lab.core.Component({
        plugins: [
          new lab.plugins.Metadata(),
        ],
        datastore: new lab.data.Store(),
      })

      return c.prepare().then(() => {
        assert.include(
          c.options.datastore.staging.meta,
          { userAgent: window.navigator.userAgent },
        )
      })
    })
  })
})
