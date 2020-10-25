export class CustomIterator<T> {
  private iterable: IterableIterator<T>
  private running: boolean

  constructor(iterable: IterableIterator<T>) {
    this.iterable = iterable
    this.running = true
  }

  flush() {
    this.running = false
  }

  [Symbol.iterator]() {
    return {
      next: (): IteratorResult<T> => {
        if (this.running) {
          return this.iterable.next()
        } else {
          return { done: true, value: null }
        }
      },
    }
  }
}
