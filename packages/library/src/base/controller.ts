import { TreeIterable } from './util/iterators'
import { Component } from './component'
import { flip } from './util/flip'
import { Lock } from './util/lock'
import { Emitter } from './util/emitter'
import { requestAnimationFrameMaybe } from './util/rAF'

export class Controller extends Emitter {
  root!: Component
  iterable: TreeIterable
  currentStack: Array<Component>

  globals: any
  context: object
  private lock: Lock

  private renderFrameRequest: number | undefined
  private showFrameRequest: number | undefined

  flipHandlers: Function[]

  constructor({
    root,
    globals = {},
    initialContext = {},
  }: {
    root: Component
    globals?: Object
    initialContext?: Object
  }) {
    super('controller')

    // Study root component
    this.root = root
    this.root.internals.controller = this

    // Global data container
    this.globals = globals

    // The TreeIterable breaks a component tree down
    // into a linear sequence of component stacks,
    // which are arrays of the form [root, ..., leaf screen]
    this.iterable = new TreeIterable(root)

    // Keep track of the currently active stack
    this.currentStack = []

    // Setup lock
    this.lock = new Lock()

    // Setup flip handlers
    this.flipHandlers = []

    // Setup leaf context
    this.context = initialContext
  }

  async loop() {
    let flipData = {}
    let stack

    // Watch out for errors while the study runs
    try {
      for (stack of this.iterable) {
        // Controller loop go brrr
        await this.flip(stack, flipData)
        flipData = await this.lock.wait()
      }
      // Flip to empty stack after exhausting available components
      // TODO: It would be good to have the final flip on the iterator
      await this.flip([], flipData)
      await this.emit('end', flipData)
    } catch (error) {
      console.error('Study crashed, error is', error)
      this.trigger('error', { error, stack })
      // Re-throw error
      throw error
    }
  }

  continue(sender: Component, flipData: any) {
    // Continue loop
    const p = this.waitFor('flip:success')
    this.lock.release(flipData)
    return p
  }

  jump(instruction: string, data: any) {
    switch (instruction) {
      case 'abort':
        this.iterable.abort(data.sender)
        break
      default:
    }
  }

  async flip(nextStack: Array<Component>, flipData: any) {
    // Cancel any outstanding frame requests
    this.renderFrameRequest && cancelAnimationFrame(this.renderFrameRequest)
    this.showFrameRequest && cancelAnimationFrame(this.showFrameRequest)

    if (this.globals.debug) {
      console.time('flip')
    }

    // Perform flip
    const [outgoing, incoming, success, context] = await flip(
      this,
      nextStack,
      flipData,
      this.context,
    )

    if (this.globals.debug) {
      console.timeEnd('flip')
    }

    this.context = context
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
      for (let i = 0; i < this.flipHandlers.length; i++) {
        //@ts-ignore FIXME
        this.flipHandlers.pop()()
      }
    }

    if (success) {
      this.emit('flip:success', { success })
      this.lock.acquire()
    } else {
      // Flip again immediately with same data
      this.emit('flip:failure', { success })
      this.lock.release(flipData)
    }
  }

  run() {
    // Queue promise for the next flip
    const flipPromise = new Promise(resolve => {
      this.flipHandlers.push(resolve)
    })

    // Start the loop, but don't wait for it
    const loopPromise = this.loop()

    // The loop promise will only resolve when the study is completed,
    // so there's no real race going on here, but we want to catch any
    // errors that happen before the next flip.
    // TODO: This has a slight smell to it -- it might be worthwhile
    // communicating errors through the flipHandlers instead?
    return Promise.race([flipPromise, loopPromise])
  }
}
