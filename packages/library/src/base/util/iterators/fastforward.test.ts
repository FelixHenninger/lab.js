import { fastForward } from './fastforward'

test('Skips through iterator until criterion is met', () => {
  const a = [1, 2, 3]
  const i = a.entries()

  fastForward(i, ([index, v]) => v == 2)

  const { value, done } = i.next()

  expect(value).toEqual([2, 3])
  expect(done).toBe(false)
})

test('Returns value matching criterion', () => {
  const a = [1, 2, 3]
  const i = a.entries()

  const [{ value, done }, j] = fastForward(i, ([index, v]) => v == 2)

  expect(value).toEqual([1, 2])
  expect(done).toBe(false)
  expect(j).toBe(i)
})

test('Returns undefined if iterator is consumed', () => {
  const a = [1, 2, 3]
  const i = a.entries()

  const [{ value, done }, j] = fastForward(i, ([index, v]) => false)

  expect(value).toEqual(undefined)
  expect(done).toBe(true)
})
