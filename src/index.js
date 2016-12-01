import { Component, Dummy } from './core'
import { Screen as CanvasScreen, Sequence as CanvasSequence } from './canvas'
import { Screen, Form, Frame } from './html'
import { Sequence, Parallel } from './flow'
import { Store } from './data'
import { Random } from './util/random'
import fromObject from './util/fromObject'
import Logger from './plugins/log'

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
    Frame,
  },
  flow: {
    Sequence,
    Parallel,
  },
  data: {
    Store,
  },
  plugins: {
    Logger,
  },
  util: {
    Random,
    fromObject,
  },
}
