import { SliceIterable } from './timeline'

type TestObject = {
  id: string
}

async function asyncArrayFrom<T>(
  asyncIterator: AsyncIterable<T>,
): Promise<T[]> {
  const arr = []
  for await (const v of asyncIterator) arr.push(v)
  return arr
}

const makeExample = () => {
  const c1 = { id: 'c1' }
  const c2 = { id: 'c2' }
  const c3 = { id: 'c3' }

  const b1 = [c1, c2]
  const b2 = [c3]

  const a1 = [b1, b2]

  return { a1, b1, b2, c1, c2, c3 }
}

it('works with array tree', async () => {
  const { a1, b1, b2, c1, c2, c3 } = makeExample()

  const s = new SliceIterable(a1)
  const output = await asyncArrayFrom(s)

  expect(output[0]).toEqual([a1, b1, c1])
  expect(output[1]).toEqual([a1, b1, c2])
  expect(output[2]).toEqual([a1, b2, c3])
})

it('can splice a tree based on level index', async () => {
  const { a1, b1, b2, c1, c3 } = makeExample()

  const s = new SliceIterable(a1)

  const iterator = s[Symbol.asyncIterator]()

  expect((await iterator.next())?.value).toEqual([a1, b1, c1])
  iterator.splice(1)
  expect((await iterator.next())?.value).toEqual([a1, b2, c3])
})

it('can splice a tree based on an intermediate object', async () => {
  const { a1, b1, b2, c1, c3 } = makeExample()

  const s = new SliceIterable(a1)

  const iterator = s[Symbol.asyncIterator]()
  expect((await iterator.next())?.value).toEqual([a1, b1, c1])
  iterator.findSplice(b1)
  expect((await iterator.next())?.value).toEqual([a1, b2, c3])
})

it('ends iteration after top-level splice', async () => {
  const { a1, b1, c1 } = makeExample()

  const s = new SliceIterable<TestObject>(a1)

  const iterator = s[Symbol.asyncIterator]()
  expect((await iterator.next())?.value).toEqual([a1, b1, c1])
  iterator.findSplice(a1)
  expect((await iterator.next())?.done).toEqual(true)
})

it('can fast-forward', async () => {
  const { a1, b1, b2, c1, c3 } = makeExample()

  const s = new SliceIterable<TestObject>(a1)

  const iterator = s[Symbol.asyncIterator]()
  expect((await iterator.next())?.value).toEqual([a1, b1, c1])

  iterator.fastForward((v, level) => {
    if (level === 1) {
      return v === b2
    } else {
      return v === c3
    }
  })
  expect((await iterator.next()).value).toEqual([a1, b2, c3])
})

// What would be good tests?
