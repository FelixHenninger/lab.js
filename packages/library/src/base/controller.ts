import { FlipIterable } from './util/iterators/flipIterable'
import { Component } from './component'
import { Lock } from './util/lock'
import { Emitter } from './util/emitter'
import { Store } from '../data'

type global = {
  store?: Store
  [key: string]: any
}

export class Controller extends Emitter {
  root!: Component
  iterable: FlipIterable
  currentStack: Array<Component>

  global: global
  context: object
  private lock: Lock

  flipHandlers: Function[]

  constructor({
    root,
    global = {},
    initialContext = {},
  }: {
    root: Component
    global?: Object
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

    const iterator = this.iterable[Symbol.asyncIterator]()

    // Flip iterator go brrr
    while (!done) {
      const output = await iterator.next([flipData, this.context])
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

  jump(instruction: string, data: any) {
    switch (instruction) {
      case 'abort':
        this.iterable.commandIterable.abort(data.sender)
        data.sender.end('aborted')
        break
      default:
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
