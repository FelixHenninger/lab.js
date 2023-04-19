import { Component, ComponentOptions } from './component'

/**
 * Dummy component class
 *
 * This type of component does not do anything, it skips directly on to
 * the following component.
 *
 * The `Dummy` component is used largely for testing purposes, and not
 * in any actual studies.
 *
 * @internal
 */
export class Dummy extends Component {
  constructor(options: Partial<ComponentOptions> = {}) {
    super({ ...options, skip: true })
  }
}
