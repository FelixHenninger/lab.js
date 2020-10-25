import { cloneDeep } from 'lodash'
import { ComponentOptions } from '../base/component'
import { Component } from '../core/component'
import { prepareNested } from '../flow/util/nested'
import { createFragment } from './util/dom'

const frameDefaults = {
  content: <Component | undefined>undefined,
  context: '',
  contextSelector: '',
}

type FrameOptions = ComponentOptions & typeof frameDefaults

export class Frame extends Component {
  constructor(options: Partial<FrameOptions> = {}) {
    super({
      ...cloneDeep(frameDefaults),
      ...options,
    })
  }

  async onPrepare() {
    // Prepare content
    await prepareNested([this.options.content], this)

    // Prepare iterator
    this.internals.iterator = [this.options.content].entries()
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
    return this.options.content.progress
  }
}

Frame.metadata = {
  module: ['html'],
  nestedComponents: ['content'],
  parsableOptions: {
    context: {},
  },
}
