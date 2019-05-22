export default class Submit {
  handle(context, event) {
    if (event === 'after:end' && context.options.datastore) {
      const form = document.querySelector('form[name="labjs-data"]')

      try {
        // Try to insert a file directly into the submission form
        // TODO: Remove the ugly workaround via ClipboardEvent
        // and DataTransfer once there is a standardized way
        // to accomplish this. See the whatwg issue at
        // https://github.com/whatwg/html/issues/3269
        const transfer = new ClipboardEvent('').clipboardData ||
          new DataTransfer()
        transfer.items.add(
          new File([context.options.datastore.exportCsv()], 'data.csv')
        )
        form.elements['dataFile'].files = transfer.files
      } catch (error) {
        console.log(
          'Couldn\'t append data file to form ' +
          'falling back to direkt insertion. ' +
          'Error was', error
        )
        form.elements['dataRaw'].value = context.options.datastore.exportCsv()
      }

      form.submit()
    }
  }
}
