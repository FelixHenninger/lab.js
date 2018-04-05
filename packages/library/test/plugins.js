/* global define, describe, it, sinon, assert, beforeEach */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('Plugins', () => {
  describe('Logger', () => {
    let fakeLog
    beforeEach(() => {
      fakeLog = sinon.stub(console, 'log').returns(undefined)
    })

    afterEach(() => {
      console.log.restore()
    })

    it('logs events to console', () => {
      const c = new lab.core.Component({
        plugins: [
          new lab.plugins.Logger({ title: 'FancyComponent' }),
        ],
      })

      c.trigger('SomeEvent')

      assert.ok(
        fakeLog
          .withArgs('Component FancyComponent received SomeEvent')
          .calledOnce
      )
    })
  })

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

  describe('Transmit', () => {

    let c, p
    beforeEach(() => {
      p = new lab.plugins.Transmit({
        url: 'https://arbitrary.example',
      })
      c = new lab.core.Component({
        datastore: new lab.data.Store(),
        plugins: [ p ],
      })

      sinon.stub(c.options.datastore, 'transmit')
        .callsFake(() => Promise.resolve())
    })

    afterEach(() => {
      c.options.datastore.transmit.restore()
    })

    it('sends state on epilogue event', () => {
      return c.prepare().then(() => {
        const promise = c.waitFor('epilogue')
        c.end()
        return promise
      }).then(() => {
        assert.ok(
          c.options.datastore.transmit.withArgs(
            'https://arbitrary.example',
            { id: p.metadata.id },
            'staging',
          ).calledOnce
        )
      })
    })

    it('sends complete dataset when component ends', () => {
      // Disable staging transmissions
      // TODO: I'm not sure I like this,
      // should probably rethink the API here.
      p.updates.staging = false

      return c.run().then(() => {
        // Data transmission runs last,
        // so we need to wait for the corresponding event
        const promise = c.waitFor('epilogue')
        c.end()
        return promise
      }).then(() => {
        assert.ok(
          c.options.datastore.transmit.withArgs(
            'https://arbitrary.example',
            { id: p.metadata.id },
          ).calledOnce
        )
      })
    })
  })
})

})
