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
 * a reference to a React.FunctionComponent in the `component` option and its props within the `props` option.
 */
export class ReactScreen<T> extends Screen {
  componentDiv?: HTMLElement
  component: React.FC<T>
  props: T

  constructor(options: ReactScreenOptions<T>) {
    super(options)
    this.component = options.component
    this.props = options.props
  }

  onRun() {
    super.onRun()
    this.componentDiv = document.createElement('div')
    this.global.rootEl?.appendChild(this.componentDiv)
    const element = React.createElement(this.component, this.props)
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
