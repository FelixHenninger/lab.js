import { Component } from '../component'
import { Controller } from '../controller'

// Event handler to move on in controller
const triggerContinue = function (this: Component, data: any) {
  return this.internals.controller?.continue(this, data)
}

export const flip = async function (
  controller: Controller,
  nextStack: Component[],
  flipData: any,
  context: object = {},
): Promise<[Component[], Component[], boolean, object]> {
  // Keep track of context changes
  let currentContext = context

  // Reconcile the current (outgoing) and incoming stacks:
  const outgoing: Component[] = []
  for (let i = controller.currentStack.length - 1; i >= 0; i--) {
    // First, starting from the bottom, end and remove
    // all components that are no longer active
    if (controller.currentStack[i] !== nextStack[i]) {
      const c = controller.currentStack.pop()
      if (c) {
        c.off('end:uncontrolled', triggerContinue)
        await c.end(flipData.reason, { ...flipData, controlled: true })
        currentContext = c.leaveContext(currentContext)
        outgoing.push(c)
      }
    } else {
      break // Stop after the first match
    }
  }

  const incoming: Component[] = []
  let success = true

  try {
    // Start next component stack, from the top down
    for (let i = 0; i < nextStack.length; i++) {
      if (controller.currentStack[i] !== nextStack[i]) {
        const next = nextStack[i]

        // Start listening for end
        next.on('end:uncontrolled', triggerContinue)

        // Push the component onto the stack
        controller.currentStack.push(next)
        incoming.push(next)

        // Attach context
        currentContext = next.enterContext(currentContext)

        // Components can signal abort the flip,
        // for example if part of the study is skipped
        // TODO:
        // - Investigate whether an exception would be cleaner
        // - Think about moving this responsibility to the
        //   iterator -- maybe this stack just shouldn't be
        //   considered at all?
        await next.run({
          controlled: true,
          ...flipData,
        })
      }
    }
  } catch (e) {
    if (e instanceof AbortFlip) {
      success = false
    } else {
      throw e
    }
  }

  return [outgoing, incoming, success, currentContext]
}

export class AbortFlip extends Error {}
