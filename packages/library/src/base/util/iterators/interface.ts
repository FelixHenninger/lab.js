export interface CustomIterator<T, TReturn = any, TNext = undefined>
  extends Iterator<T, TReturn, TNext> {
  peek: () => [String, String, String][]
  reset: () => void
}
