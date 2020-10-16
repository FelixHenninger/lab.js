import { Component } from '../component'

// Depth-first tree traversal
export class TreeIterable {
  stack: Array<Component>

  constructor(root: Component) {
    this.stack = [root]
  }

  abort(component: Component) {
    const level = this.stack.indexOf(component)
    if (level === -1) {
      console.warn('Aborting from component not in current stack')
    } else {
      this.stack = this.stack.slice(0, level)
    }
  }

  [Symbol.iterator](): Iterator<Array<Component>> {
    return {
      next: () => {
        while (this.stack.length > 0) {
          const currentLevel = this.stack.length - 1
          const currentNode = this.stack[currentLevel]

          if (currentNode.internals.iterator) {
            // Branch node
            const next = currentNode.internals.iterator.next()

            if (next.done) {
              // Move up a level
              this.stack.pop()
            } else {
              // Move down
              const [index, nextNested] = next.value
              this.stack.push(nextNested as Component)
            }
          } else {
            // Leaf node: Yield stack, move up a level
            const output = {
              value: [...this.stack],
              done: false,
            }
            this.stack.pop()
            return output
          }
        }

        // Tree fully traversed
        return { done: true, value: [] }
      },
    }
  }
}
