export const fastForward = function <T>(
  iterator: Iterator<T>,
  tester: (value: T) => boolean,
): [IteratorResult<T>, Iterator<T>] {
  let { value, done } = iterator.next()

  while (!done && !tester(value)) {
    ({ value, done } = iterator.next())
  }

  return [{ value, done }, iterator]
}
