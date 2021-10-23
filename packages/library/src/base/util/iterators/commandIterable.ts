import { Component } from '../../component'

export class CommandIterable {
  stack: Component[]
  abortLevel?: number

  constructor(root: Component) {
    this.stack = [root]
  }

  abort(component: Component) {
    const level = this.stack.indexOf(component)
    if (level === -1) {
      throw new Error('Aborting from component not in current stack')
    } else {
      this.abortLevel = level
    }
  }

  [Symbol.iterator](): Iterator<[string, Component, boolean]> {
    return {
      next: (): IteratorResult<[string, Component, boolean]> => {
        const currentLevel = this.stack.length - 1
        const currentNode = this.stack[currentLevel]
        const leaf = currentNode?.internals.iterator === undefined

        // Special cases:
        if (this.stack.length === 0) {
          // Root component done
          return {
            done: true,
            value: ['done', currentNode, leaf],
          }
        } else if (
          this.abortLevel !== undefined &&
          currentLevel >= this.abortLevel
        ) {
          // Component abort
          this.stack.pop()
          return {
            done: false,
            value: ['end', currentNode, leaf],
          }
        } else if (this.abortLevel && currentLevel < this.abortLevel) {
          // Abort done
          this.abortLevel = undefined
        } else if (currentNode.status < 2) {
          // Root component not started
          return {
            done: false,
            value: ['run', currentNode, leaf],
          }
        }

        const nested = currentNode.internals.iterator?.next().value?.[1]

        if (nested) {
          // Move down
          const nestedLeaf = nested?.internals.iterator === undefined
          this.stack.push(nested)
          return {
            done: false,
            value: ['run', nested, nestedLeaf],
          }
        } else {
          // Move up
          this.stack.pop()
          return {
            done: false,
            value: ['end', currentNode, leaf],
          }
        }
      },
    }
  }
}
