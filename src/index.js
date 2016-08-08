import { Component, Dummy } from './core'
import { Screen as CanvasScreen, Sequence as CanvasSequence } from './canvas'
import { Screen, Form } from './html'
import { Sequence, Parallel } from './flow'
import { Store } from './data'

const version = '2016.1.0'

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
