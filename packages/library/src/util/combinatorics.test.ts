import { product } from './combinatorics'

it('is a generator', () => {
  const GeneratorFunction = Object.getPrototypeOf(function* () {}).constructor
  expect(product).toBeInstanceOf(GeneratorFunction)
})

it('produces 2d set products', () => {
  expect(Array.from(product([1, 2, 3], ['a', 'b', 'c']))).toEqual([
    [1, 'a'],
    [1, 'b'],
    [1, 'c'],
    [2, 'a'],
    [2, 'b'],
    [2, 'c'],
    [3, 'a'],
    [3, 'b'],
    [3, 'c'],
  ])
})

it('produces 3d set products', () => {
  expect(Array.from(product(['A', 'B'], [1, 2, 3, 4], ['a', 'b']))).toEqual([
    ['A', 1, 'a'],
    ['A', 1, 'b'],
    ['A', 2, 'a'],
    ['A', 2, 'b'],
    ['A', 3, 'a'],
    ['A', 3, 'b'],
    ['A', 4, 'a'],
    ['A', 4, 'b'],
    ['B', 1, 'a'],
    ['B', 1, 'b'],
    ['B', 2, 'a'],
    ['B', 2, 'b'],
    ['B', 3, 'a'],
    ['B', 3, 'b'],
    ['B', 4, 'a'],
    ['B', 4, 'b'],
  ])
})

it('cartesian product accounts for empty sets', () => {
  expect(Array.from(product(['A', 'B'], [], ['a', 'b']))).toEqual([
    ['A', undefined, 'a'],
    ['A', undefined, 'b'],
    ['B', undefined, 'a'],
    ['B', undefined, 'b'],
  ])
})
