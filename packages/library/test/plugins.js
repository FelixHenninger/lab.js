/* global define, describe, it, sinon, assert, beforeEach */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('Plugins', () => {

  // Inject a div in which DOM behavior is tested
  let demoElement
  beforeEach(() => {
    demoElement = document.createElement('div')
    demoElement.dataset.labjsSection = 'main'
    document.body.appendChild(demoElement)
  })

  afterEach(() => {
    document.body.removeChild(demoElement)
  })

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

      c.internals.emitter.trigger('SomeEvent')

      assert.ok(
        fakeLog
          .withArgs('Component FancyComponent received SomeEvent')
          .calledOnce
      )
    })
  })

  describe('Metadata', () => {
    it('saves metadata during preparation', () => {
      const c = new lab.core.Component({
        plugins: [
          new lab.plugins.Metadata(),
        ],
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
        plugins: [ p ],
      })

      return c.prepare().then(() => {
        sinon.stub(c.internals.controller.global.datastore, 'transmit')
          .callsFake(() => Promise.resolve())

        sinon.stub(p.queue, 'queueTransmission')
      })
    })

    afterEach(() => {
      // Cancel transmission queue
      p.queue.cancel()

      // Restore stubs
      c.internals.controller.global.datastore.transmit.restore()
      p.queue.queueTransmission.restore()
    })

    it('queues incremental transmission before epilogue event', () => {
      // Disable final transmission
      p.updates.full = false

      // Data transmission runs last,
      // so we need to wait for the corresponding event
      const endPromise = c.internals.emitter.waitFor('end')

      return c.run().then(() =>
        endPromise
      ).then(() => {
        assert.ok(
          p.queue.queueTransmission.withArgs(
            'https://arbitrary.example',
            { id: p.metadata.id, payload: 'incremental' }
          ).calledOnce
        )
      })
    })

    it('sends complete dataset when component ends', () => {
      // Disable incremental transmissions
      p.updates.incremental = false

      const endPromise = c.internals.emitter.waitFor('end')

      return c.run().then(() =>
        endPromise,
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

    it('triggers callback after full transmission', () => {
      const endPromise = c.internals.emitter.waitFor('end')
      p.callbacks = {
        full: sinon.spy()
      }

      return c.run().then(() =>
        endPromise,
      ).then(() => {
        assert.ok(
          p.callbacks.full.calledOnce
        )
      })
    })
  })
})

})
