import { Random } from './index'

let rng_alea: Random, rng_random: Random

beforeEach(() => {
  rng_alea = new Random({
    algorithm: 'alea',
    seed: 'abcd',
  })

  rng_random = new Random()
})

it('provides random floating point numbers', () => {
  expect(rng_alea.random()).toBeCloseTo(0.7154429776128381, 16)
  expect(rng_alea.random()).toBeCloseTo(0.8120661831926554, 16)

  expect(typeof rng_random.random()).toBe('number')
})

it('provides integers up to a given maximum', () => {
  expect([1, 2, 3, 4, 5, 6, 7].map(() => rng_alea.range(10))).toEqual([
    7, 8, 8, 4, 2, 2, 9,
  ])
  expect(typeof rng_random.range(10)).toBe('number')

  expect(0 <= rng_random.range(10) && rng_random.range(10) < 10).toBeTruthy()
})

it('provides integers in a given range', () => {
  expect([1, 2, 3, 4, 5, 6, 7].map(() => rng_alea.range(10, 20))).toEqual(
    [7, 8, 8, 4, 2, 2, 9].map(x => x + 10), // shifted from above
  )

  expect(typeof rng_random.range(10, 20)).toBe('number')
  expect(
    10 <= rng_random.range(10, 20) && rng_random.range(10, 20) < 20,
  ).toBeTruthy()
})

it('provides individual random samples from an array', () => {
  const array = [1, 2, 3]
  expect([1, 2, 3, 4].map(() => rng_alea.choice(array))).toEqual([3, 3, 3, 2])

  expect(array.includes(rng_random.choice(array))).toBeTruthy()
})

it('Can provide a weighted sample', () => {
  const array = [1, 2, 3]
  expect([1, 2, 3, 4].map(() => rng_alea.choice(array, [0.5, 0.5, 0]))).toEqual(
    [2, 2, 2, 1],
  )
})

it('provides multiple random samples, without replacement', () => {
  const array = [1, 2, 3, 4, 5]

  expect(rng_alea.sample(array, 4)).toEqual([2, 1, 3, 5])
})

it('limits samples w/o replacement to the original array length', () => {
  const array = [1, 2, 3, 4, 5]

  expect(rng_alea.sample(array, 6).length).toBe(array.length)
})

it('provides multiple random samples, with replacement', () => {
  const array = [1, 2, 3, 4, 5]

  expect(rng_alea.sample(array, 4, true)).toEqual([4, 5, 5, 3])
})

it('shuffles an array', () => {
  const array = [1, 2, 3, 4, 5]
  expect(rng_alea.shuffle(array)).toEqual([2, 1, 3, 5, 4])

  expect(
    rng_random
      .shuffle(array) //
      .every(x => array.includes(x)),
  ).toBeTruthy()
})

it('does not modify the array while shuffling it', () => {
  const array = [1, 2, 3, 4, 5]
  rng_alea.shuffle(array)
  expect(array).toEqual([1, 2, 3, 4, 5])
})

it('shuffles while checking a constraint function', () => {
  const array = [1, 2, 3]
  const constraint = (a: number[]) => a[0] === 1 && a[1] === 2 && a[2] === 3

  expect(rng_alea.constrainedShuffle(array, constraint)) //
    .toEqual([1, 2, 3])
})

it('constrained shuffle stops after a given number of iterations', () => {
  const array = [1, 2, 3]

  // Shim constraint that always fails
  const constraint = jest.fn().mockReturnValue(false)

  // Catch console warning
  jest.spyOn(console, 'warn').mockImplementationOnce(() => undefined)

  const result = rng_alea.constrainedShuffle(array, constraint, {}, 10)

  // Check constraint calls
  expect(constraint).toHaveBeenCalledTimes(10)

  // Result is still shuffled
  expect(result).toEqual([1, 3, 2])
  expect(console.warn).toHaveBeenCalledWith(
    'constrainedShuffle could not find a matching candidate after 10 iterations',
  )

  jest.restoreAllMocks()
})

it('shuffles with minimum distance constraint', () => {
  const array = [1, 2, 2]
  expect(rng_alea.constrainedShuffle(array, { minRepDistance: 2 })) //
    .toEqual([2, 1, 2])
})

it('can apply a hash function before calculating distances', () => {
  const array = [{ value: 1 }, { value: 2 }, { value: 2 }]
  expect(
    rng_alea.constrainedShuffle(
      array,
      { minRepDistance: 2 },
      { hash: x => x.value },
    ),
  ).toEqual([{ value: 2 }, { value: 1 }, { value: 2 }])
})

it('shuffles with maximum run length constraint', () => {
  const array = ['a', 'a', 'b', 'b']
  expect(rng_alea.constrainedShuffle(array, { maxRepSeries: 1 })) //
    .toEqual(['b', 'a', 'b', 'a'])
})

it('can apply a custom equality function for evaluating run length', () => {
  const array = [1, '1', 2, '2']
  expect(
    rng_alea.constrainedShuffle(
      array,
      { maxRepSeries: 1 },
      // Allow for type coercion when testing equality
      { equality: (x, y) => x == y },
    ),
  ).toEqual(['2', '1', 2, 1])
})

it('can apply a custom equality func that checks nested keys', () => {
  const array = [{ foo: 1 }, { foo: '1' }, { foo: 2 }, { foo: '2' }]

  expect(
    rng_alea.constrainedShuffle(
      array,
      { maxRepSeries: 1 },
      { equality: (a, b) => a.foo == b.foo },
    ),
  ).toEqual([{ foo: '2' }, { foo: '1' }, { foo: 2 }, { foo: 1 }])
})

it('can raise an exception if the iteration limit is broken', () => {
  expect(() =>
    rng_alea.constrainedShuffle(
      [1, 2, 3],
      () => false, // Always fail check
      {}, // No further helpers
      5, // Five iterations
      true, // Fail when the maximum number of iterations is reached
    ),
  ).toThrowError(
    'constrainedShuffle could not find a matching candidate ' +
      'after 5 iterations',
  )
})

it('shuffles groups of keys in a table independently', () => {
  // prettier-ignore
  const table = [
    { a: 1,  b: 2,  c: 3,  d: 4,  e: 5  },
    { a: 6,  b: 7,  c: 8,  d: 9,  e: 10 },
    { a: 11, b: 12, c: 13, d: 14, e: 15 },
  ]
  // prettier-ignore
  const output = [
    { a: 1,  b: 2,  c: 13, d: 9,  e: 10 },
    { a: 6,  b: 7,  c: 3,  d: 4,  e: 5  },
    { a: 11, b: 12, c: 8,  d: 14, e: 15 },
  ]

  expect(rng_alea.shuffleTable(table, [['a', 'b'], ['c']])).toEqual(output)
})

it("doesn't shuffle ungrouped columns if requested", () => {
  // prettier-ignore
  const table = [
    { a: 1,  b: 2,  c: 3,  d: 4,  e: 5  },
    { a: 6,  b: 7,  c: 8,  d: 9,  e: 10 },
    { a: 11, b: 12, c: 13, d: 14, e: 15 },
  ]
  // prettier-ignore
  const output = [
    { a: 1,  b: 2,  c: 13, d: 4,  e: 5 },
    { a: 6,  b: 7,  c: 3,  d: 9,  e: 10 },
    { a: 11, b: 12, c: 8,  d: 14, e: 15 },
  ]

  expect(rng_alea.shuffleTable(table, [['a', 'b'], ['c']], false)) //
    .toEqual(output)
})

it('generates a random v4 uuid', () => {
  expect(rng_alea.uuid4()).toEqual('bcd644f6-0ee1-4006-bb7b-70dfdcef7c41')
  expect(rng_random.uuid4()).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[8-9a-b][0-9a-f]{3}-[0-9a-f]{12}$/,
  )
})
