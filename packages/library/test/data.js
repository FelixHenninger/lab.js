/* global describe, it, beforeEach, assert, sinon */

define(['lab'], (lab) => {

describe('Data handling', () => {
  describe('Store', () => {
    let ds

    beforeEach(() => {
      ds = new lab.data.Store({})
    })

    it('loads', () => {
      assert.deepEqual(ds.state, {})
      assert.deepEqual(ds.data, [])
    })

    describe('Storage', () => {
      it('stores individual values', () => {
        ds.set('one', 1)
        assert.deepEqual(
          ds.state,
          {
            'one': 1,
          }
        )
      })

      it('stores objects', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        assert.deepEqual(
          ds.state,
          {
            'one': 1,
            'two': 2
          }
        )
      })
    })

    describe('Retrieval', () => {
      it('retrieves individual values', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        assert.equal(ds.get('one'), ds.state.one)
        assert.equal(ds.get('two'), ds.state.two)
      })

      it('can extract individual columns from the data', () => {
        ds.commit({
          'column_1': 1,
          'column_2': 'a'
        })
        ds.commit({
          'column_1': 2,
          'column_2': 'b'
        })

        assert.deepEqual(
          ds.extract('column_1'),
          [1, 2]
        )
        assert.deepEqual(
          ds.extract('column_2'),
          ['a', 'b']
        )
      })

      it('can filter by sender when extracting columns', () => {
        ds.commit({
          'sender': 'relevantScreen',
          'column_1': 'foo'
        })
        ds.commit({
          'sender': 'irrelevantScreen',
          'column_1': 'bar'
        })
        ds.commit({
          'sender': 'relevantScreen',
          'column_1': 'baz'
        })

        assert.deepEqual(
          ds.extract('column_1', 'relevantScreen'),
          ['foo', 'baz']
        )
      })
    })

    describe('Commit', () => {
      it('copies data to storage on commit', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        ds.commit()
        assert.deepEqual(
          ds.state,
          {
            'one': 1,
            'two': 2
          }
        )
        assert.deepEqual(
          ds.data,
          [ds.state]
        )
      })

      it('clears the staging area on commit', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        ds.commit()
        assert.deepEqual(ds.staging, {})
      })
    })

    describe('Metadata', () => {
      it('computes column keys', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })
        assert.deepEqual(
          ds.keys(), // sorted alphabetically
          ['one', 'three', 'two']
        )
      })

      it('moves metadata to first columns', () => {
        // sender should be moved to the front by default
        ds.commit({
          'abc': 1,
          'sender': 2
        })
        assert.deepEqual(
          ds.keys(),
          ['sender', 'abc']
        )
      })

      it('can include state keys if requested', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.set('three', 3)

        assert.deepEqual(
          ds.keys(),
          ['one', 'two']
        )

        assert.deepEqual(
          ds.keys(true),
          ['one', 'three', 'two']
        )
      })
    })

    describe('Reset', () => {
      it('clears transient data if requested', () => {
        ds.commit({
          'a': 'b'
        })

        // Don't clear persistent storage
        ds.clear(false, true)

        assert.deepEqual(
          ds.data,
          []
        )
        assert.deepEqual(
          ds.state,
          {}
        )
        assert.deepEqual(
          ds.staging,
          {}
        )
      })
    })

    describe('Local persistence', () => {
      it('Saves state into local storage if requested', () => {
        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })

        persistent_ds.set('a', 'bcd')
        persistent_ds.commit()

        assert.deepEqual(
          JSON.parse(sessionStorage.getItem('lab.js-data')),
          persistent_ds.data
        )

        sessionStorage.clear()
      })

      it('Recovers state from local storage', () => {
        // Save some data in sessionStorage
        const json_data = '[{"a": 1, "b": "foo"}]'
        sessionStorage.setItem('lab.js-data', json_data)

        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })

        assert.equal(
          persistent_ds.get('a'),
          1
        )
        assert.equal(
          persistent_ds.get('b'),
          'foo'
        )

        sessionStorage.clear()
      })

      it('Fails gracefully if local data are invalid', () => {
        sessionStorage.setItem('lab.js-data', 'clearly_not_json')
        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })

        assert.deepEqual(
          persistent_ds.data, []
        )
        assert.deepEqual(
          persistent_ds.state, {}
        )

        sessionStorage.clear()
      })

      it('Clears persistent data when instructed', () => {
        const json_data = '[{"a": 1, "b": "foo"}]'
        sessionStorage.setItem('lab.js-data', json_data)

        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })

        persistent_ds.clear()

        assert.equal(
          sessionStorage.getItem('lab.js-data'),
          null
        )
      })

      it('Clears previous persistent data if requested', () => {
        const json_data = '[{"a": 1, "b": "foo"}]'
        sessionStorage.setItem('lab.js-data', json_data)

        const persistent_ds = new lab.data.Store({
          persistence: 'session',
          clearPersistence: true
        })

        assert.deepEqual(
          persistent_ds.data,
          []
        )

        assert.equal(
          sessionStorage.getItem('lab.js-data'),
          null
        )
      })
    })

    describe('Data export', () => {
      it('exports correct json data', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })
        assert.deepEqual(
          ds.exportJson(),
          JSON.stringify(ds.data)
        )
      })

      it('exports correct csv data', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })
        assert.strictEqual(
          ds.exportCsv(),
          [
            'one,three,two',
            '1,,2',
            ',3,2'
          ].join('\r\n')
        )
      })

      it('places cells in quotation marks if required for csv export', () => {
        ds.commit({
          '1': 'a',
          '2': 'b,',
          '3': 'c\n',
        })
        assert.strictEqual(
          ds.exportCsv(),
          [
            '1,2,3',
            'a,"b,","c\n"',
          ].join('\r\n')
        )
      })

      it('escapes quotation marks in cells during csv export', () => {
        ds.commit({
          '1': 'a',
          '2': 'b"',
          '3': 'c',
        })
        assert.strictEqual(
          ds.exportCsv(),
          [
            '1,2,3',
            'a,"b""",c',
          ].join('\r\n')
        )
      })

      it('escapes all quotation marks during csv export', () => {
        ds.commit({
          '1': '["a", "b", "c"]',
        })
        assert.strictEqual(
          ds.exportCsv(),
          [
            '1',
            '"[""a"", ""b"", ""c""]"',
          ].join('\r\n')
        )
      })

      it('stringifies complex data types during csv export', () => {
        ds.commit({
          'array': [1, 2, 3, 'a', 'b', 'c'],
          'object': { one: 1, two: 2 },
        })

        assert.strictEqual(
          ds.exportCsv(),
          [
            'array,object',
            '"[1,2,3,""a"",""b"",""c""]","{""one"":1,""two"":2}"',
          ].join('\r\n')
        )
      })

      it('exports data as a blob', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })

        // Define a function to convert blobs back into text
        const readBlob = blob =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result)
            }
            reader.onerror = reject
            reader.readAsText(blob)
          })

        return Promise.all([
          readBlob(ds.exportBlob()).then((result) => {
            assert.equal(result, ds.exportCsv())
          }),
          readBlob(ds.exportBlob('json')).then((result) => {
            assert.equal(result, ds.exportJson())
          })
        ])
      })

      it('shows data on the browser console', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })

        const spy = sinon.spy(console, 'table')

        // Trigger data output
        ds.show()

        assert.ok(spy.withArgs(ds.data, ds.keys()).calledOnce)
      })
    })

    describe('Data transmission', () => {
      it('transmits data per post request', () => {
        // This test ist done as suggested by R.J. Zaworski (MIT licenced)
        // http://rjzaworski.com/2015/06/testing-api-requests-from-window-fetch

        // Stub window.fetch
        const fake_fetch = sinon.stub(window, 'fetch')

        // Simulate a response
        const res = new window.Response('', {
          status: 200,
          headers: {
            'Content-type': 'application/json'
          }
        })

        // Make the stub call return the response
        window.fetch.returns(
          Promise.resolve(res)
        )

        // Make a mock request and ensure that it works
        // (i.e. that a promise is returned, and that the
        // response passed with it is ok)
        const output = ds
          .transmit('https://random.example')
          .then((response) => {
            // Check that response was received
            assert.ok(response.ok)

            // Make sure fetch has been called with the correct options
            assert.ok(fake_fetch.withArgs(
              'https://random.example', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                metadata: {},
                url: window.location.href,
                data: ds.data,
              }),
              credentials: 'include',
            }).calledOnce)
            // TODO: There must be a better way than just checking
            // whether the arguments were passed correctly, no?
          })

        // Restore window.fetch
        window.fetch.restore()

        return output
      })
    })
  })
})

})
