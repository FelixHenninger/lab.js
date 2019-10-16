export const maxRunLength = (arr) => {
  // Given an array, compute the longest consecutive
  // sequence of identical elements
  if (arr.length === 0) return 0

  let longestSequenceLength = 1
  let currentSequenceLength = 1

  for (let i = 0; i < arr.length; i++) {
    if (currentSequenceLength > longestSequenceLength) {
      longestSequenceLength = currentSequenceLength
    }

    if (arr[i] === arr[i+1]) {
      currentSequenceLength++
    } else {
      currentSequenceLength = 1
    }
  }

  return longestSequenceLength
}

/*
  TODO: Automate checking of private helper functions
  const testCases = [
    [[1, 2, 3], 1],
    [[1, 2, 3, 3], 2],
    [[1, 1, 2, 3], 2],
    [[1, 2, 2, 3], 2],
    [[1, 1, 2, 2, 2, 3, 4, 4, 4], 3],
    [[], 0]
  ]
*/
