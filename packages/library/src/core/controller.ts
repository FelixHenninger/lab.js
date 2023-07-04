import { Component } from './component'
import { Controller as BaseController } from '../base/controller'
import { Row, Store } from '../data/store'
import { ImageCache, AudioCache } from './cache'

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

export interface ControllerGlobal {
  rootEl: Element
  datastore: Store<Row>
  state: Row
  cache: {
    images: ImageCache
    audio: AudioCache
  }
  random: Record<string, any>
  audioContext: AudioContext
  [key: string]: any
}

/**
 * Study controller class
 *
 * The study controller is responsible for running the components in
 * sequence, preparing them in time, and jumping between sections of a
 * study. It also provides a common context of global settings that is
 * shared across all of a study's components.
 *
 * You will rarely need to create a controller manually -- one is
 * instantiated by default for a study as soon as it starts running, if
 * not supplied.
 *
 * @internal
 */
export class Controller extends BaseController<Component> {
  global!: ControllerGlobal

  /**
   * Create a new controller
   */
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
