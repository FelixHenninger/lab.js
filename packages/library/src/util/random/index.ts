import { clamp, range, isFunction, pick, flatten, omit, merge } from 'lodash'
//@ts-ignore 2307
import alea from 'seedrandom/lib/alea'

import { uuid4 } from './uuid'
import { autoSeed } from './seed'
import { maxRepSeries, minRepDistance } from './constraints'
import { weightedIndex } from './weighted'

export type RNGOptions = {
  algorithm?: string
  seed?: any
}

type ShuffleConstraints = {
  maxRepSeries?: number
  minRepDistance?: number
}

type ShuffleHelpers = {
  equality?: (a: any, b: any) => boolean
  hash?: (a: any) => string
}

export class Random {
  random: () => number

  constructor(options: RNGOptions = {}) {
    if (options.algorithm === 'alea') {
      // Generate a PRNG using the alea algorithm
      this.random = alea(options.seed ?? autoSeed())
    } else {
      // Fallback to the built-in random generator
      this.random = Math.random
    }
  }

  // Random integer within a specified range
  // (for a single value, the return value will be between 0 and max - 1,
  // for two input values, between min and max - 1)
  range(a: number, b?: number) {
    // eslint-disable-next-line no-multi-spaces
    const min = b === undefined ? 0 : a
    const range = b === undefined ? a : b - a

    return min + Math.floor(this.random() * range)
  }

  // Draw a random element from an array
  choice(array: any[], weights?: number[]) {
    if (weights !== undefined) {
      return array[weightedIndex(weights, this.random)]
    } else {
      return array[this.range(array.length)]
    }
  }

  // Sample multiple random elements from an array,
  // with or without replacement
  sample(array: any[], n = 1, replace = false) {
    if (replace) {
      // Draw independent samples
      return Array(n)
        .fill(0)
        .map(() => this.choice(array))
    } else {
      // Draw without replacement
      // (shuffle and slice up to array length)
      return this.shuffle(array).slice(0, clamp(n, array.length))
    }
  }

  sampleMode(array: any[], samples?: number, mode = 'draw-shuffle') {
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
            a => a.concat(this.shuffle(array)),
            [] as any[],
          ),
          // Append remainder
          ...this.sample(array, remainder, false),
        ]
        // Shuffle again if oversampling and so instructed
        if (mode === 'draw-shuffle' && n > array.length) {
          return this.shuffle(output)
        } else {
          return output
        }
      case 'draw-replace':
        return this.sample(array, n, true)
      default:
        throw new Error('Unknown sample mode, please specify')
    }
  }

  // Shuffle an array randomly
  shuffle(a: any[]): any[] {
    // Copy the input array first
    const array = a.slice()

    // Fisher-Yates (a.k.a. Durstenfeld, a.k.a. Knuth)
    // in-place array shuffle algorithm
    //
    // At the beginning, all elements are unshuffled
    let unshuffledElements = array.length

    // Until there are no more unshuffled
    // elements in the array ...
    while (unshuffledElements !== 0) {
      // Pick a random as-yet-unshuffleded array element
      // (note that the semicolon here is mandatory)
      // eslint-disable-next-line no-plusplus
      const randomIndex = this.range(unshuffledElements--)

      // Swap the last unshuffled value with
      // the randomly chosen array element
      ;[array[unshuffledElements], array[randomIndex]] = [
        array[randomIndex],
        array[unshuffledElements],
      ]
    }

    return array
  }

  constrainedShuffle(
    a: any[],
    constraints: ShuffleConstraints,
    helpers: ShuffleHelpers = {},
    maxIterations = 10 ** 4,
    failOnMaxIterations = false,
  ) {
    // Generate constraint function, if necessary
    let constraintChecker
    if (isFunction(constraints)) {
      constraintChecker = constraints
    } else {
      const checks: Function[] = []
      if (constraints.maxRepSeries) {
        checks.push(maxRepSeries(constraints.maxRepSeries, helpers.equality))
      }
      if (constraints.minRepDistance) {
        checks.push(minRepDistance(constraints.minRepDistance, helpers.hash))
      }

      // Combine constraints into checker function
      constraintChecker = (arr: any[]) =>
        checks.reduce(
          (accumulator, check) => accumulator && check(arr),
          true, // start with true
        )
    }

    // Shuffle until a candidate matches the constraints,
    // or the maximum number of iterations is reached
    let candidate, i
    for (i = 0; i < maxIterations; i++) {
      candidate = this.shuffle(a)
      if (constraintChecker(candidate)) break
    }
    if (i >= maxIterations) {
      const warning = `constrainedShuffle could not find a matching candidate after ${maxIterations} iterations`
      if (failOnMaxIterations) {
        throw new Error(warning)
      } else {
        console.warn(warning)
      }
    }
    return candidate
  }

  // Given an array of objects, shuffle groups
  // of keys independently.
  shuffleTable(
    table: Record<string, any>[],
    columnGroups: string[] = [],
    shuffleUngrouped = true,
  ) {
    // Split data into independent groups
    const groupedData = columnGroups.map(columns =>
      table.map(entry => pick(entry, columns)),
    )

    // Collect remaining entries
    const groupedColumns = flatten(columnGroups)
    const remainingData = table.map(entry => omit(entry, groupedColumns))

    // Shuffle and merge data
    // (moving things into a temporary key,
    // to meet lodash input requirements)
    return merge(
      {}, // Added to pacify TS
      ...groupedData.map(g => ({ data: this.shuffle(g) })),
      // Shuffle ungrouped columns if requested
      { data: shuffleUngrouped ? this.shuffle(remainingData) : remainingData },
    ).data
  }

  uuid4() {
    return uuid4(this.random)
  }
}
