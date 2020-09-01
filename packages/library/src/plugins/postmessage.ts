export default class PostMessage {
  constructor({ origin, target, messageType }={}) {
    this.origin = origin || '*'
    this.target = target || window.parent
    this.messageType = messageType || 'labjs.data'
  }

  handle(context, event) {
    if (event === 'epilogue') {
      this.target.postMessage({
        type: this.messageType,
        metadata: {
          payload: 'full',
          url: window.location.href,
        },
        raw: context.options.datastore.data,
        json: context.options.datastore.exportJson(),
        csv: context.options.datastore.exportCsv(),
      }, this.origin)
    }
  }
}
