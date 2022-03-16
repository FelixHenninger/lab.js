import { Component } from '../base/component'
import { Controller as BaseController } from '../base/controller'
import { Store } from '../data/store'
import { ImageCache, AudioCache } from './cache'

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

export class Controller extends BaseController {
  constructor({ root, el }: { root: Component; el?: Element }) {
    const audioContext = new (window.AudioContext ??
      window.webkitAudioContext)()

    // Construct initial component context
    const initialContext = {
      el: el ?? document.querySelector('[data-labjs-section="main"]'),
    }

    if (!initialContext.el) {
      throw new Error('No target element found for study')
    }

    const ds = new Store()

    // Construct initial global variables
    const global = {
      rootEl: initialContext.el,
      datastore: ds,
      state: ds.state,
      cache: {
        images: new ImageCache(),
        audio: new AudioCache(audioContext),
      },
      random: {},
      audioContext: audioContext,
    }

    super({ root, global, initialContext })
  }
}
