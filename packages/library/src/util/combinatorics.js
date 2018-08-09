// Cartesian product of sets
export const product = function* (...sets) {
  // Compute number of combinations to be had
  // from any set and all others to its right
  let thresholds = sets
    .map(s => s.length) // Map out lengths and ...
    .reverse() // ... compute the backwards cumulative product
    .reduce(
      (acc, current, i) => acc.concat([
        (acc[i - 1] || 1) * current
      ]), []
    )
    .reverse()

  // Yield the appropriate entry from every set
  for (let counter = 0; counter < thresholds[0]; counter++) {
    yield sets.map(
      (s, i) => s[Math.floor(counter / (thresholds[i + 1] || 1)) % s.length]
    )
  }
}
