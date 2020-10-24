import { Component, ComponentOptions } from './component'

export class Dummy extends Component {
  constructor(options: ComponentOptions) {
    super({ ...options, skip: true })
  }
}
