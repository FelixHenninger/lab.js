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

  [Symbol.iterator]() {
    // Extract iterator from iterable
    const iterator = this.#iterable[Symbol.iterator]()

    return {
      next: (): IteratorResult<T> => {
        if (this.#running) {
          return iterator.next()
        } else {
          return { done: true, value: null }
        }
      },
      peek: () => {
        for (const c of this.#iterable) {
          console.log('Found component', c)
        }
      },
    }
  }
}
