import { Component } from '../base/component'
import { Plugin } from '../base/plugin'

const unloadHandler = (e: Event) => {
  const warning = 'Are you sure you want to close this window?'
  //@ts-ignore I know this shouldn't work, but browsers
  // are a lot more messy than typescript assumes
  // (see also the NavigationGuard plugin)
  e.returnValue = warning
  return warning
}

type DownloadPluginOptions = {
  filePrefix?: string
  fileType?: string
}

export default class Download implements Plugin {
  el?: Element
  filePrefix: string
  fileType: string

  constructor({ filePrefix, fileType }: DownloadPluginOptions = {}) {
    this.el = undefined
    this.filePrefix = filePrefix || 'study'
    this.fileType = fileType || 'csv'
  }

  async handle(context: Component, event: string) {
    if (event === 'end') {
      const controller = context.internals.controller
      const ds = controller.global.datastore

      // Make sure the window isn't accidentally closed
      window.addEventListener('beforeunload', unloadHandler)

      // Insert download popover
      this.el = document.createElement('div')
      this.el.className = 'popover'
      this.el.innerHTML = `
        <div class="alert text-center">
          <strong>Download data</strong>
        </div>
      `
      this.el.addEventListener('click', () => {
        ds.download(
          this.fileType,
          ds.makeFilename(this.filePrefix, this.fileType),
        )
        window.removeEventListener('beforeunload', unloadHandler)
      })
      controller.global.el.prepend(this.el)
    }
  }
}
