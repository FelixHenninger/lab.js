import { padStart } from 'lodash'
import { Store } from './store'

let ds: Store

beforeEach(() => {
  ds = new Store()
})

test('store loads', () => {
  expect(ds.state).toEqual({})
  expect(ds.data).toEqual([])
})

describe('Storage', () => {
  test('sets individual values as state', () => {
    ds.set('one', 1)
    expect(ds.state).toEqual({ one: 1 })
  })

  test('sets multiple values at once', () => {
    ds.set({
      one: 1,
      two: 2,
    })
    expect(ds.state).toEqual({
      one: 1,
      two: 2,
    })
  })
})

describe('Retrieval', () => {
  test('retrieves individual values', () => {
    ds.set({
      one: 1,
      two: 2,
    })
    expect(ds.get('one')).toEqual((ds.state as any)['one'])
    expect(ds.get('two')).toEqual((ds.state as any)['two'])
  })

  test('extracts individual columns from the data', () => {
    ds.data = [
      {
        column_1: 1,
        column_2: 'a',
      },
      {
        column_1: 2,
        column_2: 'b',
      },
    ]

    expect(ds.extract('column_1')).toEqual([1, 2])
    expect(ds.extract('column_2')).toEqual(['a', 'b'])
  })

  test('filters by sender when extracting columns', () => {
    ds.data = [
      {
        sender: 'relevantScreen',
        column_1: 'foo',
      },
      {
        sender: 'irrelevantScreen',
        column_1: 'bar',
      },
      {
        sender: 'relevantScreen',
        column_1: 'baz',
      },
    ]

    expect(ds.extract('column_1', 'relevantScreen')).toEqual(['foo', 'baz'])
  })

  test('selects specified columns via a filtering function', () => {
    ds.data = [
      {
        random: 1,
        column_1: 'a',
        column_2: 'b',
      },
    ]

    const filter_function = (e: string) => e.startsWith('c')

    expect(ds.select(filter_function)).toEqual([
      { column_1: 'a', column_2: 'b' },
    ])
  })

  test('select specified columns via an array of names', () => {
    ds.data = [
      {
        random: 1,
        column_1: 'a',
        column_2: 'b',
      },
    ]

    expect(ds.select(['column_1', 'column_2'])).toEqual([
      { column_1: 'a', column_2: 'b' },
    ])
  })
})

describe('Commit', () => {
  test('copy data to storage on commit', () => {
    ds.set({
      one: 1,
      two: 2,
    })
    expect(ds.state).toEqual({
      one: 1,
      two: 2,
    })
    expect(ds.data).toEqual([])
    ds.commit()
    expect(ds.data).toEqual([ds.state])
  })

  test('commit clones information, breaking references', () => {
    const someObject = { one: 1 }
    ds.set({
      someObject: someObject,
    })
    ds.commit()
    expect((ds.state as any).someObject).toBe(someObject)
    expect(ds.data[0].someObject).not.toBe(someObject)
  })

  test('commit clears staging data', () => {
    ds.set({
      one: 1,
      two: 2,
    })
    ds.commit()
    //@ts-ignore private property
    expect(ds.staging).toEqual({})
  })

  test('cleanData omits keys starting with an underscore', () => {
    ds.set({
      one: 1,
      two: 2,
      _parameter: 3,
    })
    ds.commit()

    expect(ds.data).toEqual([
      {
        one: 1,
        two: 2,
        _parameter: 3,
      },
    ])

    expect(ds.cleanData).toEqual([
      {
        one: 1,
        two: 2,
      },
    ])
  })

  test('commit returns the row index', () => {
    expect(ds.commit()).toBe(0)
    expect(ds.commit()).toBe(1)
  })
})

describe('Update', () => {
  test('previously committed data can be updated', () => {
    ds.set({ foo: 'bar' })
    ds.commit()
    expect(ds.data).toEqual([{ foo: 'bar' }])

    ds.update(0, d => {
      d.foo = 'baz'
      return d
    })
    expect(ds.data).toEqual([{ foo: 'baz' }])
  })
})

describe('State proxy', () => {
  test('proxy reads via get method', () => {
    ds.set({ one: 1, two: 2 })
    const spy = jest.spyOn(ds, 'get')

    expect((ds.state as any)['one']).toBe(1)
    expect(spy).toHaveBeenCalledWith('one')
  })

  test('proxy writes via set method', () => {
    const spy = jest.spyOn(ds, 'set')

    ;(ds.state as any)['one'] = 1

    expect((ds.state as any)['one']).toBe(1)
    expect(spy).toHaveBeenCalledWith('one', 1)
  })
})

describe('Metadata', () => {
  test('keys property collects column names', () => {
    ds.data = [
      {
        one: 1,
        two: 2,
      },
      {
        two: 2,
        three: 3,
      },
    ]

    // Sorting is alphabetical
    expect(ds.keys()).toEqual(['one', 'three', 'two'])
  })

  test('metadata are moved to the first columns', () => {
    // sender should be moved to the front by default
    ds.data = [
      {
        abc: 1,
        sender: '2',
      },
    ]

    expect(ds.keys()).toEqual(['sender', 'abc'])
  })

  test('if requested, state keys are included', () => {
    ds.data = [
      {
        one: 1,
        two: 2,
      },
    ]
    ds.set('three', 3)

    expect(ds.keys()).toEqual(['one', 'two'])
    expect(ds.keys(true)).toEqual(['one', 'three', 'two'])
  })

  test('participant ids are available as a property', () => {
    expect(ds.guessId()).toBeUndefined()
    ds.set('id', 'abc')
    expect(ds.guessId()).toBe('abc')
  })

  test('filename generation', () => {
    const now = new Date('2018-05-25T12:00:00+00:00')
    const clock = jest.useFakeTimers('modern')
    jest.setSystemTime(now)

    // Compensate for time zone
    const hours = padStart(
      (12 - new Date().getTimezoneOffset() / 60).toString(),
      2,
      '0',
    )

    expect(ds.makeFilename('prefix', 'json')).toBe(
      `prefix--2018-05-25--${hours}:00:00.json`,
    )

    jest.useRealTimers()
  })
})

describe('Reset', () => {
  test('clearing transient data', () => {
    ds.set('a', 'b')
    ds.commit()

    ds.clear()

    expect(ds.data).toEqual([])
    expect(ds.state).toEqual({})
    //@ts-ignore private property
    expect(ds.staging).toEqual({})
  })
})

describe('Data export', () => {
  test('json data export', () => {
    ds.data = [
      { one: 1, two: 2 },
      { two: 2, three: 3 },
    ]

    expect(ds.exportJson()).toEqual(JSON.stringify(ds.data))
  })

  test('jsonl data export', () => {
    ds.data = [
      { one: 1, two: 2 },
      { two: 2, three: 3 },
    ]

    expect(ds.exportJsonL()).toBe(
      ['{"one":1,"two":2}', '{"two":2,"three":3}'].join('\n'),
    )
  })

  test('csv data export', () => {
    ds.data = [
      { one: 1, two: 2 },
      { two: 2, three: 3 },
    ]

    expect(ds.exportCsv()).toBe(['one,three,two', '1,,2', ',3,2'].join('\r\n'))
  })

  test('special character escapes in csv export', () => {
    ds.data = [
      {
        '1': 'a',
        '2': 'b,',
        '3': 'c\n',
      },
    ]

    expect(ds.exportCsv()).toBe(['1,2,3', 'a,"b,","c\n"'].join('\r\n'))
  })

  test('quotation mark escapes in csv export', () => {
    ds.data = [
      {
        '1': 'a',
        '2': 'b"',
        '3': 'c',
      },
    ]

    expect(ds.exportCsv()).toBe(['1,2,3', 'a,"b""",c'].join('\r\n'))
  })

  test('quotation mark escapes in csv export', () => {
    ds.data = [
      {
        '1': '["a", "b", "c"]',
      },
    ]

    expect(ds.exportCsv()).toBe(['1', '"[""a"", ""b"", ""c""]"'].join('\r\n'))
  })

  test('complex data stringification in csv export', () => {
    ds.data = [
      {
        array: [1, 2, 3, 'a', 'b', 'c'],
        object: { one: 1, two: 2 },
      },
    ]

    expect(ds.exportCsv()).toBe(
      [
        'array,object',
        '"[1,2,3,""a"",""b"",""c""]","{""one"":1,""two"":2}"',
      ].join('\r\n'),
    )
  })

  test('column filtering in csv export', () => {
    ds.data = [
      {
        one: 1,
        two: 2,
        _three: 3,
      },
      {
        two: 2,
        three: 3,
        _four: 4,
      },
    ]

    expect(ds.exportCsv()).toBe(['one,three,two', '1,,2', ',3,2'].join('\r\n'))
  })

  test('blob export', async () => {
    ds.data = [
      {
        one: 1,
        two: 2,
      },
      {
        two: 2,
        three: 3,
      },
    ]

    // Jest doesn't seem to support the blob.text() API (yet)
    const readBlob = (blob: Blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.onerror = reject
        reader.readAsText(blob)
      })

    const csvBlob = ds.exportBlob()
    const csvText = await readBlob(csvBlob)

    const jsonBlob = ds.exportBlob('json')
    const jsonText = await readBlob(jsonBlob)

    expect(csvText).toEqual(ds.exportCsv())
    expect(jsonText).toEqual(ds.exportJson())
  })

  test('console data output', () => {
    ds.data = [
      {
        one: 1,
        two: 2,
      },
      {
        two: 2,
        three: 3,
      },
    ]

    const spy = jest.spyOn(console, 'table').mockReturnValueOnce(undefined)

    // Trigger data output
    ds.show()

    expect(spy).toHaveBeenCalledWith(ds.data, ds.keys())

    spy.mockRestore()
  })
})
