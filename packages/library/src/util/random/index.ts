import { clamp, isFunction, pick, flatten, omit, merge } from 'lodash'
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

const isShuffleConstraint = function (c: any): c is ShuffleConstraints {
  return !(
    !('maxRepSeries' in c && typeof c.maxRepSeries == 'number') &&
    !('minRepDistance' in c && typeof c.minRepDistance == 'number')
  )
}

const isCheckFunction = function (f: any): f is (a: any[]) => boolean {
  return isFunction(f)
}

type ConstraintDefinitions = {
  equality?: (a: any, b: any) => boolean
  hash?: (a: any) => string
}

/**
 * The `Random` class represents a random generator that will provide
 * random numbers (integers and floats), draw samples and shuffle
 * sequences, and perform many more useful tasks.
 *
 * It will optionally do so quasi- randomly based on a (pre-defined or
 * internally generated) random seed. In this case, it will rely on the
 * Alea algorithm suggested by Johannes Baagøe.
 *
 * By default, however, the random utility will use the browser's
 * built-in `Math.random()` method, which cannot be seeded.
 */
export class Random {
  #rng: () => number

  /**
   * Create a new `Random` instance
   *
   * You can specify two options that define its behavior:
   *
   * * `algorithm` (empty or `'alea'`): RNG algorithm to use. Note that
   *   the Alea algorithm trades off the recurrance period for
   *   (blazingly fast) performance.
   * * `seed` (optional): Initial value that determines the RNG's
   *   sequence (only used if the algorithm is Alea). If left unset,
   *   generate a seed internally using the browser's cryptographic
   *   random generator.
   *
   * @param options - RNG settings
   * @public
   */
  constructor(options: RNGOptions = {}) {
    if (options.algorithm === 'alea') {
      // Generate a PRNG using the alea algorithm
      this.#rng = alea(options.seed ?? autoSeed())
    } else {
      // Fallback to the built-in random generator
      this.#rng = Math.random
    }
  }

  /**
   * Random number generator
   *
   * @returns A floating-point number in the range from `0` (inclusive)
   *  to `1` (exclusive).
   */
  random() {
    return this.#rng()
  }

  /**
   * Draw a random integer within a specified range
   *
   * Returns an integer value in the range [start, stop), or, if no
   * start value is specified, in [0, stop). Note that the upper limit
   * is exclusive: the stop value is never drawn.
   *
   * @param start - Minimum value (defaults to zero)
   * @param stop - Ceiling value (first integer never drawn)
   */
  range(stop: number): number
  range(start: number, stop: number): number
  range(a: number, b?: number) {
    const min = b === undefined ? 0 : a
    const range = b === undefined ? a : b - a

    return min + Math.floor(this.#rng() * range)
  }

  /**
   * Draw a random element from an array
   *
   * @param array - Input array
   * @param weights - Optional weights
   * @returns A random element from the array
   */
  choice<T>(array: T[], weights?: number[]): T {
    if (weights !== undefined) {
      return array[weightedIndex(weights, this.#rng)]
    } else {
      return array[this.range(array.length)]
    }
  }

  /**
   * Sample multiple random elements from an array, with or without
   * replacement
   *
   * @param array - Input array
   * @param n - Sample size
   * @param replace - Whether to draw with replacement or without
   *  replacement (default)
   * @returns Subset of the array
   */
  sample<T>(array: T[], n = 1, replace = false): T[] {
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

  /**
   * Shuffle an array
   *
   * Applies the Fisher-Yates (a.k.a. Durstenfeld, a.k.a. Knuth) shuffle
   * algorithm.
   *
   * @param a - Input array
   * @returns Shuffled copy of the input
   */
  shuffle<T>(a: T[]): T[] {
    // Copy the input array first
    const array = a.slice()

    // At the beginning, all elements are unshuffled
    let unshuffledElements = array.length

    // Until there are no more unshuffled
    // elements in the array ...
    while (unshuffledElements !== 0) {
      // Pick a random as-yet-unshuffleded array element
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

  /**
   * Shuffle an array subject to constraints
   *
   * This helper will shuffle an array until a set of constraints are
   * met. The constraints are defined as `checks` that are applied to
   * every shuffled candidate. If they fail, the array is shuffled anew
   * and checked again, until the checks pass or the number of
   * `maxIterations` is reached.
   *
   * The `checks` are defined either as a custom function, or in terms
   * of pre-defined constraints concerning the maximum number of
   * repetitions of a value in sequence (`maxRepSeries`), or the minimum
   * distance between successive repetitions of a value
   * (`minRepDistance`).
   *
   * For either of these pre-made constraints, further definitions of
   * what constitutes a repetition can be supplied:
   *
   * * `equality` defines a function that decides if two input values
   *   are equal.
   * * `hash` derives a value from an input, which is then checked for
   *   equality.
   *
   * Finally, `maxIterations` limits the number of times the function
   * will try to shuffle and check, and `failOnMaxIterations` defines
   * whether it will throw an error if this limit is exceeded, or fail
   * silently, returning the last (imperfect) candidate.
   *
   * @param a - Input array
   * @param checks - Function to check the shuffled array, or constraint
   *   specifications as an object
   * @param definitions - Definitions of `equality` check or `hash`
   *   function used for checking pre-defined constraints
   * @param maxIterations - Maximum number of shuffle-check iterations
   *   to go through before giving up
   * @param failOnMaxIterations - Whether to silently fail (with a
   *   warning on the console) or to throw an error if the maximum
   *   number of iterations is passed
   * @returns A shuffled copy of the input array, subject to defined
   *   constraints
   *
   * ## Defining constraints
   *
   * The `checks` argument can be used to define desired properties of
   * the shuffled result, specifically the *maximum number of
   * repetitions* of the same value in series, and the *minimum distance
   * between repetitions* of the same value. These are defined using the
   * `maxRepSeries` and `minRepDistance` parameters, respectively.
   *
   * `maxRepSeries` restricts the number of repetitions of the same
   * value in immediate succession. For example, `maxRepSeries: 1`
   * ensures that no value appears twice in sequence::
   *
   * @example
   * ```js
   * // Create a new RNG for demo purposes. Inside a component,
   * // scripts can use the built-in RNG via this.random
   * const rng = new lab.util.Random()
   *
   * rng.constrainedShuffle( // (I was a terror since the public school era)
   *   ['party', 'party', 'bullsh!*', 'bullsh!*'],
   *   { maxRepSeries: 1 }
   * )
   * // ➝ ['party', 'bullsh!*', 'party', 'bullsh!*']
   * ```
   *
   * Similarly, `minRepDistance` ensures a minimum distance between
   * successive repetitions of the same value (and implies
   * `maxRepSeries: 1`). Note that `maxRepDistance: 2` requires
   * that there is at least one other entry in the shuffled array
   * between subsequent repetitions of the same entry, `3` requires
   * two entries in between, and so on:
   *
   * @example
   * ```js
   * rng.constrainedShuffle(
   *   ['dj', 'dj', 'fan', 'fan', 'freak', 'freak'],
   *   { minRepDistance: 3 }
   * )
   * // ➝ ['dj', 'fan', 'freak', 'dj', ...]
   * ```
   *
   * **Custom constraint checkers**
   *
   * As an alternative to desired properties of the shuffled result, it's possible to define a custom constraint checker. This is a function that evaluates a shuffled candidate array, and returns ``true`` or ``false`` to accept or reject the shuffled candidate, depending on whether it meets the desired properties::
   *
   * @example
   * ```js
   * // Function that evaluates to true only if
   * // the first array entry matches the provided value.
   * const firstThingsFirst = array => array[0] === "I'm the realest"
   *
   * rng.constrainedShuffle(
   *   [
   *     "I'm the realest",
   *     "givin' lessons in physics",
   *     "put my name in bold",
   *     "bring the hooks in, where the bass at?",
   *     // ... who dat, who dat?
   *   ],
   *   firstThingsFirst
   * )
   * // ➝ Shuffled result with fixed first entry
   * ```
   *
   * ## Limitations
   *
   * Please note that this function uses a very naive approach, in that
   * it assumes that randomly shuffling the order will arrive at an
   * acceptable solution eventually. Depending on the complexity of the
   * constraints, this might not be realistic -- if solutions are
   * sparse, the algorithm will will try many permutations in vain,
   * which gets computationally expensive fast, and may not ever lead to
   * a solution that meets your requirements. It's always worth checking
   * whether the algorithm consistently arrives at a solution for your
   * use-case. If you find yourself cranking up the `maxIterations`,
   * it's likely worth thinking about applying a more thoughtful
   * approach, such as constructing the output array
   */
  constrainedShuffle<T>(
    a: T[],
    checks: ((a: T[]) => boolean) | ShuffleConstraints,
    definitions: ConstraintDefinitions = {},
    maxIterations = 10 ** 4,
    failOnMaxIterations = false,
  ): T[] {
    // Generate constraint function, if necessary
    let constraintChecker: (a: T[]) => boolean
    if (isCheckFunction(checks)) {
      constraintChecker = checks
    } else if (isShuffleConstraint(checks)) {
      const constraints: Function[] = []
      if (checks.maxRepSeries) {
        constraints.push(
          maxRepSeries(checks.maxRepSeries, definitions.equality),
        )
      }
      if (checks.minRepDistance) {
        constraints.push(
          minRepDistance(checks.minRepDistance, definitions.hash),
        )
      }

      // Combine constraints into checker function
      constraintChecker = (arr: T[]) =>
        constraints.reduce(
          (accumulator, check) => accumulator && check(arr),
          true, // start with true
        )
    } else {
      throw new Error(`Invalid constraint check definition ${checks}`)
    }

    // Shuffle until a candidate matches the constraints,
    // or the maximum number of iterations is reached
    let candidate: T[], i
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
    return candidate!
  }

  // Given an array of objects, shuffle groups
  // of keys independently.
  shuffleTable(
    table: Record<string, any>[],
    columnGroups: string[][] = [],
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

  /**
   * Generate a version 4 (random) UUID
   *
   * The UUID follows the RFC 4122 standard. Please consult
   * [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random))
   * for further information regarding the exact definition and format.
   *
   * @returns A random UUID
   */
  uuid4() {
    return uuid4(this.#rng)
  }
}
