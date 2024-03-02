import { FlipIterable, FlipIterator } from './util/iterators/flipIterable'
import { Component } from './component'
import { Lock } from './util/lock'
import { Emitter } from './util/emitter'

import { last } from 'lodash'

export class Controller<C extends Component = Component> extends Emitter {
  root!: C
  iterable: FlipIterable
  iterator: FlipIterator<C>
  currentStack: Array<C>

  global: Record<string, any>
  context: Record<string, any>
  private lock: Lock

  flipHandlers: Function[]

  constructor({
    root,
    global = {},
    initialContext = {},
  }: {
    root: C
    global?: Record<string, any>
    initialContext?: Record<string, any>
  }) {
    super('controller')

    // Study root component
    this.root = root
    //@ts-ignore
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
      const lockPromise = this.lock.acquire()
      done = output.done ?? true
      this.context = output.value.context
      this.currentStack = output.value.stack
      await this.emit('flip', flipData)
      for (let i = 0; i < this.flipHandlers.length; i++) {
        this.flipHandlers.pop()?.()
      }
      if (!done) {
        flipData = await lockPromise
      } else {
        this.lock.release()
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
        await data.sender.end('aborted')
        break
      case 'rerun':
        // The timeline iterator does not keep track of the current
        // leaf component, and consequently its reset method does not
        // find and cannot access it.
        // Because a reset does not affect the overall experiment
        // state, we (currently) trigger it directly from here.
        if (data.sender === this.currentLeaf) {
          //@ts-ignore
          await this.currentLeaf._reset()
        } else {
          // Reset iterator state
          await this.iterator?.findReset(data.sender)
          // Continue from there
          await this.continue(data.sender, {})
        }
        break
      case 'reset':
        // As above, there needs to be an exception for the current
        // leaf component
        if (data.level === this.currentStack.length) {
          //@ts-ignore
          await this.currentLeaf._reset()
        } else {
          // Reset iterator state
          await this.iterator?.reset(data.level)
          // Continue from there
          await this.continue(data.sender, {})
        }
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

  get currentLeaf() {
    return last(this.currentStack) as Component
  }
}
