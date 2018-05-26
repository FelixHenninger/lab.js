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

    it('collects url parameters', () => {
      const c = new lab.core.Component({
        plugins: [
          new lab.plugins.Metadata({
            location_search: '?foo=bar&baz=123'
          }),
        ],
        datastore: new lab.data.Store(),
      })

      return c.prepare().then(() => {
        assert.deepEqual(
          c.options.datastore.staging.url,
          { foo: 'bar', baz: '123' }
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
      c = new lab.core.Dummy({
        datastore: new lab.data.Store(),
        plugins: [ p ],
      })

      sinon.stub(c.options.datastore, 'transmit')
        .callsFake(() => Promise.resolve())

      sinon.stub(c.options.datastore, 'queueIncrementalTransmission')
    })

    afterEach(() => {
      // Cancel transmission queue
      c.options.datastore._debouncedTransmit.cancel()

      // Restore stubs
      c.options.datastore.transmit.restore()
      c.options.datastore.queueIncrementalTransmission.restore()
    })

    it('queues incremental transmission before epilogue event', () => {
      // Disable final transmission
      p.updates.full = false

      // Data transmission runs last,
      // so we need to wait for the corresponding event
      const epiloguePromise = c.waitFor('epilogue')

      return c.run().then(() =>
        epiloguePromise
      ).then(() => {
        assert.ok(
          c.options.datastore.queueIncrementalTransmission.withArgs(
            'https://arbitrary.example',
            { id: p.metadata.id, payload: 'incremental' }
          ).calledOnce
        )
      })
    })

    it('sends complete dataset when component ends', () => {
      // Disable incremental transmissions
      p.updates.incremental = false

      const epiloguePromise = c.waitFor('epilogue')

      return c.run().then(() =>
        // TODO: This is super-hacky, basically it's very hard
        // to wait for the epilogue event to occur before
        // triggering the tests. So here, we don't just wait
        // for the epilogue event, but for a minimum of 200ms.
        // There really should be a better way of handling this.
        Promise.all([
          epiloguePromise,
          new Promise(resolve => window.setTimeout(resolve, 200)),
        ])
      ).then(() => {
        assert.ok(c.options.datastore.transmit.calledOnce)
        assert.ok(
          c.options.datastore.transmit.withArgs(
            'https://arbitrary.example',
            { id: p.metadata.id, payload: 'full' },
          ).calledOnce
        )
      })
    })
  })
})

})
