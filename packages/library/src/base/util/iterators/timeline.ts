export class SliceIterator<T> {
  #root: Iterable<T | Iterable<T>>

  constructor(root: Iterable<T>) {
    this.#root = root
  }

  [Symbol.iterator](): Iterator<Array<T | Iterable<T>>> {
    const iteratorStack = [this.#root[Symbol.iterator]()]
    const outputStack = [this.#root]

    return {
      next: (): IteratorResult<T> => {
        while (iteratorStack.length > 0) {
          const currentLeaf = iteratorStack[iteratorStack.length - 1]
          const { value, done } = currentLeaf.next()

          if (done) {
            iteratorStack.pop()
            outputStack.pop()
          } else {
            if (Symbol.iterator in value) {
              outputStack.push(value)
              iteratorStack.push(value[Symbol.iterator]())
            } else {
              return { value: [...outputStack, value], done: false }
            }
          }
        }

        return { value: undefined, done: true }
      },
      //@ts-ignore
      splice: level => {
        iteratorStack.splice(level)
        outputStack.splice(level)
      },
      }
    }
  }
}
