export class CustomIterable<T> {
  #iterable: Iterable<T>
  #running: boolean

  constructor(iterable: Iterable<T>) {
    this.#iterable = iterable
    this.#running = true
  }

  flush() {
    this.#running = false
  }

  [Symbol.iterator](): CustomIterator<T> {
    // Extract iterator from iterable
    let iterator = this.#iterable[Symbol.iterator]()

    return {
      next: (): IteratorResult<T> => {
        if (this.#running) {
          return iterator.next()
        } else {
          return { done: true, value: null }
        }
      },
      peek: () =>
        //@ts-ignore
        Array.from(this.#iterable).map(c => [c.id, c.options.title, c.type]),
      reset: () => {
        iterator = this.#iterable[Symbol.iterator]()
        this.#running = true
      },
    }
  }

  static empty() {
    return new CustomIterable([])
  }

  static emptyIterator() {
    return CustomIterable.empty()[Symbol.iterator]()
  }
}
