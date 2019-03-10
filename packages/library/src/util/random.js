import { clamp, range, pick, flatten, omit, merge  } from 'lodash'
import { alea } from 'seedrandom'

// Random uuid4 generation
export const uuid4 = (random=Math.random) =>
  // This is adapted from Jed Schmidt's code,
  // which is available under the DWTFYWTPL
  // at https://gist.github.com/jed/982883
  // (there are faster and shorter implemen-
  // tations, but this one is the clearest)
  '00000000-0000-4000-8000-000000000000'.replace(
    /[08]/g,
    // eslint-disable-next-line no-bitwise
    v => (v ^ (random() * 16 >> v / 4)).toString(16),
  )

// Seed generation
// This is adapted from the seedrandom implementation,
// but (drastically) simplified at the cost of node.js
// and legacy browser compatibility
export const autoSeed = (width=256) => {
  // Create and fill an array of random integers
  const output = new Uint8Array(width);
  (window.crypto || window.msCrypto).getRandomValues(output)

  // Output as string of (UTF-16) characters
  return String.fromCharCode.apply(null, output)
}

export class Random {
  constructor(options={}) {
    if (options.algorithm === 'alea') {
      // Generate a PRNG using the alea algorithm
      this.random = alea(options.seed)
    } else {
      // Fallback to the built-in random generator
      this.random = Math.random
    }
  }

  // Random integer within a specified range
  // (for a single value, the return value will be between 0 and max - 1,
  // for two input values, between min and max - 1)
  range(a, b=undefined) {
    // eslint-disable-next-line no-multi-spaces
    const min   = b === undefined ? 0 : a
    const range = b === undefined ? a : b - a

    return min + Math.floor(this.random() * range)
  }

  // Draw a random element from an array
  choice(array) {
    return array[this.range(array.length)]
  }

  // Sample multiple random elements from an array,
  // with or without replacement
  sample(array, n=1, replacement=false) {
    if (replacement) {
      // Draw independent samples
      return Array(n).fill(0).map(() => this.choice(array))
    } else {
      // Draw without replacement
      // (shuffle and slice up to array length)
      return this.shuffle(array).slice(0, clamp(n, array.length))
    }
  }

  sampleMode(array, samples, mode="draw") {
    const n = samples || array.length
    const repetitions = Math.floor(n / array.length)
    const remainder = n % array.length

    switch(mode) {
      case 'sequential':
        return [
          // Repeat the array
          ...range(repetitions).reduce(
            a => a.concat(array), []
          ),
          // Append remainder
          ...array.slice(0, remainder)
        ]
      case 'draw':
      case 'draw-shuffle':
        const output = [
          // Repeat the array
          ...range(repetitions).reduce(
            a => a.concat(this.shuffle(array)), []
          ),
          // Append remainder
          ...this.sample(array, remainder, false)
        ]
        if (mode === 'draw') {
          return output
        } else if (mode === 'draw-shuffle') {
          return this.shuffle(output)
        }
      case 'draw-replace':
        return this.sample(array, n, true)
      default:
        throw new Error('Unknown sample mode, please specify')
    }
  }

  // Shuffle an array randomly
  shuffle(a) {
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
      const randomIndex = this.range(unshuffledElements--);

      // Swap the last unshuffled value with
      // the randomly chosen array element
      [array[unshuffledElements], array[randomIndex]] =
        [array[randomIndex], array[unshuffledElements]]
    }

    return array
  }

  // Given an array of objects, shuffle groups
  // of keys independently.
  shuffleTable(data, groups=[], shuffleUngrouped=true) {
    // Split data into independent groups
    const groupedData = groups.map(
      columns => data.map(entry => pick(entry, columns))
    )

    // Collect remaining entries
    const groupedColumns = flatten(groups)
    const remainingData = data.map(entry => omit(entry, groupedColumns))

    // Shuffle and merge data
    // (moving things into a temporary key,
    // to meet lodash input requirements)
    return merge(
      ...groupedData.map(
        g => ({ data: this.shuffle(g) })
      ),
      // Shuffle ungrouped columns if requested
      { data: shuffleUngrouped ? this.shuffle(remainingData) : remainingData }
    ).data
  }

  uuid4() {
    return uuid4(this.random)
  }
}
