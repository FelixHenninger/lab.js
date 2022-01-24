import { cloneDeep } from 'lodash'

import { Form, FormOptions } from './form'
import { makePage, PageItem, ImageItem } from './util/page'

const pageDefaults = {
  items: <PageItem[]>[],
  submitButtonText: 'Continue →',
  submitButtonPosition: <'left' | 'right' | 'center'>'right',
  width: <'s' | 'm' | 'l'>'m',
  scrollTop: true,
}

export type PageOptions = FormOptions & typeof pageDefaults

export class Page extends Form {
  options!: PageOptions

  constructor(options: Partial<PageOptions> = {}) {
    super({
      ...cloneDeep(pageDefaults),
      ...options,
    })
  }

  onPrepare() {
    // Generate content
    this.options.content = makePage(this.options.items, {
      submitButtonText: this.options.submitButtonText,
      submitButtonPosition: this.options.submitButtonPosition,
      width: this.options.width,
      rng: this.random,
    })

    // Preload images
    this.options.items
      .filter(isImageItem)
      .forEach(i => this.options.media.images.push(i.src))
  }
}

function isImageItem(item: PageItem): item is ImageItem {
  return 'src' in item && item.type === 'image'
}

Page.metadata = {
  module: ['html'],
  nestedComponents: [],
  parsableOptions: {
    items: {
      type: 'array',
      content: {
        type: 'object',
        content: {
          '*': 'string',
          attributes: {
            type: 'object',
            content: { '*': 'string' },
          },
          options: {
            type: 'array',
            content: {
              type: 'object',
              content: { '*': 'string' },
            },
          },
          items: {
            type: 'array',
            content: {
              type: 'object',
              content: { '*': 'string' },
            },
          },
        },
      },
    },
  },
}
