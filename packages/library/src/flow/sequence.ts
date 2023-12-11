import { cloneDeep } from 'lodash'

import { Status } from '../base/component'
import { Component, ComponentOptions } from '../core/component'

import { CustomIterable } from './util/iterable'
import { prepareNested } from './util/nested'
import { calcProgress } from './util/progress'

const sequenceDefaults = {
  /** Constituent components of the sequence */
  content: <Component[]>[],
  /** Whether to shuffle the content before running */
  shuffle: false,
  /** Optional parameter name to supply an index to nested components */
  indexParameter: <string | undefined>undefined,
}

export type SequenceOptions = ComponentOptions & typeof sequenceDefaults

/**
 * A sequence combines an array of other components and runs them sequentially
 */
export class Sequence extends Component {
  declare options: SequenceOptions

  constructor(options: Partial<SequenceOptions> = {}) {
    super({
      ...cloneDeep(sequenceDefaults),
      ...options,
    })

    // Stand-in iterator
    this.internals.iterator = CustomIterable.emptyIterator()
  }

  async onPrepare() {
    // Shuffle content, if requested
    if (this.options.shuffle) {
      this.options.content = this.random.shuffle(this.options.content)
    }

    // Optionally add index parameter
    if (this.options.indexParameter !== undefined) {
      this.options.content.forEach(
        (c: Component, i: number) =>
          (c.options.parameters[this.options.indexParameter!] = i),
      )
    }

    // Define an iterator over the content
    this.internals._iterable = new CustomIterable(this.options.content)
    this.internals.iterator = this.internals._iterable[Symbol.iterator]()

    // Prepare nested items
    await prepareNested(this.options.content, this)
  }

  async end(reason?: string, flipData: any = {}) {
    // TODO: This should operate on the iterator, not the iterable
    this.internals._iterable.flush()
    return super.end(reason, flipData)
  }

  get progress() {
    // If the sequence has ended, report it as completed
    // (even if content was skipped)
    return this.status === Status.done ? 1 : calcProgress(this.options.content)
  }
}

Sequence.metadata = {
  module: ['flow'],
  nestedComponents: ['content'],
  parsableOptions: {
    shuffle: { type: 'boolean' },
  },
}
