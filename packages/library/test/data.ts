/* global define, describe, it, beforeEach, assert, sinon */
/* eslint-disable import/no-amd */

// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'define'.
define(['lab'], (lab: any) => {

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Data handling', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('Store', () => {
    let ds: any

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
    beforeEach(() => {
      ds = new lab.data.Store({})
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('loads', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(ds.state, {})
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
      assert.deepEqual(ds.data, [])
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Storage', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('stores individual values', () => {
        ds.set('one', 1)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.state,
          {
            'one': 1,
          }
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('stores objects', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.state,
          {
            'one': 1,
            'two': 2
          }
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Retrieval', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('retrieves individual values', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(ds.get('one'), ds.state.one)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(ds.get('two'), ds.state.two)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can extract individual columns from the data', () => {
        ds.commit({
          'column_1': 1,
          'column_2': 'a'
        })
        ds.commit({
          'column_1': 2,
          'column_2': 'b'
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.extract('column_1'),
          [1, 2]
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.extract('column_2'),
          ['a', 'b']
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.extract('column_1', 'relevantScreen'),
          ['foo', 'baz']
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can select specified columns in data by a filtering function', () =>{
        var filter_function = (e: any) => e.startsWith('c')
        ds.commit({
          'random': 1,
          'column_1': 'a',
          'column_2': 'b'
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.select( filter_function ),
          [{ column_1: 'a', column_2: 'b' }]
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can select specified columns in data by an array of columns names', () =>{
        ds.commit({
          'random': 1,
          'column_1': 'a',
          'column_2': 'b'
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.select( ['column_1', 'column_2'] ),
          [{ column_1: 'a', column_2: 'b' }]
        )
      })

    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Commit', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('copies data to storage on commit', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        ds.commit()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.state,
          {
            'one': 1,
            'two': 2
          }
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.data,
          [ds.state]
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('clones stored information, breaking references', () => {
        const someObject = { one: 1 }
        ds.commit({
          someObject: someObject
        })
        ds.state.someObject.one = 2

        // State should changed, but not the stored data
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(ds.state.someObject.one, 2)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(ds.data[0].someObject.one, 1)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('clears the staging area on commit', () => {
        ds.set({
          'one': 1,
          'two': 2
        })
        ds.commit()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(ds.staging, {})
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('provides data without keys beginning with an underscore', () => {
        ds.commit({
          'one': 1,
          'two': 2,
          '_parameter': 3
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.data,
          [{
            'one': 1,
            'two': 2,
            '_parameter': 3,
          }]
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.cleanData,
          [{
            'one': 1,
            'two': 2,
          }]
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can update previously committed data', () => {
        ds.commit({
          foo: 'bar',
        })
        ds.update(0, (d: any) => {
          d.foo = 'baz'
          return d
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.data,
          [{ foo: 'baz' }]
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('returns data index when committing', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          ds.commit({}),
          0
        )

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          ds.commit({}),
          1
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('State proxy', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('reads via get method', () => {
        ds.set({ 'one': 1, 'two': 2 })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy(ds, 'get')

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(ds.stateProxy['one'], 1)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.withArgs('one').calledOnce)
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('writes via set method', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const spy = sinon.spy(ds, 'set')

        ds.stateProxy['one'] = 1
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(ds.get('one'), 1)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(spy.withArgs('one', 1).calledOnce)
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Metadata', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('computes column keys', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.keys(), // sorted alphabetically
          ['one', 'three', 'two']
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('moves metadata to first columns', () => {
        // sender should be moved to the front by default
        ds.commit({
          'abc': 1,
          'sender': 2
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.keys(),
          ['sender', 'abc']
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can include state keys if requested', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.set('three', 3)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.keys(),
          ['one', 'two']
        )

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.keys(true),
          ['one', 'three', 'two']
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('provides the participant id as a property', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.isUndefined(ds.id)

        ds.set({ id: 'abc' })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(ds.id, 'abc')
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can suggest a filename', () => {
        const now = new Date('2018-05-25T12:00:00+00:00')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const clock = sinon.useFakeTimers(now)

        // Compensate for time zone
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '_'.
        const hours = _.padStart(
          (12 - new Date().getTimezoneOffset() / 60).toString(),
          2, '0'
        )

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          ds.makeFilename('prefix', 'json'),
          'prefix--2018-05-25--' + hours + ':00:00.json'
        )

        clock.restore()
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Reset', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('clears transient data if requested', () => {
        ds.commit({
          'a': 'b'
        })

        // Don't clear persistent storage
        ds.clear(false, true)

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.data,
          []
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.state,
          {}
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.staging,
          {}
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Local persistence', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('saves state into session storage if requested', () => {
        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })

        persistent_ds.set('a', 'bcd')
        persistent_ds.commit()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2345) FIXME: Type 'null' is not assignable to type 'string'.
          JSON.parse(sessionStorage.getItem('lab.js-data')),
          persistent_ds.data
        )

        sessionStorage.clear()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('saves state into local storage if requested', () => {
        const persistent_ds = new lab.data.Store({
          persistence: 'local'
        })

        persistent_ds.set('a', 'bcd')
        persistent_ds.commit()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2345) FIXME: Type 'null' is not assignable to type 'string'.
          JSON.parse(localStorage.getItem('lab.js-data')),
          persistent_ds.data
        )

        localStorage.clear()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('recovers state from storage', () => {
        // Save some data in sessionStorage
        sessionStorage.setItem('lab.js-data', '[{"a": 1, "b": "foo"}]')

        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          persistent_ds.get('a'),
          1
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          persistent_ds.get('b'),
          'foo'
        )

        sessionStorage.clear()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('removes metadata from state when recovering data', () => {
        sessionStorage.setItem('lab.js-data', '[{"a": 1, "sender": "foo"}]')

        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          persistent_ds.state.a,
          1
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.isUndefined(
          persistent_ds.state.sender
        )

        sessionStorage.clear()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('fails gracefully if local data are invalid', () => {
        sessionStorage.setItem('lab.js-data', 'clearly_not_json')
        const persistent_ds = new lab.data.Store({
          persistence: 'session'
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          persistent_ds.data, []
        )
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          persistent_ds.state, {}
        )

        sessionStorage.clear()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('clears persistent data in sessionStorage when instructed', () => {
        sessionStorage.setItem('lab.js-data', '[{"a": 1, "b": "foo"}]')

        new lab.data.Store({ persistence: 'session' }).clear()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          sessionStorage.getItem('lab.js-data'),
          null
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('clears persistent data in localStorage when instructed', () => {
        localStorage.setItem('lab.js-data', '[{"a": 1, "b": "foo"}]')

        new lab.data.Store({ persistence: 'local' }).clear()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          localStorage.getItem('lab.js-data'),
          null
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('clears previous persistent data on construction if requested', () => {
        sessionStorage.setItem('lab.js-data', '[{"a": 1, "b": "foo"}]')

        const persistent_ds = new lab.data.Store({
          persistence: 'session',
          clearPersistence: true
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          persistent_ds.data,
          []
        )

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.equal(
          sessionStorage.getItem('lab.js-data'),
          null
        )
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Data export', () => {
      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('exports correct json data', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.exportJson(),
          JSON.stringify(ds.data)
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('exports correct jsonl data', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          ds.exportJsonL(),
          [
            '{"one":1,"two":2}',
            '{"two":2,"three":3}'
          ].join('\n')
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('exports correct csv data', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.strictEqual(
          ds.exportCsv(),
          [
            'one,three,two',
            '1,,2',
            ',3,2'
          ].join('\r\n')
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('places cells in quotation marks if required for csv export', () => {
        ds.commit({
          '1': 'a',
          '2': 'b,',
          '3': 'c\n',
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.strictEqual(
          ds.exportCsv(),
          [
            '1,2,3',
            'a,"b,","c\n"',
          ].join('\r\n')
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('escapes quotation marks in cells during csv export', () => {
        ds.commit({
          '1': 'a',
          '2': 'b"',
          '3': 'c',
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.strictEqual(
          ds.exportCsv(),
          [
            '1,2,3',
            'a,"b""",c',
          ].join('\r\n')
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('escapes all quotation marks during csv export', () => {
        ds.commit({
          '1': '["a", "b", "c"]',
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.strictEqual(
          ds.exportCsv(),
          [
            '1',
            '"[""a"", ""b"", ""c""]"',
          ].join('\r\n')
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('stringifies complex data types during csv export', () => {
        ds.commit({
          'array': [1, 2, 3, 'a', 'b', 'c'],
          'object': { one: 1, two: 2 },
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.strictEqual(
          ds.exportCsv(),
          [
            'array,object',
            '"[1,2,3,""a"",""b"",""c""]","{""one"":1,""two"":2}"',
          ].join('\r\n')
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('omits columns starting with an underscore in csv export', () => {
        ds.commit({
          'one': 1,
          'two': 2,
          '_three': 3,
        })
        ds.commit({
          'two': 2,
          'three': 3,
          '_four': 4,
        })
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.strictEqual(
          ds.exportCsv(),
          [
            'one,three,two',
            '1,,2',
            ',3,2'
          ].join('\r\n')
        )
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        const readBlob = (blob: any) => new Promise((resolve: any, reject: any) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result)
          }
          reader.onerror = reject
          reader.readAsText(blob)
        })

        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        return Promise.all([
          readBlob(ds.exportBlob()).then((result: any) => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.equal(result, ds.exportCsv())
          }),
          readBlob(ds.exportBlob('json')).then((result: any) => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.equal(result, ds.exportJson())
          })
        ]);
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('shows data on the browser console', () => {
        ds.commit({
          'one': 1,
          'two': 2
        })
        ds.commit({
          'two': 2,
          'three': 3
        })

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const stub = sinon.stub(console, 'table')

        // Trigger data output
        ds.show()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(stub.withArgs(ds.data, ds.keys()).calledOnce)
        stub.restore()
      })
    })

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('Data transmission', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        sinon.stub(window, 'fetch')
          // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
          .returns(Promise.resolve(res))

        // Commit data to data store as well as staging area
        ds.commit({ 'one': 1, 'two': 2 })
        ds.commit({ 'three': 3, 'four': 4 })
        ds.set('five', 5)
      })

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
      afterEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '((input... Remove this comment to see the full error message
        window.fetch.restore()
      })

      // Extract data from stringified payload
      const extractData = (fetchArgs: any) => JSON.parse(fetchArgs[1]['body'])['data']

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('transmits data per post request', () => {
        // Make a mock request and ensure that it works
        // (i.e. that a promise is returned, and that the
        // response passed with it is ok)
        return ds.transmit('https://random.example')
          .then((response: any) => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(window.fetch.calledOnce)

            // Check that response was received
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(response.ok)

            // Make sure fetch has been called with the correct options
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(window.fetch.withArgs(
              'https://random.example', {
              method: 'post',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                metadata: {
                  slice: 0,
                },
                url: window.location.href,
                data: ds.data,
              }),
              credentials: 'include',
            }).calledOnce)
            // TODO: There must be a better way than just checking
            // whether the arguments were passed correctly, no?
          });
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('will retry transmission if it fails', () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '((input... Remove this comment to see the full error message
        window.fetch.restore()

        // And if at first you don't succeed ...
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const fetch = sinon.stub(window, 'fetch')
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        fetch.onCall(0).callsFake(() => Promise.reject('not feeling like it'))
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        fetch.onCall(1).callsFake(() => Promise.reject('you want it when?'))
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        fetch.onCall(2).callsFake(() => Promise.reject('nah, not in the mood'))
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        fetch.onCall(3).callsFake(() => Promise.reject(`lalala can't hear you`))
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        fetch.onCall(4).callsFake(() => Promise.resolve(new window.Response()))

        return ds.transmit('https://random.example', {}, {
          retry: { delay: 0 }
        }).then(() => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(
            fetch.callCount,
            5
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('uses an exponential backoff', () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '((input... Remove this comment to see the full error message
        window.fetch.restore()

        const timestamps: any = []
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const fetch = sinon.stub(window, 'fetch')
        fetch.callsFake(() => {
          timestamps.push(performance.now())
          // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
          return Promise.reject('nope')
        })

        return ds.transmit('https://random.example', {}, {
          retry: { times: 2 }
        }).catch(() => {
          // Calculate timestamp deltas
          const deltas = timestamps
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'x' implicitly has an 'any' type.
            .map((x, i, arr) => arr[i + 1] - x)
            // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'x' implicitly has an 'any' type.
            .filter(x => !isNaN(x))

          // TODO: This is a very crude test
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.ok(
            (deltas[0] <= deltas[1]) &&
            (deltas[1] <= deltas[2])
          )
        })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('gives up retrying eventually', () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'restore' does not exist on type '((input... Remove this comment to see the full error message
        window.fetch.restore()

        // Abandon all hope, ye who enter here
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const fetch = sinon.stub(window, 'fetch')
        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        fetch.callsFake(() => Promise.reject('gonna nope right out of this'))

        return ds.transmit('https://random.example', {}, {
          retry: { delay: 1, factor: 1 }
        }).catch((error: any) => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(error, 'gonna nope right out of this')
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
          assert.equal(fetch.callCount, 5)
        });
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('logs last incrementally transmitted row', () => {
        return ds.transmit(
          'https://random.example', {},
          { incremental: true }
        ).then(() => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.equal(ds._lastIncrementalTransmission, 2)

            // Add new row and transmit again
            ds.commit()
            return ds.transmit(
              'https://random.example', {},
              { incremental: true }
            )
          }).then(() => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.equal(ds._lastIncrementalTransmission, 3)
          })
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can debounce transmissions', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const clock = sinon.useFakeTimers()

        ds.queueIncrementalTransmission('https://random.example')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(window.fetch.called)
        clock.tick(2500)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(window.fetch.called)

        clock.restore()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('sends all new data with debounced transmission', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const clock = sinon.useFakeTimers()

        ds.queueIncrementalTransmission('https://random.example')
        ds.commit({ six: 6 })
        ds.queueIncrementalTransmission('https://random.example')
        clock.runAll()

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(window.fetch.calledOnce)
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.deepEqual(
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstCall' does not exist on type '((inp... Remove this comment to see the full error message
          extractData(window.fetch.firstCall.args),
          ds.data
        )

        clock.restore()
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('sends data in increments', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const clock = sinon.useFakeTimers({
          toFake: ['setTimeout', 'clearTimeout']
        })

        // Queue and transmit first batch of data
        ds.queueIncrementalTransmission('https://random.example')

        // Fast-forward through first transmission
        clock.runAll()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(window.fetch.calledOnce)

        // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
        return (new Promise((resolve: any) => setImmediate(resolve)))
          .then(() => {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'resetHistory' does not exist on type '((... Remove this comment to see the full error message
            window.fetch.resetHistory()

            // Add new data, and transmit it
            ds.commit({ six: 6 })
            ds.queueIncrementalTransmission('https://random.example')

            // Fast-forward again
            clock.runAll()

            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(window.fetch.calledOnce)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.deepEqual(
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'lastCall' does not exist on type '((inpu... Remove this comment to see the full error message
              extractData(window.fetch.lastCall.args),
              [{ five: 5, six: 6 }]
            )
            clock.restore()
          });
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('re-sends earlier data if incremental transmission fails', () => {
        // As above, but this time fail on a first set of transmissions
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'callsFake' does not exist on type '((inp... Remove this comment to see the full error message
        window.fetch.callsFake(() => Promise.reject('nope'))

        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const clock = sinon.useFakeTimers()
        const p = ds.queueIncrementalTransmission('https://random.example')
        clock.runAll()
        clock.restore()

        // Fast-forward through first batch of data (failing)
        return p.catch((error: any) => null) // Disregard error
          .then(() => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
            const clock = sinon.useFakeTimers()

            // This time, the transmission succeeds
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'resetHistory' does not exist on type '((... Remove this comment to see the full error message
            window.fetch.resetHistory()
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'callsFake' does not exist on type '((inp... Remove this comment to see the full error message
            window.fetch.callsFake(() => Promise.resolve(new Response()))

            // Add new data, and transmit it
            ds.commit({ six: 6 })
            ds.queueIncrementalTransmission('https://random.example')

            // Fast-forward again
            clock.runAll()

            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.ok(window.fetch.calledOnce)
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
            assert.deepEqual(
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'lastCall' does not exist on type '((inpu... Remove this comment to see the full error message
              extractData(window.fetch.lastCall.args),
              [
                { one: 1, two: 2 },
                { three: 3, four: 4 },
                { five: 5, six: 6 }
              ]
            )
            clock.restore()
          });
      })

      // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('can flush pending transmissions', () => {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sinon'.
        const clock = sinon.useFakeTimers()

        ds.queueIncrementalTransmission('https://random.example')
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.notOk(window.fetch.called)
        ds.flushIncrementalTransmissionQueue()
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'assert'.
        assert.ok(window.fetch.called)

        clock.restore()
      })
    })
  })
})

})
