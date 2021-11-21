/* global define, describe, it, beforeEach, assert, sinon */
/* eslint-disable import/no-amd */

define(['lab'], (lab) => {

describe('Data handling', () => {
  describe('Store', () => {
    let ds

    beforeEach(() => {
      ds = new lab.data.Store({})
    })

    describe('Data transmission', () => {
      beforeEach(() => {
        // Simulate a response as suggested by R.J. Zaworski (MIT licenced)
        // http://rjzaworski.com/2015/06/testing-api-requests-from-window-fetch

        const res = new window.Response('', {
          status: 200,
          headers: {
            'Content-type': 'application/json'
          }
        })

        // Stub window.fetch to return the response,
        // wrapped in a promise
        sinon.stub(window, 'fetch').resolves(res)

        // Commit data to data store as well as staging area
        ds.commit({ 'one': 1, 'two': 2 })
        ds.commit({ 'three': 3, 'four': 4 })
        ds.set('five', 5)
      })

      afterEach(() => {
        window.fetch.restore()
      })

      // Extract data from stringified payload
      const extractData = (fetchArgs) =>
        JSON.parse(fetchArgs[1]['body'])['data']

      it('gives up retrying eventually', () => {
        window.fetch.restore()

        // Abandon all hope, ye who enter here
        const fetch = sinon.stub(window, 'fetch')
        fetch.callsFake(() => Promise.reject('gonna nope right out of this'))

        return ds.transmit('https://random.example', {}, {
          retry: { delay: 1, factor: 1 }
        }).catch((error) => {
          assert.equal(error, 'gonna nope right out of this')
          assert.equal(fetch.callCount, 5)
        })
      })

      it('logs last incrementally transmitted row', () => {
        const queue = ds.transmissionQueue(0)

        return queue.queueTransmission('https://random.example', {})
          .then(() => {
            assert.equal(queue.lastTransmission, 2)

            // Add new row and transmit again
            ds.commit()
            return queue.queueTransmission('https://random.example', {})
          }).then(() => {
            assert.equal(queue.lastTransmission, 3)
          })
      })

      it('can debounce transmissions', () => {
        const clock = sinon.useFakeTimers()

        const queue = ds.transmissionQueue()
        queue.queueTransmission('https://random.example')
        clock.tick(100)
        assert.notOk(window.fetch.called)
        clock.tick(2400)
        assert.ok(window.fetch.called)

        clock.restore()
      })

      it('sends all new data with debounced transmission', () => {
        const clock = sinon.useFakeTimers()

        const queue = ds.transmissionQueue()
        queue.queueTransmission('https://random.example')
        ds.commit({ six: 6 })
        queue.queueTransmission('https://random.example')
        clock.runAll()

        assert.ok(window.fetch.calledOnce)
        assert.deepEqual(
          extractData(window.fetch.firstCall.args),
          ds.data
        )

        clock.restore()
      })

      it('sends data in increments', async () => {
        const clock = sinon.useFakeTimers({
          toFake: ['setTimeout', 'clearTimeout']
        })

        // Queue and transmit first batch of data
        const queue = ds.transmissionQueue()
        queue.queueTransmission('https://random.example')

        // Fast-forward through first transmission
        await clock.runAllAsync()
        assert.ok(window.fetch.calledOnce)

        window.fetch.resetHistory()

        // Add new data, and transmit it
        ds.set({ six: 6 })
        ds.commit()
        queue.queueTransmission('https://random.example')

        // Fast-forward again
        await clock.runAllAsync()
        clock.restore()

        assert.ok(window.fetch.calledOnce)
        assert.deepEqual(
          extractData(window.fetch.lastCall.args),
          [{ five: 5, six: 6 }]
        )
      })

    })
  })
})

})
