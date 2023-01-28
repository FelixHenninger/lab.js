import { cloneDeep } from 'lodash'

import { Component, ComponentOptions } from '../core/component'

// html.Screens display HTML when run
const screenDefaults = {
  content: '',
}

export type ScreenOptions = ComponentOptions & typeof screenDefaults

export class Screen extends Component {
  options!: ScreenOptions

  constructor(options: Partial<ScreenOptions> = {}) {
    super({
      ...cloneDeep(screenDefaults),
      ...options,
    })
  }

  onRun() {
    // Insert specified content into element
    this.internals.context.el.innerHTML = this.options.content
  }
}

Screen.metadata = {
  module: ['html'],
  nestedComponents: [],
  parsableOptions: {
    content: {},
  },
}
