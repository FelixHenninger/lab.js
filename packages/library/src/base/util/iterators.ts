import { Component } from '../component'
import { requestAnimationFrameMaybe } from './rAF'

export class AbortFlip extends Error {}

const triggerContinue = function (this: Component, data: any) {
  return this.internals.controller?.continue(this, data)
}

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

type IteratorOutput = {
  stack: Component[]
  context: object
}

type IteratorInput = [any, object]

export class FlipIterable {
  root: Component
  commandIterable: CommandIterable

  private renderFrameRequest: number | undefined
  private showFrameRequest: number | undefined

  constructor(root: Component) {
    this.root = root
    this.commandIterable = new CommandIterable(root)
  }

  abort(component: Component) {
    this.commandIterable.abort(component)
  }

  [Symbol.asyncIterator](): AsyncIterator<IteratorOutput, any, IteratorInput> {
    return {
      next: async ([flipData, context]: [any, object]) => {
        // Cancel any outstanding frame requests
        this.renderFrameRequest && cancelAnimationFrame(this.renderFrameRequest)
        this.showFrameRequest && cancelAnimationFrame(this.showFrameRequest)

        const incoming: Component[] = []
        const outgoing: Component[] = []

        // Unreasonably optimistic
        let success = true

        // Command loop go brrr
        for (const [command, c, leaf] of this.commandIterable) {
          success = true
          try {
            switch (command) {
              case 'end':
                c.off('end:uncontrolled', triggerContinue)
                await c.end(flipData.reason, { ...flipData, controlled: true })
                context = c.leaveContext(context)
                outgoing.push(c)
                break
              case 'run':
                c.on('end:uncontrolled', triggerContinue)
                incoming.push(c)
                context = c.enterContext(context)
                await c.run({
                  controlled: true,
                  ...flipData,
                })
                break
              default:
            }
          } catch (error) {
            if (error instanceof AbortFlip) {
              this.commandIterable.abort(c)
              success = false
            } else {
              console.error(`Error running ${command} on`, c)
              throw error
            }
          }
          // The flip is done when a leaf node is run
          if (leaf && command === 'run' && success) {
            break
          }
        }

        // Run render method on all incoming components
        if (success) {
          this.renderFrameRequest = requestAnimationFrameMaybe(
            flipData.frameSynced,
            flipData.timestamp,
            t => {
              incoming.map(i => i.render?.({ timestamp: t }))
              this.showFrameRequest = window.requestAnimationFrame(t => {
                incoming.map(i => i.show?.({ timestamp: t }))
                outgoing.map(o => o.lock?.({ timestamp: t }))
                this.showFrameRequest = undefined
              })
              this.renderFrameRequest = undefined
            },
          )
        }

        return {
          done: this.commandIterable.stack.length === 0,
          value: {
            stack: this.commandIterable.stack,
            context,
          },
        }
      },
    }
  }
}
