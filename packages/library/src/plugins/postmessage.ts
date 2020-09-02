export default class PostMessage {
  messageType: any

  origin: any

  target: any

  constructor({ origin, target, messageType }: any = {}) {
    this.origin = origin || '*'
    this.target = target || window.parent
    this.messageType = messageType || 'labjs.data'
  }

  handle(context: any, event: any) {
    if (event === 'epilogue') {
      this.target.postMessage(
        {
          type: this.messageType,
          metadata: {
            payload: 'full',
            url: window.location.href,
          },
          raw: context.options.datastore.data,
          json: context.options.datastore.exportJson(),
          csv: context.options.datastore.exportCsv(),
        },
        this.origin,
      )
    }
  }
}
