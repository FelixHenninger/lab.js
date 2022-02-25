import { fastForward } from './fastforward'

interface NestedIterable<T> extends Iterable<T | NestedIterable<T>> {
  peek?: () => void
}
interface TimelineIterator<T> extends AsyncIterator<(T | NestedIterable<T>)[]> {
  initialize: () => Promise<void>
  splice: (level: number) => void
  findSplice: (value: T | NestedIterable<T>) => void
  fastForward: (
    consume: (value: T | NestedIterable<T>, level: number) => boolean,
  ) => Promise<void>
  peek: () => void
}

export class SliceIterable<T> {
  #root: NestedIterable<T>
  #extractIterator: (
    v: NestedIterable<T>,
  ) => Promise<Iterator<T | NestedIterable<T>>>
  #checkIterator: (v: NestedIterable<T>) => boolean

  // TODO: Helper functions are necessary because components
  // do not follow the iterator protocol; when this change
  // is implemented, the helpers can be removed.
  constructor(
    root: NestedIterable<T>,
    extractIterator = async (v: NestedIterable<T>) => v[Symbol.iterator](),
    checkIterator = (v: NestedIterable<T>) => Symbol.iterator in v,
  ) {
    this.#root = root
    this.#extractIterator = extractIterator
    this.#checkIterator = checkIterator
  }

  [Symbol.asyncIterator](): TimelineIterator<T> {
    // Since initialization is syncronous, we need to
    // do initial setup on the first call to next()
    let initialized = false

    // Setup empty stacks for iterator and output
    const iteratorStack: Iterator<T | NestedIterable<T>>[] = []
    const outputStack: (T | NestedIterable<T>)[] = []
    let tempLeaf: T | undefined = undefined

    const initialize = async (): Promise<void> => {
      if (!initialized) {
        if (this.#checkIterator(this.#root)) {
          iteratorStack.push(await this.#extractIterator(this.#root))
          outputStack.push(this.#root)
        } else {
          // TODO
          tempLeaf = this.#root as unknown as T
        }
        initialized = true
      }
    }

    return {
      initialize,
      next: async (): Promise<IteratorResult<(T | NestedIterable<T>)[]>> => {
        if (!initialized) {
          await initialize()
        }

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
            if (this.#checkIterator(value)) {
              outputStack.push(value)
              iteratorStack.push(await this.#extractIterator(value))
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
      fastForward: async (
        consume: (value: T | NestedIterable<T>, level: number) => boolean,
      ) => {
        // Starting from the root node ...
        // Note that, working on the first level (index 0)
        // means looking (in that iterator) for the entry
        // on the second level.
        let currentLevel = 0

        // Starting from the root node, which is always
        // included in the output ...
        iteratorStack.splice(1)
        outputStack.splice(1)

        // ... rebuild the iterator stack and output level by level
        while (true) {
          const iterator = iteratorStack[currentLevel]
          const [{ value, done }] = fastForward(iterator, v =>
            consume(v, currentLevel),
          )

          // If we reach an iterator that's done,
          // we stop there and let the regular algorithm
          // take over from there (continuing one level up)
          if (done) {
            break
          }

          // Continue if the next entry
          // is also an iterator
          if (this.#checkIterator(value)) {
            iteratorStack.push(await this.#extractIterator(value))
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
      peek: function () {
        const output = []

        for (const [level, iterator] of iteratorStack.entries()) {
          //@ts-ignore
          const idStack = outputStack.slice(1, level + 1).map(c => c.id)

          //@ts-ignore
          if (iterator.peek != undefined) {
            const result = iterator
              //@ts-ignore
              .peek?.()
              //@ts-ignore
              .map(([id, ...rest]) => [[...idStack, id], ...rest])

            output.push(result)
          } else {
            console.error(`Iterator at level ${level} does not support peeking`)
            break
          }
        }

        return output
      },
    }
  }
}
