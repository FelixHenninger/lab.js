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

  //@ts-ignore
  const s = new SliceIterator<TestObject>(a1)
  const output = Array.from(s)

  expect(output[0]).toEqual([a1, b1, c1])
  expect(output[1]).toEqual([a1, b1, c2])
  expect(output[2]).toEqual([a1, b2, c3])
})

it('can splice a tree', () => {
  const { a1, b1, b2, c1, c2, c3 } = makeExample()
  //@ts-ignore
  const s = new SliceIterator<TestObject>(a1)

  const iterator = s[Symbol.iterator]()

  expect(iterator.next()?.value).toEqual([a1, b1, c1])
  //@ts-ignore
  iterator.splice(1)
  expect(iterator.next()?.value).toEqual([a1, b2, c3])
})
