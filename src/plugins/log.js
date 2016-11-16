
export default class Logger {
  constructor(options) {
    this.title = options.title
  }

  handle(context, event) {
    console.log(`Component ${ this.title } received ${ event }`)
  }
}
