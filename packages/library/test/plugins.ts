/* global define, describe, it, sinon, assert, beforeEach */
/* eslint-disable import/no-amd */

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'define'.
define(['lab'], (lab: any) => {

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Plugins', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Logger', () => {
    let fakeLog: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
      fakeLog = sinon.stub(console, 'log').returns(undefined)
    })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '{ (...d... Remove this comment to see the full error message
      console.log.restore()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('logs events to console', () => {
      const c = new lab.core.Component({
        plugins: [
          new lab.plugins.Logger({ title: 'FancyComponent' }),
        ],
      })

      c.trigger('SomeEvent')

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.ok(
        fakeLog
          .withArgs('Component FancyComponent received SomeEvent')
          .calledOnce
      )
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Metadata', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('saves metadata during preparation', () => {
      const c = new lab.core.Component({
        plugins: [
          new lab.plugins.Metadata(),
        ],
      })

      return c.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.include(
          c.options.datastore.staging.meta,
          { userAgent: window.navigator.userAgent },
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          c.options.datastore.staging.url,
          { foo: 'bar', baz: '123' }
        )
      })
    })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Transmit', () => {

    let c: any, p: any
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      p = new lab.plugins.Transmit({
        url: 'https://arbitrary.example',
      })
      c = new lab.core.Dummy({
        datastore: new lab.data.Store(),
        plugins: [ p ],
      })

      return c.prepare().then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(c.options.datastore, 'transmit')
          // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
          .callsFake(() => Promise.resolve())

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(c.options.datastore, 'queueIncrementalTransmission')
      })
    })

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      // Cancel transmission queue
      c.options.datastore._debouncedTransmit.cancel()

      // Restore stubs
      c.options.datastore.transmit.restore()
      c.options.datastore.queueIncrementalTransmission.restore()
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('queues incremental transmission before epilogue event', () => {
      // Disable final transmission
      p.updates.full = false

      // Data transmission runs last,
      // so we need to wait for the corresponding event
      const epiloguePromise = c.waitFor('epilogue')

      return c.run().then(() =>
        epiloguePromise
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          c.options.datastore.queueIncrementalTransmission.withArgs(
            'https://arbitrary.example',
            { id: p.metadata.id, payload: 'incremental' }
          ).calledOnce
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        Promise.all([
          epiloguePromise,
          // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
          new Promise((resolve: any) => window.setTimeout(resolve, 50)),
        ])
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(c.options.datastore.transmit.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          c.options.datastore.transmit.withArgs(
            'https://arbitrary.example',
            { id: p.metadata.id, payload: 'full' },
          ).calledOnce
        )
      });
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('triggers callback after full transmission', () => {
      const epiloguePromise = c.waitFor('epilogue')
      p.callbacks = {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        full: sinon.spy()
      }

      return c.run().then(() =>
        // TODO: As above
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        Promise.all([
          epiloguePromise,
          // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
          new Promise((resolve: any) => window.setTimeout(resolve, 200)),
        ])
      ).then(() => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(
          p.callbacks.full.calledOnce
        )
      });
    })
  })
})

})
