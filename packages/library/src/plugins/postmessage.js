export default class PostMessage {
  constructor({ origin, target }) {
    this.origin = origin || '*'
    this.target = target || parent
  }

  handle(context, event) {
    if (event === 'epilogue') {
      this.target.postMessage({
        type: 'labjs.data',
        metadata: {
          payload: 'full',
          url: window.location.href,
        },
        data: context.options.datastore.data,
        json: context.options.datastore.exportJson(),
        csv: context.options.datastore.exportCsv(),
      }, this.origin)
    }
  }
}
