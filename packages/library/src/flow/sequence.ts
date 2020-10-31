import { cloneDeep } from 'lodash'

import { Status as status } from '../base/component'
import { Component, ComponentOptions } from '../core/component'

import { CustomIterator } from './util/iterator'
import { prepareNested } from './util/nested'
import { mean } from '../util/stats'

const sequenceDefaults = {
  content: <Component[]>[],
  shuffle: false,
  indexParameter: <string | undefined>undefined,
}

export type SequenceOptions = ComponentOptions & typeof sequenceDefaults

// A sequence combines an array of other
// components and runs them sequentially
export class Sequence extends Component {
  constructor(options: Partial<SequenceOptions> = {}) {
    super({
      ...cloneDeep(sequenceDefaults),
      ...options,
    })

    // Stand-in interator
    // TODO: Consider replacing me
    this.internals.iterator = {}
  }

  async onPrepare() {
    // Shuffle content, if requested
    if (this.options.shuffle) {
      this.options.content = this.random.shuffle(this.options.content)
    }

    // Optionally add index parameter
    if (this.options.indexParameter) {
      this.options.content.forEach(
        (c: Component, i: number) =>
          (c.options.parameters[this.options.indexParameter] = i),
      )
    }

    // Define an iterator over the content
    this.internals._iterator = new CustomIterator(
      this.options.content.entries(),
    )
    this.internals.iterator = this.internals._iterator[Symbol.iterator]()

    // Prepare nested items
    await prepareNested(this.options.content, this)
  }

  async end(reason: string, flipData: any) {
    this.internals._iterator.flush()
    return super.end(reason, flipData)
  }

  get progress() {
    // If the sequence has ended, report it as completed
    // (even if content was skipped)
    return this.status === status.done
      ? 1
      : mean(this.options.content.map((c: Component) => c.progress))
  }
}

Sequence.metadata = {
  module: ['flow'],
  nestedComponents: ['content'],
  parsableOptions: {
    shuffle: { type: 'boolean' },
  },
}
