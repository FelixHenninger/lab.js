import { sum } from '../stats'

// Weighted random index
// This follows Eli Bendersky's implementation in Python,
// and will perform better if the weights are sorted in
// descending order. For further information, please see
// https://eli.thegreenplace.net/2010/01/22/weighted-random-generation-in-python
export const weightedIndex = (weights: number[], rng = Math.random): number => {
  let rnd = rng() * sum(weights)
  for (let i = 0; i < weights.length; i++) {
    rnd -= weights[i]
    if (rnd < 0) {
      return i
    }
  }
  // We shouldn't ever get here if the weights are specified correctly
  throw new Error(`Couldn't compute weighted index with weights ${weights.join(', ')}`)
}
