import { SliceIterator } from './timeline'

type TestObject = {
  id: string
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

it('works with array tree', () => {
  const { a1, b1, b2, c1, c2, c3 } = makeExample()

  const s = new SliceIterator(a1)
  const output = Array.from(s)

  expect(output[0]).toEqual([a1, b1, c1])
  expect(output[1]).toEqual([a1, b1, c2])
  expect(output[2]).toEqual([a1, b2, c3])
})

it('can splice a tree based on level index', () => {
  const { a1, b1, b2, c1, c3 } = makeExample()

  const s = new SliceIterator(a1)

  const iterator = s[Symbol.iterator]()

  expect(iterator.next()?.value).toEqual([a1, b1, c1])
  iterator.splice(1)
  expect(iterator.next()?.value).toEqual([a1, b2, c3])
})

it('can splice a tree based on an intermediate object', () => {
  const { a1, b1, b2, c1, c3 } = makeExample()

  const s = new SliceIterator(a1)

  const iterator = s[Symbol.iterator]()
  expect(iterator.next()?.value).toEqual([a1, b1, c1])
  iterator.findSplice(b1)
  expect(iterator.next()?.value).toEqual([a1, b2, c3])
})

it('ends iteration after top-level splice', () => {
  const { a1, b1, c1 } = makeExample()

  const s = new SliceIterator<TestObject>(a1)

  const iterator = s[Symbol.iterator]()
  expect(iterator.next()?.value).toEqual([a1, b1, c1])
  iterator.findSplice(a1)
  expect(iterator.next()?.done).toEqual(true)
})

it('can fast-forward', () => {
  const { a1, b1, b2, c1, c3 } = makeExample()

  const s = new SliceIterator<TestObject>(a1)

  const iterator = s[Symbol.iterator]()
  expect(iterator.next()?.value).toEqual([a1, b1, c1])

  iterator.fastForward((v, level) => {
    if (level === 1) {
      return v === b2
    } else {
      return v === c3
    }
  })
  expect(iterator.next().value).toEqual([a1, b2, c3])
})

// What would be good tests?
