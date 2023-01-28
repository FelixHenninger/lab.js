import { sum, mean, variance, std } from './stats'

it('calculates the sum of an array', () => {
  expect(sum([1, 2, 3])).toBe(6)
})

it('calculates the mean of an array', () => {
  expect(mean([1, 2, 3])).toBe(2)
})

it('calculates the variance of an array', () => {
  expect(variance([1, 2, 3])).toBe(2 / 3)
})

it('calculates the standard deviation of an array', () => {
  expect(std([1, 2, 3])).toBe(Math.sqrt(2 / 3))
})
