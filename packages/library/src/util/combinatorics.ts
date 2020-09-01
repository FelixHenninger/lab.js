// Cartesian product of sets
// @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'sets' implicitly has an 'any[]' ty... Remove this comment to see the full error message
export const product = function* (...sets) {
  // Compute number of combinations to be had
  // from any set and all others to its right
  // (empty sets always contribute one value, undefined)
  const thresholds = sets
    .map(s => Math.max(s.length, 1)) // Map out lengths and ...
    .reverse() // ... compute the backwards cumulative product
    .reduce(
      (acc, current, i) => acc.concat([
        // @ts-expect-error ts-migrate(2769) FIXME: Type 'number' is not assignable to type 'never'.
        (acc[i - 1] || 1) * current,
      ]), [],
    )
    .reverse()

  // Yield the appropriate entry from every set
  for (let counter = 0; counter < thresholds[0]; counter++) {
    yield sets.map(
      (s, i) => s[Math.floor(counter / (thresholds[i + 1] || 1)) % s.length]
    )
  }
}
