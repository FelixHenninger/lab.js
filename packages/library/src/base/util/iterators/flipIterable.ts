import { last, range } from 'lodash'

import { Component, Status } from '../../component'
import { requestAnimationFrameMaybe } from '../rAF'
import { SliceIterable } from './timeline'
import { stackSummary } from './interface'
import { EventName } from '../../../base/component'

export const resolveFlip = <T>(oldStack: T[], newStack: T[]) => {
  // Figure out to which level the old and new stack are identical
  let firstDifference = 0
  for (let i of range(Math.max(oldStack.length, newStack.length))) {
    if (oldStack[i] !== newStack[i]) {
      break
    } else {
      firstDifference += 1
    }
  }

  // Split out the remainder of both stacks
  return {
    outgoing: oldStack.slice(firstDifference),
    incoming: newStack.slice(firstDifference),
  }
}

export class AbortFlip extends Error {}

const triggerContinue = async function (this: Component, data: any) {
  return await this.internals.controller?.continue(this, data)
}

type IteratorOutput = {
  stack: Component[]
  context: object
}
type IteratorInput = [any, object]

export interface FlipIterator<T>
  extends AsyncIterator<IteratorOutput, any, IteratorInput> {
  initialize: () => Promise<void>
  splice: (level: number) => void
  findSplice: (value: T) => void
  reset: (level: number) => Promise<void>
  findReset: (value: T) => Promise<void>
  // NOTE: We index by id here, which is inconsistent
  // with the remainder of the interface.
  fastForward: (targetStack: String[], spliceLevel?: number) => Promise<void>
  peek: () => stackSummary
  tempSplice: (level: number, input: IteratorInput) => Promise<any>
}

export class FlipIterable {
  root: Component
  timelineIterable: SliceIterable<Component>

  private renderFrameRequest: number | undefined
  private showFrameRequest: number | undefined

  constructor(root: Component) {
    this.root = root
    this.timelineIterable = new SliceIterable<Component>(
      //@ts-ignore TODO
      root,
      async (c: Component) => {
        if (c.status < Status.prepared) {
          await c.prepare()
        }

        return c.internals.iterator
      },
      (c: Component) => c.internals?.iterator !== undefined,
    )
  }

  [Symbol.asyncIterator](): FlipIterator<Component> {
    const sliceIterator = this.timelineIterable[Symbol.asyncIterator]()
    let currentStack: Component[] = []
    let lockPromises: Promise<any>[] = []
    let restartLeaf = false

    return {
      initialize: async () => {
        await sliceIterator.initialize()
      },
      next: async ([flipData, context]: [any, object]) => {
        // Cancel any outstanding frame requests
        this.renderFrameRequest && cancelAnimationFrame(this.renderFrameRequest)
        this.showFrameRequest && cancelAnimationFrame(this.showFrameRequest)

        let oldStack = [...currentStack]
        let incoming: Component[]
        let outgoing: Component[]
        let cancelled: Component[] = []

        // Wait for previous components to lock before flipping
        await Promise.all(lockPromises)

        // Components can abort a flip. We keep on going until we have performed
        // one full flip.
        flipLoop: while (true) {
          // Keep track of success (unreasonably optimistically)
          let success = true

          // Compute the next stack
          let { value: nextStack } = await sliceIterator.next()

          // TODO: The last output of the iterator returns undefined,
          // so we overwrite that value with an empty stack here.
          // Is there a cleaner solution?
          nextStack = nextStack ?? []

          // Compute incoming and outgoing components based on
          // the current and future stacks
          ;({ incoming, outgoing } = resolveFlip(currentStack, nextStack))

          if (restartLeaf && currentStack.length > 0) {
            //@ts-ignore
            incoming.unshift(currentStack.pop())
            restartLeaf = false
          }

          // End all outgoing components, starting from the leaf
          context = await stopOutgoing(
            outgoing,
            currentStack,
            cancelled,
            flipData,
            context,
          )

          // Start all incoming components, starting from the top of the stack
          for (const c of incoming) {
            try {
              c.internals.emitter.on(EventName.endUncontrolled, triggerContinue)
              context = c.enterContext(context)
              currentStack.push(c)
              await c.run({
                controlled: true,
                ...flipData,
              })
            } catch (error) {
              if (error instanceof AbortFlip) {
                sliceIterator.findSplice(c)

                // Try again with next stack
                continue flipLoop

                // TODO: Ensure that .lock() is called on aborted components
              } else {
                console.error(`Error running`, error, c)
                throw error
              }
            }
          }

          break
        }

        // Compute the final set of incoming components,
        // discarding any that have been skipped in between
        const { incoming: finalIncoming } = resolveFlip(oldStack, currentStack)

        lockPromises = cancelled.map(c =>
          c.internals.emitter.waitFor(EventName.lock),
        )

        // Queue render, show and lock calls for the upcoming frames
        // (note that this takes two frames, one for render and one for show)
        this.renderFrameRequest = requestAnimationFrameMaybe(
          flipData.frameSynced,
          flipData.timestamp,
          t => {
            finalIncoming.map(i => i.render?.({ timestamp: t }))
            // Request frame for post-render callback
            this.showFrameRequest = window.requestAnimationFrame(t => {
              finalIncoming.map(i => i.show?.({ timestamp: t }))
              this.showFrameRequest = undefined
            })
            // Treat locks independently so they aren't cancelled
            window.requestAnimationFrame(t => {
              cancelled.map(c => c.lock?.({ timestamp: t }))
            })
            this.renderFrameRequest = undefined
          },
        )

        return {
          done: currentStack.length === 0,
          value: {
            stack: currentStack,
            context,
          },
        }
      },
      tempSplice: async (
        level: number,
        [flipData, context]: [any, object] = [{}, {}],
      ) => {
        const oldStack = currentStack
        const newStack = currentStack.slice(0, level)

        // There are no incoming components in this flip
        const { outgoing } = resolveFlip(oldStack, newStack)

        // Stop outgoing components
        const newContext = await stopOutgoing(
          outgoing,
          currentStack,
          [],
          flipData,
          context,
        )

        // Reset nested slice iterator
        sliceIterator.splice(level)

        return newContext
      },
      //@ts-ignore
      restartLeaf: () => {
        restartLeaf = true
      },
      splice: sliceIterator.splice,
      findSplice: sliceIterator.findSplice,
      reset: sliceIterator.reset,
      findReset: sliceIterator.findReset,
      fastForward: async (targetStack: String[], spliceLevel = 0) => {
        // Note that the level here is shifted, in that we never
        // fast-forward on the level of the root node.
        // Instead, we search inside the top-level iterator
        // for the second-level node, and so on.
        await sliceIterator.fastForward(
          //@ts-ignore
          (c: Component, level) => {
            // If we're jumping, we usually expect a fully
            // specified target id stack, i.e. the happy path
            // knows that we want to jump to ['1', '1_0', '1_0_0']
            // and that it will find a leaf node there.
            // however, manual jumps may also specify a partial
            // target path, in that only the first elements are
            // given, such as ['1', '1_0'], which might point to
            // a sequence. In these cases, we want to accept any
            // nested component that we find on lower levels,
            // and stop searching immediately.
            if (targetStack[level] === undefined) {
              return true
            } else {
              return targetStack[level] === c.id
            }
          },
          spliceLevel,
        )
      },
      peek: sliceIterator.peek,
    }
  }
}

const stopOutgoing = async function (
  outgoing: Component[],
  currentStack: Component[],
  cancelled: Component[],
  flipData: any,
  context: object,
) {
  for (const c of [...outgoing].reverse()) {
    try {
      c.internals.emitter.off(EventName.endUncontrolled, triggerContinue)
      currentStack.pop()
      cancelled.push(c)
      await c.end(flipData.reason, { ...flipData, controlled: true })
      context = c.leaveContext(context)
    } catch (error) {
      console.error(`Error ending`, error, c)
      throw error
    }
  }
  return context
}
