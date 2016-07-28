import { Component, Dummy } from './core'
import { Screen as CanvasScreen, Sequence as CanvasSequence } from './core-display-canvas'
import { Screen, Form } from './core-display-html'
import { Sequence, Parallel } from './core-flow'
import { Store } from './data'

const version = '2015'

export default {
  version,
  core: {
    Component,
    Dummy,
  },
  canvas: {
    Screen: CanvasScreen,
    Sequence: CanvasSequence,
  },
  html: {
    Screen,
    Form,
  },
  flow: {
    Sequence,
    Parallel,
  },
  data: {
    Store,
  },
}
