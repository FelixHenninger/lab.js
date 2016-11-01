
export class Logger {
  constructor(options) {
    this.title = options.title
  }
  
  handle(context, event, ...args) {
    console.log(`Component ${ this.title } received ${ event }`)
  }
}
