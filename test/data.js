describe('Data handling', () => {
  describe('DataStore', () => {
    beforeEach(() => {
      ds = new lab.DataStore({})
    })

    it('loads', () => {
      assert.deepEqual(ds.state, {})
      assert.deepEqual(ds.data, [])
    })

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

    it('exports correct JSON data', () => {
      ds.commit({
        'one': 1,
        'two': 2
      })
      ds.commit({
        'two': 2,
        'three': 3
      })
      assert.deepEqual(
        ds.export_json(),
        JSON.stringify(ds.data)
      )
    })

    it('exports correct CSV data', () => {
      ds.commit({
        'one': 1,
        'two': 2
      })
      ds.commit({
        'two': 2,
        'three': 3
      })
      assert.strictEqual(
        ds.export_csv(),
        [
          'one,three,two',
          '1,,2',
          ',3,2'
        ].join('\r\n')
      )
    })
  })
})
