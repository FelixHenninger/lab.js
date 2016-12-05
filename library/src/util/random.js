import { impl } from '../vendor/alea'

// Random uuid4 generation
export const uuid4 = (random=Math.random) =>
  // This is adapted from Jed Schmidt's code,
  // which is available under the DWTFYWTPL
  // at https://gist.github.com/jed/982883
  // (there are faster and shorter implemen-
  // tations, but this one is the clearest)
  '00000000-0000-4000-8000-000000000000'.replace(
      /[08]/g,
      v => (v ^ (random() * 16 >> v / 4)).toString(16),
    )

export class Random {
  constructor(options={}) {
    if (options.algorithm === 'alea') {
      // If no seed is given, autoseed the PRNG using
      // a (mostly) random 256-character string
      // (This seeding mechanism is loosely based on
      // the priming mechanism in the seedrandom package
      // by David Bau, https://github.com/davidbau/seedrandom)
      if (!options.seed) {
        // IE 11 uses a vendor prefix for the crypto module
        const randomValues = (window.mscrypto || window.crypto)
          .getRandomValues(new Uint8Array(256))
        options.seed = String.fromCharCode(...randomValues)
      }
      // Generate a PRNG using the alea algorithm
      this.random = impl(options.seed)
    } else {
      // Fallback to the built-in random generator
      this.random = Math.random
    }
  }

  // Random integer within a specified range
  // (specifically, the output for a ceiling
  // n is an integer between 0 and n - 1 )
  range(ceiling) {
    return Math.floor(this.random() * ceiling)
  }

  // Draw a random element from an array
  sample(array) {
    return array[this.range(array.length)]
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
      const randomIndex = this.range(unshuffledElements--);

      // Swap the last unshuffled value with
      // the randomly chosen array element
      [array[unshuffledElements], array[randomIndex]] =
        [array[randomIndex], array[unshuffledElements]]
    }

    return array
  }

  uuid4() {
    return uuid4(this.random)
  }
}
