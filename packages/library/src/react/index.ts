import React from 'react'
import ReactDOM from 'react-dom'

import { Screen, ScreenOptions } from '../html/screen'

export interface ReactScreenOptions<T> extends ScreenOptions {
  component: React.FunctionComponent<T>
  props: T
}

/**
 * ReactScreens have all the features of Screen as well as the
 * ability to render a React component to a DOM element. Simply include
 * a reference to a React.FunctionComponent in the `component` option and its props as the `props` option.
 */
export class ReactScreen<T> extends Screen {
  options!: ReactScreenOptions<T>
  componentDiv?: HTMLElement

  constructor(options: ReactScreenOptions<T>) {
    super(options)
  }

  onRun() {
    super.onRun()
    this.componentDiv = document.createElement('div')
    this.internals.domConnection.el?.appendChild(this.componentDiv)
    const { component, props } = this.options
    const element = React.createElement(component, props)
    ReactDOM.render(element, this.componentDiv)
  }

  onEnd() {
    if (!this.componentDiv) {
      return
    }
    ReactDOM.unmountComponentAtNode(this.componentDiv)
    this.componentDiv.remove()
  }
}
