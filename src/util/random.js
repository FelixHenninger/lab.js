import { impl } from '../vendor/alea'

export class Random {
  constructor(options) {
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
  shuffle(array) {
    // Fisher-Yates (a.k.a. Durstenfeld, a.k.a. Knuth)
    // in-place array shuffle algorithm
    //
    // At the beginning, all elements are unshuffled
    let unshuffledElements = array.length

    // Until there are no more unshuffled
    // elements in the array ...
    while (unshuffledElements !== 0) {
      // Pick a random as-yet-unshuffleded array element
      const randomIndex = this.range(unshuffledElements--);

      // Swap the last unshuffled value with
      // the randomly chosen array element
      [array[unshuffledElements], array[randomIndex]] =
        [array[randomIndex], array[unshuffledElements]]
    }

    return array
  }

}
