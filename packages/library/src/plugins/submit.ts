import { Component } from '../core/component'
import { Plugin } from '../base/plugin'

export default class Submit implements Plugin {
  handle(context: Component, event: string) {
    if (event === 'after:end' && context.global.datastore) {
      const form = document.querySelector(
        'form[name="labjs-data"]',
      ) as HTMLFormElement

      try {
        // Try to insert a file directly into the submission form
        // TODO: Remove the ugly workaround via ClipboardEvent
        // and DataTransfer once there is a standardized way
        // to accomplish this. See the whatwg issue at
        // https://github.com/whatwg/html/issues/3269
        const transfer =
          new ClipboardEvent('').clipboardData || new DataTransfer()
        transfer.items.add(
          new File([context.global.datastore.exportCsv()], 'data.csv'),
        )
        // @ts-expect-error - Typescript doesn't like indexing by string
        form.elements['dataFile'].files = transfer.files
      } catch (error) {
        console.log(
          "Couldn't append data file to form " +
            'falling back to direkt insertion. ' +
            'Error was',
          error,
        )
        // @ts-expect-error - As above
        form.elements['dataRaw'].value = context.global.datastore.exportCsv()
      }

      form.submit()
    }
  }
}
