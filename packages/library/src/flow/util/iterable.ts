import { Component } from '../../base'
import { CustomIterator, componentSummary } from '../../base/util/iterators/interface'

type Summarizer<From, To> = (input: From) => To

export class CustomIterable<T, S = componentSummary> {
  #iterable: Iterable<T>
  #running: boolean
  #peekMap: Summarizer<T, S>

  constructor(
    iterable: Iterable<T>,
    //@ts-ignore
    peekMap: Summarizer<T, S> = (c: Component) => ([c.id, c.options.title, c.type] as unknown as componentSummary),
  ) {
    this.#iterable = iterable
    this.#running = true
    this.#peekMap = peekMap
  }

  flush() {
    this.#running = false
  }

  [Symbol.iterator](): CustomIterator<T, S> {
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
      //@ts-ignore
      peek: (): S[] => Array.from(this.#iterable).map(this.#peekMap),
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
