import { isEqual } from 'lodash'
import { Component } from '../../component'

const isLeaf = (node: Component) => node.internals.iterator === undefined

export class CommandIterable {
  stack: Component[]
  targetStack: Component[] | undefined
  abortLevel?: number

  constructor(root: Component) {
    this.stack = [root]
    this.targetStack = undefined
  }

  abort(component: Component) {
    const level = this.stack.indexOf(component)
    if (level === -1) {
      throw new Error('Aborting from component not in current stack')
    } else {
      this.targetStack = this.stack.slice(0, level)
    }
  }

  [Symbol.iterator](): Iterator<[string, Component, boolean]> {
    return {
      next: (): IteratorResult<[string, Component, boolean]> => {
        const currentLevel = this.stack.length - 1
        const currentNode = this.stack[currentLevel]

        // Special cases:
        if (this.stack.length === 0) {
          // Root component done: Stack clear
          return {
            done: true,
            value: ['done', undefined, true],
          }
        } else if (currentNode.status < 2) {
          // Root component not started
          return {
            done: false,
            value: ['run', currentNode, isLeaf(currentNode)],
          }
        } else if (this.targetStack) {
          // Transition to target stack
          if (isEqual(this.stack, this.targetStack)) {
            // If transition is complete, clear targetStack and move on
            this.targetStack = undefined
          } else if (
            isEqual(this.stack, this.targetStack.slice(0, this.stack.length))
          ) {
            // If the transition is partially complete,
            // append the next stack level
            const nested = this.targetStack[currentLevel + 1]
            this.stack.push(nested)
            return {
              done: false,
              value: ['run', nested, isLeaf(nested)],
            }
          } else {
            // Otherwise, move up a level
            this.stack.pop()
            return {
              done: false,
              value: ['end', currentNode, isLeaf(currentNode)],
            }
          }
        }

        // Note that this assumes an array-like iterator
        // that returns [index, value] pairs
        const nested = currentNode.internals.iterator?.next().value?.[1]

        if (nested) {
          // Move down
          this.stack.push(nested)
          return {
            done: false,
            value: ['run', nested, isLeaf(nested)],
          }
        } else {
          // Move up
          this.stack.pop()
          return {
            done: false,
            value: ['end', currentNode, isLeaf(currentNode)],
          }
        }
      },
    }
  }
}
