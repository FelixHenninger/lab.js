import { range } from 'lodash'

import { Random } from '../../util/random'

export function sampleMode<T>(
  rng: Random,
  array: T[],
  samples?: number,
  mode = 'draw-shuffle',
): T[] {
  if (!(Array.isArray(array) && array.length > 0)) {
    throw new Error("Can't sample: Empty input, or not an array")
  }

  const n = samples || array.length
  const repetitions = Math.floor(n / array.length)
  const remainder = n % array.length

  switch (mode) {
    case 'sequential':
      return [
        // Repeat the array
        ...range(repetitions).reduce(a => a.concat(array), [] as any[]),
        // Append remainder
        ...array.slice(0, remainder),
      ]
    case 'draw':
    case 'draw-shuffle':
      const output = [
        // Repeat the array
        ...range(repetitions).reduce(
          a => a.concat(rng.shuffle(array)),
          [] as any[],
        ),
        // Append remainder
        ...rng.sample(array, remainder, false),
      ]
      // Shuffle again if oversampling and so instructed
      if (mode === 'draw-shuffle' && n > array.length) {
        return rng.shuffle(output)
      } else {
        return output
      }
    case 'draw-replace':
      return rng.sample(array, n, true)
    default:
      throw new Error('Unknown sample mode, please specify')
  }
}
