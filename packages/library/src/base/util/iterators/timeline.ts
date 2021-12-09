import { fastForward } from './fastforward'

interface NestedIterable<T> extends Iterable<T | NestedIterable<T>> {}
interface TimelineIterator<T> extends Iterator<(T | NestedIterable<T>)[]> {
  splice: (level: number) => void
  findSplice: (value: T | NestedIterable<T>) => void
  fastForward: (
    consume: (value: T | NestedIterable<T>, level: number) => boolean,
  ) => void
}

export class SliceIterator<T> {
  #root: NestedIterable<T>
  #extractIterator: (v: NestedIterable<T>) => Iterator<T | NestedIterable<T>>

  constructor(root: NestedIterable<T>) {
    this.#root = root
    this.#extractIterator = v => v[Symbol.iterator]()
  }

  [Symbol.iterator](): TimelineIterator<T> {
    const iteratorStack = [this.#extractIterator(this.#root)]
    const outputStack: (T | NestedIterable<T>)[] = [this.#root]
    let tempLeaf: T | undefined = undefined

    return {
      next: (): IteratorResult<(T | NestedIterable<T>)[]> => {
        // If another method has created a temporary stack,
        // output that, and then make sure we return to
        // normal iteration on the next call.
        if (tempLeaf) {
          const output = [...outputStack, tempLeaf]
          tempLeaf = undefined
          return { value: output, done: false }
        }

        while (iteratorStack.length > 0) {
          const currentLeaf = iteratorStack[iteratorStack.length - 1]
          const { value, done } = currentLeaf.next()

          if (done) {
            iteratorStack.pop()
            outputStack.pop()
          } else {
            if (Symbol.iterator in value) {
              outputStack.push(value)
              iteratorStack.push(this.#extractIterator(value))
            } else {
              return { value: [...outputStack, value], done: false }
            }
          }
        }

        return { value: undefined, done: true }
      },
      splice: level => {
        iteratorStack.splice(level)
        outputStack.splice(level)
      },
      findSplice: function (value: T | NestedIterable<T>) {
        const level = outputStack.indexOf(value)
        if (level >= 0) {
          this.splice(level)
        }
      },
      fastForward: (
        consume: (value: T | NestedIterable<T>, level: number) => boolean,
      ) => {
        // Starting from the root node ...
        iteratorStack.splice(1)
        outputStack.splice(1)
        let currentLevel = 0

        // ... rebuild the iterator stack and
        // the output level by level
        while (true) {
          const iterator = iteratorStack[currentLevel]
          const [{ value, done }] = fastForward(iterator, v =>
            consume(v, currentLevel + 1),
          )

          // If we reach an iterator that's done,
          // we stop there and let the regular algorithm
          // take over from there (continuing one level up)
          if (done) {
            break
          }

          // Continue if the next entry
          // is also an iterator
          if (Symbol.iterator in value) {
            iteratorStack.push(value[Symbol.iterator]())
            outputStack.push(value)
            currentLevel += 1
          } else {
            // If we run into a leaf node, that's
            // where we pick back up.
            tempLeaf = value
            break
          }
        }
      },
    }
  }
}
