
export default class Logger {
  title: any;

  constructor(options = {}) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'title' does not exist on type '{}'.
    this.title = options.title
  }

  handle(context: any, event: any) {
    console.log(`Component ${ this.title } received ${ event }`)
  }
}
