import { sampleMode } from './sample'
import { Random } from '../../util'

let rng_alea: Random
const array = [1, 2, 3, 4, 5]

beforeEach(() => {
  rng_alea = new Random({
    algorithm: 'alea',
    seed: 'abcd',
  })
})

test('sampleMode supports sequential mode', () => {
  expect(
    sampleMode(rng_alea, array, 12, 'sequential'), //
  ).toEqual(
    [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2], //
  )
})

test('sampleMode supports draw-then-repeat sample mode', () => {
  expect(
    sampleMode(rng_alea, array, 12, 'draw'), //
  ).toEqual(
    [2, 1, 3, 5, 4, 3, 1, 5, 4, 2, 2, 3], //
  )
})

test('sampleMode supports draw-then-repeat-then-shuffle sample mode', () => {
  expect(
    sampleMode(rng_alea, array, 12, 'draw-shuffle'), //
  ).toEqual(
    [3, 1, 3, 5, 3, 2, 2, 5, 1, 4, 4, 2], //
  )
})

test('sampleMode defers sampling with replacement to sample method', () => {
  const spy = jest.spyOn(rng_alea, 'sample')

  sampleMode(rng_alea, array, 12, 'draw-replace'),
    expect(spy).toHaveBeenCalled()
  expect(spy).toHaveBeenCalledWith(array, 12, true)
})

test('sampleMode does not subsample if no number of samples is provided', () => {
  expect(
    sampleMode(rng_alea, array, undefined, 'draw-shuffle'), //
  ).toEqual(
    [2, 1, 3, 5, 4], //
  )
})

test('sampleMode throws an error if asked to sample from an empty array', () => {
  expect(
    () => sampleMode(rng_alea, []), //
  ).toThrowError(
    "Can't sample: Empty input, or not an array", //
  )
})

test('sampleMode throws an error if the sample mode is unknown', () => {
  expect(
    () => sampleMode(rng_alea, array, 2, 'unknown'), //
  ).toThrowError(
    'Unknown sample mode, please specify', //
  )
})
