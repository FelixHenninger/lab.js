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
          c.global.datastore.staging.meta,
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
          c.global.datastore.staging.url,
          { foo: 'bar', baz: '123' }
        )
      })
    })
  })

  describe('Transmit', () => {
    beforeEach(() => {
      sinon.stub(window, 'fetch').callsFake(() => Promise.resolve())
    })

    afterEach(() => {
      // Restore stub
      window.fetch.restore()
    })

    const makeExample = async (options={}) => {
      p = new lab.plugins.Transmit({
        url: 'https://arbitrary.example',
        ...options,
      })
      c = new lab.core.Dummy({
        plugins: [ p ],
      })

      await c.prepare()
      sinon.stub(p.connection, 'enqueue').callsFake(() => Promise.resolve())

      return { c, p }
    }

    it('queues incremental transmission before epilogue event', async () => {
      // Disable final transmission
      const m = { id: 'abc' }
      const { c, p } = await makeExample({ updates: { full: false }, metadata: m })

      await c.run()
      assert.ok(p.connection.enqueue.calledOnce)
    })

    it('sends complete dataset when component ends', async () => {
      // Disable incremental transmissions
      const { c } = await makeExample({ updates: { incremental: false }})

      await c.run()
      assert.ok(window.fetch.calledOnce)
    })

    it('triggers callback after full transmission', async () => {
      const spy = sinon.spy()
      const { c } = await makeExample({
        callbacks: {
          full: spy
        }
      })
      await c.run()
      await new Promise(resolve => setTimeout(resolve, 10))
      assert.ok(spy.calledOnce) // ONCE
    })
  })
})

})
