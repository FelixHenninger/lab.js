import { CustomIterable } from './iterable'

it('Can reset the wrapped iterable', () => {
  const nested = [1, 2, 3]
  const c = new CustomIterable(nested)
  const i = c[Symbol.iterator]()

  expect(i.next().value).toBe(1)
  expect(i.next().value).toBe(2)

  i.reset()
  expect(i.next().value).toBe(1)
})
