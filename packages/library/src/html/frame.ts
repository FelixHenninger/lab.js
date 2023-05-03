import { cloneDeep } from 'lodash'
import { ComponentOptions } from '../core/component'
import { Component } from '../core/component'
import { CustomIterable } from '../flow/util/iterable'
import { prepareNested } from '../flow/util/nested'
import { createFragment } from './util/dom'

const frameDefaults = {
  content: <Component | undefined>undefined,
  context: '',
  contextSelector: '',
}

export type FrameOptions = ComponentOptions &
  typeof frameDefaults & {
    content: Component | Component[]
  }

export class Frame extends Component {
  options!: FrameOptions

  constructor(options: Partial<FrameOptions> = {}) {
    super({
      ...cloneDeep(frameDefaults),
      ...options,
    })

    // Stand-in interator
    this.internals.iterator = CustomIterable.emptyIterator()
  }

  async onPrepare() {
    // Wrap content in array if that is not already so
    const content = Array.isArray(this.options.content)
      ? this.options.content
      : [this.options.content]

    // Prepare content
    await prepareNested(content, this)

    // Prepare iterator
    this.internals.iterator = new CustomIterable(content)[Symbol.iterator]()
  }

  enterContext(context: object) {
    const c = super.enterContext(context)
    //@ts-ignore FIXME
    this.internals.outerEl = c.el as HTMLElement
    this.internals.parsedContext = createFragment(this.options.context)
    this.internals.innerEl = this.internals.parsedContext.querySelector(
      this.options.contextSelector,
    )

    return {
      ...c,
      el: this.internals.innerEl,
    }
  }

  leaveContext(context: object) {
    const c = {
      ...context,
      el: this.internals.outerEl,
    }
    delete this.internals.outerEl
    delete this.internals.innerEl
    return super.leaveContext(c)
  }

  async onRun() {
    const outerEl = this.internals.outerEl

    // Insert context
    outerEl.innerHTML = ''
    outerEl.appendChild(this.internals.parsedContext)
  }

  get progress() {
    // Return progress from nested component
    return this.options.content?.progress ?? 0
  }
}

Frame.metadata = {
  module: ['html'],
  nestedComponents: ['content'],
  parsableOptions: {
    context: {},
  },
}
