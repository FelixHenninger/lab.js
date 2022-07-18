import { FlipIterable, FlipIterator } from './util/iterators/flipIterable'
import { Component } from './component'
import { Lock } from './util/lock'
import { Emitter } from './util/emitter'
import { Store } from '../data'

export class Controller extends Emitter {
  root!: Component
  iterable: FlipIterable
  iterator: FlipIterator<Component>
  currentStack: Array<Component>

  global: Record<string, any>
  context: object
  private lock: Lock

  flipHandlers: Function[]

  constructor({
    root,
    global = {},
    initialContext = {},
  }: {
    root: Component
    global?: Record<string, any>
    initialContext?: Object
  }) {
    super('controller')

    // Study root component
    this.root = root
    this.root.internals.controller = this

    // Global data container
    this.global = global

    // The FlipIterable breaks a component tree down
    // into a linear sequence of flips between stacks of components
    this.iterable = new FlipIterable(root)

    // TODO: This isn't great: We really want one iterator
    // per call to .loop(), so that we can discard it later.
    // That being said, right now, we can't wait until the
    // study is running to setup the iterator, because calls
    // to .jump() might come in during study preparation.
    // (also, because the iterator was already saved as an
    // property on the controller, it would stick around
    // in memory regardless)
    //
    // It's unclear how best to proceed: We could use a lock
    // and block jumps until the study is running, or change
    // downstream logic to jump only after the study has
    // started (which might lead to visible cuts).
    //
    // Another side-effect of this solution is that we have
    // to manually ensure that the iterator is initialized
    // before we use it (see code below). It would be nice,
    // if that could just happen transparently on the first
    // call to .next() or to .jump(), as it did prior to
    // this change.
    this.iterator = this.iterable[Symbol.asyncIterator]()

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
    let done = false

    // See above
    await this.iterator.initialize()

    // Flip iterator go brrr
    while (!done) {
      const output = await this.iterator.next([flipData, this.context])
      done = output.done ?? true
      this.context = output.value.context
      this.currentStack = output.value.stack
      await this.emit('flip', flipData)
      for (let i = 0; i < this.flipHandlers.length; i++) {
        this.flipHandlers.pop()?.()
      }
      if (!done) {
        flipData = await this.lock.acquire()
      }
    }

    await this.emit('end', flipData)
  }

  continue(sender: Component, flipData: any) {
    // Continue loop
    const p = this.waitFor('flip')
    this.lock.release(flipData)
    return p
  }

  async jump(instruction: string, data: any) {
    // Initialize iterator (see above)
    await this.iterator.initialize()

    // TODO: The implementation is baked into this (internal) API,
    // may need an abstraction later. (there used to be a passthrough
    // function on the flipIterable this was dropped)
    switch (instruction) {
      case 'abort':
        this.iterator?.findSplice(data.sender)
        data.sender.end('aborted')
        break
      case 'fastforward':
        await this.iterator?.fastForward(data.target)
        break
      default:
        console.error(`Unknown jump instruction ${instruction}`)
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
