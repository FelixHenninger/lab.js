import { Component } from '../../component'
import { requestAnimationFrameMaybe } from '../rAF'
import { CommandIterable } from './commandIterable'

export class AbortFlip extends Error {}

const triggerContinue = function (this: Component, data: any) {
  return this.internals.controller?.continue(this, data)
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
                c.internals.emitter.off('end:uncontrolled', triggerContinue)
                await c.end(flipData.reason, { ...flipData, controlled: true })
                context = c.leaveContext(context)
                outgoing.push(c)
                break
              case 'run':
                c.internals.emitter.on('end:uncontrolled', triggerContinue)
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
