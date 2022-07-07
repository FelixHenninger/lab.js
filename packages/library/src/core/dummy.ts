import { Component, ComponentOptions } from './component'

export class Dummy extends Component {
  constructor(options: Partial<ComponentOptions> = {}) {
    super({ ...options, skip: true })
  }
}
